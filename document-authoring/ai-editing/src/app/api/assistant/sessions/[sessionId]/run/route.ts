import { NextResponse } from "next/server";
import {
  StartAssistantRunRequestSchema,
  StartAssistantRunResponseSchema,
} from "@/lib/assistant/server/session-events";
import { getAssistantSession } from "@/lib/assistant/server/session-store";

export const runtime = "nodejs";

export async function POST(
  request: Request,
  context: { params: Promise<{ sessionId: string }> },
): Promise<Response> {
  const { sessionId } = await context.params;
  const session = getAssistantSession(sessionId);
  if (!session) {
    return NextResponse.json({ error: "Session not found." }, { status: 404 });
  }

  try {
    const rawPayload = (await request.json()) as unknown;
    const parsedPayload = StartAssistantRunRequestSchema.safeParse(rawPayload);
    if (!parsedPayload.success) {
      return NextResponse.json(
        {
          error: "Invalid run request payload.",
          details: parsedPayload.error.issues,
        },
        { status: 400 },
      );
    }

    const runId = await session.startRun({
      messages: parsedPayload.data.messages,
    });

    return NextResponse.json(
      StartAssistantRunResponseSchema.parse({
        runId,
      }),
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown run startup failure.";
    const status = /already in progress/i.test(message) ? 409 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
