import { NextResponse } from 'next/server';
import { inngest } from '@/inngest/client';
import axios from 'axios';

async function getRuns(runId: string) {
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

export async function POST(req: Request) {
  try {
    const { roadmapId, userInput, userEmail } = await req.json();
    const resultIds = await inngest.send({
      name: 'AiRoadMapAgent',
      data: {
        userInput,
        roadmapId,
        userEmail
      }
    });
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
    return NextResponse.json({ success: true, data: output });
  } catch (sendError) {
    console.error('Error sending event to Inngest:', sendError);
    return NextResponse.json({ error: 'Failed to send event to Inngest', details: sendError instanceof Error ? sendError.message : sendError }, { status: 500 });
  }
}