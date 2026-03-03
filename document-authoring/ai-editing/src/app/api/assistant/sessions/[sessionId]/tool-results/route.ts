import { NextResponse } from "next/server";
import {
  AssistantSessionErrorCode,
  isAssistantSessionError,
} from "@/lib/assistant/server/session-errors";
import { SubmitToolResultsRequestSchema } from "@/lib/assistant/server/session-events";
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
    const parsedPayload = SubmitToolResultsRequestSchema.safeParse(rawPayload);
    if (!parsedPayload.success) {
      return NextResponse.json(
        {
          error: "Invalid tool result payload.",
          details: parsedPayload.error.issues,
        },
        { status: 400 },
      );
    }

    session.submitToolResults(parsedPayload.data);
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unknown tool result submission failure.";
    const status =
      isAssistantSessionError(
        error,
        AssistantSessionErrorCode.UnknownToolRequest,
      ) ||
      isAssistantSessionError(
        error,
        AssistantSessionErrorCode.ToolResultRunMismatch,
      )
        ? 409
        : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
