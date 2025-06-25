import { inngest } from "../../../inngest/client";;
import axios from "axios";
import { NextResponse } from "next/server";

export async function POST(req:any) {
  try {
    const {userInput} = await req.json();
    if (!userInput) {
      console.log('Missing userInput');
      return NextResponse.json({ error: "Missing userInput" }, { status: 400 });
    }
    let resultIds;
    try {
      resultIds = await inngest.send({
        name: 'AiCareerAgent',
        data: { userInput }
      });
    } catch (sendError) {
      console.error('Error sending event to Inngest:', sendError);
      return NextResponse.json({ error: 'Failed to send event to Inngest', details: sendError instanceof Error ? sendError.message : sendError }, { status: 500 });
    }
    console.log('resultIds:', resultIds);
    const runId = resultIds.ids[0];
    let runStatus;
    let attempts = 0;
    while (true) {
      runStatus = await getRuns(runId);
      console.log('runStatus:', runStatus);
      if (runStatus?.data?.[0]?.status === 'Completed') break;
      if (runStatus?.data?.[0]?.status === 'Failed') {
        console.log('Agent run failed:', runStatus);
        return NextResponse.json({ error: 'Agent run failed', details: runStatus }, { status: 500 });
      }
      attempts++;
      if (attempts > 40) { // 20 seconds max
        console.log('Timeout waiting for agent response:', runStatus);
        return NextResponse.json({ error: 'Timeout waiting for agent response', details: runStatus }, { status: 504 });
      }
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    const output = runStatus.data?.[0]?.output?.output?.[0];
    console.log('output:', output);
    if (!output) {
      console.log('No output from agent:', runStatus);
      return NextResponse.json({ error: 'No output from agent', details: runStatus }, { status: 502 });
    }
    // Improved: Try to extract a human-readable answer
    let markdownOutput = '';
    if (typeof output === 'string') {
      markdownOutput = output;
    } else if (typeof output === 'object' && output !== null) {
      if (output.content) {
        markdownOutput = output.content;
      } else if (output.message) {
        markdownOutput = output.message;
      } else {
        markdownOutput = Object.entries(output)
          .map(([key, value]) => `**${key}:** ${typeof value === 'string' ? value : JSON.stringify(value)}`)
          .join('\n\n');
      }
    } else {
      markdownOutput = String(output);
    }
    return NextResponse.json(markdownOutput);
  } catch (e) {
    const err = e as any;
    console.error('API error:', err);
    return NextResponse.json({ error: err.message || 'Server error', stack: err.stack }, { status: 500 });
  }
}

export async function getRuns(runId:string) {
    const result = await axios.get(
        `${process.env.INNGEST_SERVER_HOST}v1/events/${runId}/runs`,
        {
            headers: {
                Authorization: `Bearer ${process.env.INNGEST_SIGNING_KEY}`
            }
        }
    );
    return result.data;
}