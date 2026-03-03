import { getAssistantSession } from "@/lib/assistant/server/session-store";

export const runtime = "nodejs";

const encoder = new TextEncoder();

const toSseDataFrame = (payload: unknown): Uint8Array =>
  encoder.encode(`data: ${JSON.stringify(payload)}\n\n`);

const toSseCommentFrame = (comment: string): Uint8Array =>
  encoder.encode(`: ${comment}\n\n`);

export async function GET(
  _request: Request,
  context: { params: Promise<{ sessionId: string }> },
): Promise<Response> {
  const { sessionId } = await context.params;
  const session = getAssistantSession(sessionId);
  if (!session) {
    return new Response("Session not found", { status: 404 });
  }

  let cleanup: (() => void) | null = null;

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      const unsubscribe = session.subscribe((event) => {
        controller.enqueue(toSseDataFrame(event));
      });
      const keepAlive = setInterval(() => {
        controller.enqueue(toSseCommentFrame("keepalive"));
      }, 15_000);

      controller.enqueue(toSseCommentFrame("connected"));

      cleanup = () => {
        clearInterval(keepAlive);
        unsubscribe();
      };
    },
    cancel() {
      cleanup?.();
      cleanup = null;
    },
  });

  return new Response(stream, {
    headers: {
      "content-type": "text/event-stream",
      "cache-control": "no-cache, no-transform",
      connection: "keep-alive",
    },
  });
}
