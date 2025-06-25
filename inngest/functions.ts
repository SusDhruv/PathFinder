import { inngest } from "./client";
import { createAgent } from '@inngest/agent-kit';
import { gemini } from "inngest";

export const helloWorld = inngest.createFunction(
  { id: "hello-world" },
  { event: "test/hello.world" },
  async ({ event, step }) => {
    await step.sleep("wait-a-moment", "1s");
    return { message: `Hello ${event.data.email}!` };
  },
);

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