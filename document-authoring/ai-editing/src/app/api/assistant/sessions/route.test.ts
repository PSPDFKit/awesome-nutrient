import { beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "@/app/api/assistant/sessions/route";

const createAssistantSession = vi.hoisted(() => vi.fn());

vi.mock("@/lib/assistant/server/session-store", () => ({
  createAssistantSession,
}));

describe("POST /api/assistant/sessions", () => {
  beforeEach(() => {
    createAssistantSession.mockReset();
  });

  it("returns a session id", async () => {
    createAssistantSession.mockReturnValue({
      id: "session-test-1",
    });

    const response = await POST();
    const payload = (await response.json()) as { sessionId: string };

    expect(response.status).toBe(200);
    expect(payload.sessionId).toBe("session-test-1");
  });
});
