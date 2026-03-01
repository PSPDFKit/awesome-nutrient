import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DocumentAuthoringAiShell } from "@/components/document-authoring-ai-shell";
import type { DocumentRuntime } from "@/lib/document/runtime";
import { executeAssistantToolCalls } from "@/lib/tools/executor";

class MockEventSource {
  static instances: MockEventSource[] = [];

  onmessage: ((event: { data: string }) => void) | null = null;
  onerror: (() => void) | null = null;
  readonly close = vi.fn();

  constructor(readonly url: string) {
    MockEventSource.instances.push(this);
  }

  emit(payload: unknown) {
    this.onmessage?.({
      data: JSON.stringify(payload),
    });
  }
}

vi.mock("@/lib/tools/executor", () => ({
  executeAssistantToolCalls: vi.fn(async ({ toolCalls, onUpdate }) => {
    for (const toolCall of toolCalls) {
      onUpdate({
        toolCallId: toolCall.id,
        name: toolCall.name,
        status: "running",
      });
      onUpdate({
        toolCallId: toolCall.id,
        name: toolCall.name,
        status: "success",
      });
    }

    return toolCalls.map((toolCall: { id: string; name: string }) => ({
      toolCallId: toolCall.id,
      name: toolCall.name,
      result: {
        docRevision: "rev-2",
      },
    }));
  }),
}));

vi.mock("@/components/document-editor-surface", () => ({
  __esModule: true,
  DocumentEditorSurface: (props: {
    onReadyAction?: (runtime: DocumentRuntime) => void;
  }) => {
    if (
      !(globalThis as { __documentAuthoringAiExampleReady?: boolean })
        .__documentAuthoringAiExampleReady
    ) {
      (
        globalThis as { __documentAuthoringAiExampleReady?: boolean }
      ).__documentAuthoringAiExampleReady = true;
      setTimeout(() => {
        props.onReadyAction?.({
          hasActiveCursor: () => true,
          transaction: async (callback) =>
            callback(
              {} as import("@nutrient-sdk/document-authoring").Programmatic.Document,
            ),
          saveSnapshot: async () => ({}),
          restoreSnapshot: async () => undefined,
        });
      }, 0);
    }

    return (
      <section aria-label="Document Editor">
        <h2>Document Editor</h2>
      </section>
    );
  },
}));

beforeEach(() => {
  vi.clearAllMocks();
  MockEventSource.instances = [];
  vi.stubGlobal(
    "EventSource",
    MockEventSource as unknown as typeof EventSource,
  );
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  delete (globalThis as { __documentAuthoringAiExampleReady?: boolean })
    .__documentAuthoringAiExampleReady;
});

describe("DocumentAuthoringAiShell", () => {
  it("renders assistant and editor panels", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          sessionId: "session-1",
        }),
        { status: 200, headers: { "content-type": "application/json" } },
      ),
    );
    vi.stubGlobal("fetch", fetchMock);

    render(<DocumentAuthoringAiShell />);

    expect(
      screen.getByRole("region", { name: "AI Assistant" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("region", { name: "Document Editor" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Submit" })).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Apply to selection" }),
    ).not.toBeInTheDocument();
    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith("/api/assistant/sessions", {
        method: "POST",
      });
    });
  });

  it("disables Submit when prompt is empty", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          sessionId: "session-1",
        }),
        { status: 200, headers: { "content-type": "application/json" } },
      ),
    );
    vi.stubGlobal("fetch", fetchMock);

    const user = userEvent.setup();
    render(<DocumentAuthoringAiShell />);

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith("/api/assistant/sessions", {
        method: "POST",
      });
    });

    const submitButton = screen.getByRole("button", { name: "Submit" });
    expect(submitButton).toBeDisabled();

    await user.type(
      screen.getByLabelText(/ask assistant/i),
      "Rewrite this paragraph",
    );
    await waitFor(() => {
      expect(submitButton).toBeEnabled();
    });
  });

  it("starts a server run, executes requested tools, and submits observations", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            sessionId: "session-1",
          }),
          { status: 200, headers: { "content-type": "application/json" } },
        ),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            runId: "run-1",
          }),
          { status: 200, headers: { "content-type": "application/json" } },
        ),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ ok: true }), {
          status: 200,
          headers: { "content-type": "application/json" },
        }),
      );
    vi.stubGlobal("fetch", fetchMock);

    const user = userEvent.setup();
    render(<DocumentAuthoringAiShell />);

    await waitFor(() => {
      expect(MockEventSource.instances).toHaveLength(1);
    });
    const source = MockEventSource.instances[0]!;
    source.emit({
      type: "session.connected",
      sessionId: "session-1",
    });

    await user.type(
      screen.getByLabelText(/ask assistant/i),
      "Write two paragraphs about Spain",
    );
    await user.click(screen.getByRole("button", { name: "Submit" }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        "/api/assistant/sessions/session-1/run",
        expect.objectContaining({
          method: "POST",
        }),
      );
    });

    source.emit({
      type: "assistant.turn",
      runId: "run-1",
      round: 1,
      assistantText: "Reading structure first.",
      toolCalls: [
        {
          id: "tool-1",
          name: "list_elements",
          args: {
            parentId: "d-0",
            offset: 0,
            limit: 50,
          },
        },
      ],
    });
    source.emit({
      type: "assistant.delta",
      runId: "run-1",
      round: 2,
      textDelta: "Completed",
    });
    expect(await screen.findByText("Completed")).toBeInTheDocument();
    source.emit({
      type: "assistant.delta",
      runId: "run-1",
      round: 2,
      textDelta: " the requested update.",
    });
    expect(
      await screen.findByText("Completed the requested update."),
    ).toBeInTheDocument();
    source.emit({
      type: "tools.requested",
      runId: "run-1",
      requestId: "request-1",
      round: 1,
      toolCalls: [
        {
          id: "tool-1",
          name: "list_elements",
          args: {
            parentId: "d-0",
            offset: 0,
            limit: 50,
          },
        },
      ],
    });
    source.emit({
      type: "run.completed",
      runId: "run-1",
      assistantText: "Completed the requested update.",
      rounds: 2,
      messages: [
        {
          role: "user",
          content: "Write two paragraphs about Spain",
        },
        {
          role: "assistant",
          content: "Completed the requested update.",
        },
      ],
    });

    expect(
      await screen.findByText("list_elements (success)"),
    ).toBeInTheDocument();
    expect(
      await screen.findByText("Completed the requested update."),
    ).toBeInTheDocument();
    expect(vi.mocked(executeAssistantToolCalls)).toHaveBeenCalledTimes(1);

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        "/api/assistant/sessions/session-1/tool-results",
        expect.objectContaining({
          method: "POST",
        }),
      );
    });
  });
});
