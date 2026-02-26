import { beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "@/app/api/assistant/sessions/[sessionId]/tool-results/route";

const getAssistantSession = vi.hoisted(() => vi.fn());

vi.mock("@/lib/assistant/server/session-store", () => ({
  getAssistantSession,
}));

describe("POST /api/assistant/sessions/[sessionId]/tool-results", () => {
  beforeEach(() => {
    getAssistantSession.mockReset();
  });

  it("returns 400 for invalid payload", async () => {
    getAssistantSession.mockReturnValue({
      submitToolResults: vi.fn(),
    });

    const response = await POST(
      new Request(
        "http://localhost/api/assistant/sessions/session-1/tool-results",
        {
          method: "POST",
          body: JSON.stringify({
            invalid: true,
          }),
          headers: {
            "content-type": "application/json",
          },
        },
      ),
      { params: Promise.resolve({ sessionId: "session-1" }) },
    );

    expect(response.status).toBe(400);
  });

  it("submits tool observations", async () => {
    const submitToolResults = vi.fn();
    getAssistantSession.mockReturnValue({
      submitToolResults,
    });

    const response = await POST(
      new Request(
        "http://localhost/api/assistant/sessions/session-1/tool-results",
        {
          method: "POST",
          body: JSON.stringify({
            runId: "run-1",
            requestId: "request-1",
            observations: [
              {
                toolCallId: "tool-1",
                name: "list_elements",
                result: {
                  docRevision: "rev-2",
                },
              },
            ],
          }),
          headers: {
            "content-type": "application/json",
          },
        },
      ),
      { params: Promise.resolve({ sessionId: "session-1" }) },
    );
    const payload = (await response.json()) as { ok: boolean };

    expect(response.status).toBe(200);
    expect(payload.ok).toBe(true);
    expect(submitToolResults).toHaveBeenCalledTimes(1);
  });
});
