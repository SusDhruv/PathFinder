import { inngest } from "./client";
import { createAgent } from '@inngest/agent-kit';
import { gemini } from "inngest";
import ImageKit from "imagekit";
import { HistoryTable } from "@/configs/schema";
import { db } from "@/configs/db";
import { eq } from "drizzle-orm";
import { usersTable } from "@/configs/schema";


export const aiCareerAgent = createAgent({
    name: 'AiCareerChatAgent',
    description: 'An AI agent that answers career related questions',
    system: 'PathMentor is an AI-powered career guidance agent designed to help users navigate their professional journey with clarity and purpose.Based  input and real-time job market trends, the AI recommends personalized career paths—such as software engineering, data science, UI/UX design, or product management—outlining the specific skills, tools, and qualifications needed for each. PathMentor then generates tailored learning plans that include curated online courses project ideas, and estimated timelines to achieve key milestones.',
    model: gemini({
        model: "gemini-2.5-flash",
        apiKey: process.env.GEMINI_API_KEY
    })
});

export const CareerAgent = inngest.createFunction(
    { id: 'AiCareerAgent' },
    { event: 'AiCareerAgent' },
    async ({ event, step }) => {
        try {
            const { userInput } = event?.data;
            if (!userInput) throw new Error("No userInput provided");
            console.log("userInput:", userInput);
            const result = await aiCareerAgent.run(userInput);
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
      const aiResumeReport = await AiResumeAnalyzerAgent.run(pdfText);

      // Extract and parse the content as JSON
      let contentStr = '';
      if (
        aiResumeReport &&
        typeof aiResumeReport === 'object' &&
        Array.isArray(aiResumeReport.output) &&
        aiResumeReport.output[0] &&
        typeof aiResumeReport.output[0] === 'object' &&
        'content' in aiResumeReport.output[0]
      ) {
        contentStr = String(aiResumeReport.output[0].content);
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
          userEmail?: string;
        } = {
          recordId,
          content: parsed,
          aiAgentType,
          createdAt: new Date()
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