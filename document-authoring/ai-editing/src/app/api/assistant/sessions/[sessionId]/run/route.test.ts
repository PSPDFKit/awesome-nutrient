import { beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "@/app/api/assistant/sessions/[sessionId]/run/route";

const getAssistantSession = vi.hoisted(() => vi.fn());

vi.mock("@/lib/assistant/server/session-store", () => ({
  getAssistantSession,
}));

describe("POST /api/assistant/sessions/[sessionId]/run", () => {
  beforeEach(() => {
    getAssistantSession.mockReset();
  });

  it("returns 404 when session does not exist", async () => {
    getAssistantSession.mockReturnValue(null);

    const response = await POST(
      new Request("http://localhost/api/assistant/sessions/missing/run", {
        method: "POST",
        body: JSON.stringify({
          messages: [{ role: "user", content: "Hello" }],
        }),
        headers: {
          "content-type": "application/json",
        },
      }),
      { params: Promise.resolve({ sessionId: "missing" }) },
    );

    expect(response.status).toBe(404);
  });

  it("starts a run and returns runId", async () => {
    const startRun = vi.fn(async () => "run-1");
    getAssistantSession.mockReturnValue({
      startRun,
    });

    const response = await POST(
      new Request("http://localhost/api/assistant/sessions/session-1/run", {
        method: "POST",
        body: JSON.stringify({
          messages: [{ role: "user", content: "Write about Spain" }],
        }),
        headers: {
          "content-type": "application/json",
        },
      }),
      { params: Promise.resolve({ sessionId: "session-1" }) },
    );
    const payload = (await response.json()) as { runId: string };

    expect(response.status).toBe(200);
    expect(startRun).toHaveBeenCalledTimes(1);
    expect(payload.runId).toBe("run-1");
  });
});
