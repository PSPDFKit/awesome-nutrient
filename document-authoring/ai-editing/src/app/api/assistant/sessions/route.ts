import { NextResponse } from "next/server";
import { CreateAssistantSessionResponseSchema } from "@/lib/assistant/server/session-events";
import { createAssistantSession } from "@/lib/assistant/server/session-store";

export const runtime = "nodejs";

export async function POST(): Promise<Response> {
  const session = createAssistantSession();
  return NextResponse.json(
    CreateAssistantSessionResponseSchema.parse({
      sessionId: session.id,
    }),
  );
}
