import { inngest } from "./client";
import { createAgent } from '@inngest/agent-kit';
import { gemini } from "inngest";
import ImageKit from "imagekit";
import { HistoryTable } from "@/configs/schema";
import { db } from "@/configs/db";
import { eq } from "drizzle-orm";
import { usersTable } from "@/configs/schema";
import { metadata } from "@/app/layout";


export const aiCareerAgent = createAgent({
    name: 'AiCareerChatAgent',
    description: 'An AI agent that answers career related questions',
    system: `You are PathFinder, an expert AI career coach. Answer user questions about careers, skills, and job search in 2-4 clear, direct sentences. Avoid unnecessary details, disclaimers, or long-winded explanations. Respond as quickly and concisely as possible, focusing on actionable advice and clarity.`,
    model: gemini({
        model: "gemini-2.5-flash",
        apiKey: process.env.GEMINI_API_KEY
    })
});

// Helper to add timeout to a promise
function withTimeout(promise: Promise<any>, ms: number): Promise<any> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('AI agent timed out after 15 seconds')), ms);
    promise
      .then((value: any) => {
        clearTimeout(timer);
        resolve(value);
      })
      .catch((err: any) => {
        clearTimeout(timer);
        reject(err);
      });
  });
}

export const CareerAgent = inngest.createFunction(
    { id: 'AiCareerAgent' },
    { event: 'AiCareerAgent' },
    async ({ event, step }) => {
        try {
            const { userInput } = event?.data;
            if (!userInput) throw new Error("No userInput provided");
            console.log("userInput:", userInput);
            const result = await withTimeout(aiCareerAgent.run(userInput), 10000);
            console.log("result:", result);
            if (!result) throw new Error("No result from aiCareerAgent");
            return result;
        } catch (e) {
            console.error("AiCareerAgent error:", e);
            throw e;
        }
    }
);

var imagekit = new ImageKit({
    //@ts-ignore
    publicKey : process.env.IMAGEKIT_PUBLIC_KEY,
    //@ts-ignore
    privateKey : process.env.IMAGEKIT_PRIVATE_KEY,
    //@ts-ignore
    urlEndpoint : process.env.IMAGEKIT_ENDPOINT_URL
});

export const AiResumeAnalyzerAgent = createAgent({
    name: 'AiResumeAnalyzerAgent',
    description: 'Analyzes resumes and returns a structured JSON report.',
    system: `You are an advanced AI Resume Analyzer Agent.

Your task is to evaluate a candidate's resume and return a detailed analysis in the following structured JSON schema format.

The schema must match the layout and structure of a visual UI that includes overall score, section scores, summary feedback, improvement tips, strengths, and weaknesses.

INPUT: I will provide a plain text resume.

GOAL: Output a JSON report as per the schema below. The report should reflect:

overall_score (0–100)
overall_feedback (short message e.g., "Excellent", "Needs improvement")
summary_comment (1–2 sentence evaluation summary)
Section scores for:
  - Contact Info
  - Experience
  - Education
  - Skills

Each section should include:
  - score (as percentage)
  - Optional comment about that section

tips_for_improvement: 3–5 tips
whats_good: 1–3 strengths
needs_improvement: 1–3 weaknesses

Output JSON Schema Example:
{
  "overall_score": 85,
  "overall_feedback": "Excellent!",
  "summary_comment": "Your resume is strong, but there are areas to refine.",
  "sections": {
    "contact_info": {
      "score": 95,
      "comment": "Perfectly structured and complete."
    },
    "experience": {
      "score": 88,
      "comment": "Strong bullet points and impact."
    },
    "education": {
      "score": 70,
      "comment": "Consider adding relevant coursework."
    },
    "skills": {
      "score": 60,
      "comment": "Expand on specific skill proficiencies."
    }
  },
  "tips_for_improvement": [
    "Add more numbers and metrics to your experience section to show impact.",
    "Integrate more industry-specific keywords relevant to your target roles.",
    "Start bullet points with strong action verbs to make your achievements stand out."
  ],
  "whats_good": [
    "Clean and professional formatting.",
    "Clear and concise contact information.",
    "Relevant work experience."
  ],
  "needs_improvement": [
    "Skills section lacks detail.",
    "Some experience bullet points could be stronger.",
    "Missing a professional summary/objective."
  ]
}
`,
    model: gemini({
        model: "gemini-2.5-flash",
        apiKey: process.env.GEMINI_API_KEY
    })
});

