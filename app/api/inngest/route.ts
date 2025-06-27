import { serve } from "inngest/next";
import { inngest } from "../../../inngest/client";
import { AiResumeAgent, AIRoadMapAgent, CareerAgent } from "@/inngest/functions";
import ReactMarkdown from 'react-markdown';

// Create an API that serves zero functions
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    /* your functions will be passed here later! */
    CareerAgent,
    AiResumeAgent,
    AIRoadMapAgent
    
  ],
});
