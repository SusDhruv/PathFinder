import { NextResponse } from 'next/server';
import { WebPDFLoader } from "@langchain/community/document_loaders/web/pdf";
import { inngest } from '@/inngest/client';
import axios from 'axios';

export async function POST(req: Request) {
  async function getRuns(runId: string) {
    const baseUrl = process.env.INNGEST_SERVER_HOST?.endsWith('/')
      ? process.env.INNGEST_SERVER_HOST
      : process.env.INNGEST_SERVER_HOST + '/';
    const result = await axios.get(
      `${baseUrl}v1/events/${runId}/runs`,
      {
        headers: {
          Authorization: `Bearer ${process.env.INNGEST_SIGNING_KEY}`
        }
      }
    );
    return result.data;
  }
  try {
    const formData = await req.formData();
    const recordId = formData.get('recordId');
    const resumeFile = formData.get('resumeFile');

    if (!recordId || !resumeFile || !(resumeFile instanceof Blob)) {
      return NextResponse.json({ error: 'Missing or invalid recordId or file' }, { status: 400 });
    }

    const loader = new WebPDFLoader(resumeFile);
    const docs = await loader.load();

    const arrayBuffer = await resumeFile.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString('base64');
    const userInput = docs[0]?.pageContent || "No content extracted";

    let resultIds;
    try {
      resultIds = await inngest.send({
        name: 'AiResumeAgent',
        data: {
          recordId: recordId,
          base64: base64,
          pdfText: docs[0]?.pageContent
        }
      });
    } catch (sendError) {
      return NextResponse.json({ error: 'Failed to send event to Inngest', details: sendError instanceof Error ? sendError.message : sendError }, { status: 500 });
    }

    const runId = resultIds.ids[0];
    let runStatus;
    let attempts = 0;
    while (true) {
      runStatus = await getRuns(runId);
      if (runStatus?.data?.[0]?.status === 'Completed') break;
      if (runStatus?.data?.[0]?.status === 'Failed') {
        return NextResponse.json({ error: 'Agent run failed', details: runStatus }, { status: 500 });
      }
      attempts++;
      if (attempts > 40) {
        return NextResponse.json({ error: 'Timeout waiting for agent response', details: runStatus }, { status: 504 });
      }
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    const output = runStatus.data?.[0]?.output?.output?.[0];
    if (!output) {
      return NextResponse.json({ error: 'No output from agent', details: runStatus }, { status: 502 });
    }

    let cleaned = '';
    if (typeof output === 'string') {
      cleaned = output.replace(/```json|```/g, '').trim();
    } else if (typeof output === 'object' && output?.content) {
      cleaned = output.content.replace(/```json|```/g, '').trim();
    } else {
      return NextResponse.json({ error: 'Unsupported output format', output }, { status: 500 });
    }

    try {
      const parsed = JSON.parse(cleaned);
      return NextResponse.json(parsed); // ✅ Only return the output content as a JSON object
    } catch (e) {
      return NextResponse.json({ error: 'Invalid JSON in output', raw: cleaned }, { status: 500 });
    }
  } catch (e) {
    const err = e as any;
    return NextResponse.json({ error: err.message || 'Server error', stack: err.stack }, { status: 500 });
  }
}