export const AiResumeAgent = inngest.createFunction(
  { id: 'AiResumeAgent' },
  { event: 'AiResumeAgent' },
  async ({ event, step }) => {
    try {
      const { recordId, base64, pdfText } = event.data;

      // Upload the PDF to ImageKit
      const imageKitFile = await imagekit.upload({
        file: base64,
        fileName: `${Date.now()}.pdf`,
      });
      if (!imageKitFile.url) {
        throw new Error("No URL returned from ImageKit. Full response: " + JSON.stringify(imageKitFile));
      }

      // Run the resume analyzer agent on the extracted PDF text
      const aiResumeReport = await withTimeout(AiResumeAnalyzerAgent.run(pdfText), 15000);

      // Extract and parse the content as JSON
      let contentStr = '';
      if (
        aiResumeReport &&
        typeof aiResumeReport === 'object' &&
        Array.isArray((aiResumeReport as any).output) &&
        (aiResumeReport as any).output[0] &&
        typeof (aiResumeReport as any).output[0] === 'object' &&
        'content' in (aiResumeReport as any).output[0]
      ) {
        contentStr = String((aiResumeReport as any).output[0].content);
      } else if (typeof aiResumeReport === 'string') {
        contentStr = aiResumeReport;
      } else {
        throw new Error('Unsupported aiResumeReport format');
      }
      const cleaned = contentStr.replace(/```json|```/g, '').trim();
      try {
        const parsed = JSON.parse(cleaned);
        // After parsing the JSON object from the AI output
        // Define aiAgentType and userEmail as needed
        const aiAgentType = "AiResumeAnalyzerAgent";
        // Only include userEmail if it's explicitly provided
        const baseInsertData: {
          recordId: string;
          content: any;
          aiAgentType: string;
          createdAt: Date;
          fileUrl: string;
          userEmail?: string;
        } = {
          recordId,
          content: parsed,
          aiAgentType,
          createdAt: new Date(),
          fileUrl: imageKitFile.url
        };

        const saveToDb = await step.run('saveToDb', async () => {
          try {
            // If userEmail is provided, verify it exists in users table first
            if (event.data?.userEmail) {
              const user = await db.select().from(usersTable).where(eq(usersTable.email, event.data.userEmail)).limit(1);
              if (user.length > 0) {
                baseInsertData.userEmail = event.data.userEmail;
              }
            }
            
            const result = await db.insert(HistoryTable).values(baseInsertData);
            return result;
          } catch (err) {
            console.error("DB Insert Error:", err);
            throw err;
          }
        });
        return parsed; // ✅ Only return the answer content as a JSON object
      } catch (e) {
        throw new Error('Invalid JSON in aiResumeReport output: ' + cleaned);
      }
    } catch (e) {
      console.error("AiResumeAgent error:", e);
      throw e;
    }
  }
);

export const AIRoadmapGeneratorAgent = createAgent({
  name: "AIRoadmapGeneratorAgent",
  description: "Generates a React flow tree-structured learning roadmap for a given position or skills.",
  system: `You are an expert roadmap generator. Given a user input (position or skills), generate a vertical, tree-structured learning roadmap in JSON for React Flow.
- Limit the roadmap to 8–12 nodes and 10–15 edges for speed.
- The roadmap must be clear, concise, and visually spaced (like roadmap.sh).
- Order steps from fundamentals to advanced, with branching for specializations if needed.
- Each node: unique id, type 'turbo', x/y position, title, short description, and a learning resource link.
- Each edge: unique id, source, and target.
- Make node positions spacious for readability.
- Respond ONLY with a JSON object in this format:
{
  "roadmapTitle": "",
  "description": "<3-5 lines>",
  "duration": "",
  "initialNodes": [ ... ],
  "initialEdges": [ ... ]
}
Do not include any extra text or explanation. Be as fast and efficient as possible. Avoid unnecessary detail.`,
  model: gemini({
    model: "gemini-2.5-flash",
    apiKey: process.env.GEMINI_API_KEY
  })
});

export const AIRoadMapAgent = inngest.createFunction(
  { id: 'AiRoadMapAgent' },
  { event: 'AiRoadMapAgent' },
  async ({ event, step }) => {
    const { roadmapId, userInput, userEmail } = event.data;
    let roadmapResult;
    try {
      roadmapResult = await withTimeout(AIRoadmapGeneratorAgent.run(userInput), 15000);
    } catch (err) {
      throw new Error('AI agent timed out after 15 seconds');
    }
    let content = null;
    if (
      roadmapResult &&
      typeof roadmapResult === 'object' &&
      Array.isArray((roadmapResult as any).output) &&
      (roadmapResult as any).output[0] &&
      typeof (roadmapResult as any).output[0] === 'object' &&
      'content' in (roadmapResult as any).output[0]
    ) {
      const rawContent = (roadmapResult as any).output[0].content;
      if (typeof rawContent === 'string') {
        const cleaned = rawContent.replace(/```json|```/g, '').trim();
        content = JSON.parse(cleaned);
      } else {
        content = rawContent;
      }
    }
    // Save to DB
    if (content) {
      const aiAgentType = 'AiRoadMapAgent';
      let baseInsertData: any = {
        recordId: roadmapId,
        content: content,
        aiAgentType,
        createdAt: new Date(),
        metadData:userInput
      };
      if (userEmail) {
        baseInsertData.userEmail = userEmail;
      }
      await step.run('saveToDb', async () => {
        try {
          await db.insert(HistoryTable).values(baseInsertData);
        } catch (err) {
          console.error('DB Insert Error:', err);
          throw err;
        }
      });
    }
    return content;
  }
);