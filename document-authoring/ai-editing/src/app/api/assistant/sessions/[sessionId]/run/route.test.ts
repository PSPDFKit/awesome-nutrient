import { beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "@/app/api/assistant/sessions/[sessionId]/run/route";
import {
  AssistantSessionError,
  AssistantSessionErrorCode,
} from "@/lib/assistant/server/session-errors";

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

  it("returns 409 when another run is already in progress", async () => {
    const startRun = vi.fn(async () => {
      throw new AssistantSessionError(
        AssistantSessionErrorCode.RunAlreadyInProgress,
        "A run is already in progress for this session.",
      );
    });
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

    expect(response.status).toBe(409);
  });

  it("returns 500 when run startup fails unexpectedly", async () => {
    const startRun = vi.fn(async () => {
      throw new Error("boom");
    });
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

    expect(response.status).toBe(500);
  });
});
