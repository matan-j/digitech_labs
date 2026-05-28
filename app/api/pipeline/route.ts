import { NextRequest } from 'next/server';
import { CourseBrief, PipelineEvent } from '@/lib/types';
import { runPipeline } from '@/lib/pipeline';

export const runtime = 'nodejs';
export const maxDuration = 800;

export async function POST(request: NextRequest) {
  let brief: CourseBrief;
  try {
    brief = await request.json();
  } catch {
    return new Response('Invalid JSON', { status: 400 });
  }

  if (!brief.slug || !brief.title) {
    return new Response('Missing required fields: slug, title', { status: 400 });
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      function send(event: PipelineEvent) {
        const data = `data: ${JSON.stringify(event)}\n\n`;
        controller.enqueue(encoder.encode(data));
      }

      try {
        await runPipeline(brief, send);
      } catch (error) {
        const errMsg = error instanceof Error ? error.message : String(error);
        send({ type: 'pipeline_error', error: errMsg });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}
