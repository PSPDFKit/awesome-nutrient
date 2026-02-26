import type { Programmatic } from "@nutrient-sdk/document-authoring";
import { describe, expect, it, vi } from "vitest";
import type { DocumentRuntime } from "@/lib/document/runtime";
import { executeAssistantToolCalls } from "@/lib/tools/executor";

const parseToolArgsMock = vi.fn((_: string, args: unknown) => args);
const executeToolCallMock = vi.fn(async () => ({
  docRevision: "rev-2",
}));

vi.mock("@/lib/document/mutation-session", () => ({
  DocumentMutationSession: class {
    static parseToolArgs(name: string, args: unknown) {
      return parseToolArgsMock(name, args);
    }

    executeToolCall() {
      return executeToolCallMock();
    }
  },
}));

const createRuntime = (): DocumentRuntime & {
  restoreSnapshotMock: ReturnType<typeof vi.fn>;
} => {
  const restoreSnapshotMock = vi.fn(async () => undefined);
  return {
    hasActiveCursor: () => true,
    transaction: async <T>(
      callback: (draft: Programmatic.Document) => Promise<T> | T,
    ) => callback({} as Programmatic.Document),
    saveSnapshot: async () => ({}),
    restoreSnapshot: restoreSnapshotMock,
    restoreSnapshotMock,
  };
};

describe("executeAssistantToolCalls", () => {
  it("executes tool calls and returns observations", async () => {
    const runtime = createRuntime();
    const updates: Array<{ toolCallId: string; status: string }> = [];

    const observations = await executeAssistantToolCalls({
      runtime,
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
      onUpdate: (update) => {
        updates.push({
          toolCallId: update.toolCallId,
          status: update.status,
        });
      },
    });

    expect(observations).toHaveLength(1);
    expect(observations[0]?.name).toBe("list_elements");
    expect(updates.map((update) => update.status)).toEqual([
      "running",
      "success",
    ]);
    expect(parseToolArgsMock).toHaveBeenCalled();
    expect(executeToolCallMock).toHaveBeenCalled();
  });

  it("returns an error observation and restores snapshot for failing write tool calls", async () => {
    const runtime = createRuntime();
    executeToolCallMock.mockRejectedValueOnce(new Error("Target not found"));

    const observations = await executeAssistantToolCalls({
      runtime,
      toolCalls: [
        {
          id: "tool-2",
          name: "replace_paragraph",
          args: {
            expectedRevision: "rev-1",
            id: "p-0.0",
            paragraph: {
              text: "Replacement",
            },
          },
        },
      ],
      onUpdate: () => undefined,
    });

    expect(observations).toHaveLength(1);
    expect(observations[0]?.name).toBe("replace_paragraph");
    expect(observations[0]?.result).toMatchObject({
      ok: false,
      error: "Target not found",
    });
    expect(runtime.restoreSnapshotMock).toHaveBeenCalledTimes(1);
  });
});
