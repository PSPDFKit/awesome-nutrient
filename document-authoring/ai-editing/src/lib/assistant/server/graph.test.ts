import { describe, expect, it, vi } from "vitest";
import type {
  AssistantToolCall,
  ToolExecutionObservation,
} from "@/lib/assistant/contracts";
import { runAssistantServerGraph } from "@/lib/assistant/server/graph";
import type { ServerToolBridge } from "@/lib/assistant/server/tools/tool-bridge";
import type {
  AssistantTurnRequest,
  AssistantTurnResponse,
  LlmProvider,
} from "@/lib/llm/provider";

class FakeProvider implements LlmProvider {
  readonly name = "openai" as const;
  private cursor = 0;

  constructor(private readonly turns: AssistantTurnResponse[]) {}

  readonly nextAssistantTurn = vi.fn(
    async (input: AssistantTurnRequest): Promise<AssistantTurnResponse> => {
      const turn = this.turns[this.cursor];
      if (!turn) {
        return {
          assistantText: "Done.",
          toolCalls: [],
          done: true,
        };
      }
      this.cursor += 1;
      if (input.onAssistantDelta) {
        await input.onAssistantDelta({
          textDelta: turn.assistantText,
        });
      }
      return turn;
    },
  );
}

class FakeToolBridge implements ServerToolBridge {
  readonly executeToolCalls = vi.fn(
    async (
      toolCalls: AssistantToolCall[],
    ): Promise<ToolExecutionObservation[]> =>
      toolCalls.map((toolCall) => ({
        toolCallId: toolCall.id,
        name: toolCall.name,
        result: {
          docRevision: "rev-next",
        },
      })),
  );
}

describe("runAssistantServerGraph", () => {
  it("loops model -> tools -> model until no tool calls remain", async () => {
    const provider = new FakeProvider([
      {
        assistantText: "I will inspect the document first.",
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
        done: false,
      },
      {
        assistantText: "Completed the requested update.",
        toolCalls: [],
        done: true,
      },
    ]);
    const bridge = new FakeToolBridge();

    const result = await runAssistantServerGraph(
      {
        messages: [
          {
            role: "user",
            content: "Write two paragraphs about Spain.",
          },
        ],
      },
      provider,
      bridge,
    );

    expect(provider.nextAssistantTurn).toHaveBeenCalledTimes(2);
    expect(bridge.executeToolCalls).toHaveBeenCalledTimes(1);
    expect(result.assistantText).toBe("Completed the requested update.");
    expect(result.rounds).toBe(2);
    expect(result.messages.at(-1)).toMatchObject({
      role: "assistant",
      content: "Completed the requested update.",
    });
  });

  it("fails with an explicit error when round limit is reached", async () => {
    const provider = new FakeProvider([
      {
        assistantText: "Reading…",
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
        done: false,
      },
      {
        assistantText: "Still reading…",
        toolCalls: [
          {
            id: "tool-2",
            name: "search_elements",
            args: {
              query: "Spain",
              mode: "hybrid",
              kinds: ["paragraph", "table"],
              maxResults: 5,
            },
          },
        ],
        done: false,
      },
    ]);
    const bridge = new FakeToolBridge();

    await expect(
      runAssistantServerGraph(
        {
          messages: [
            {
              role: "user",
              content: "Do something that never ends",
            },
          ],
          maxRounds: 1,
        },
        provider,
        bridge,
      ),
    ).rejects.toThrow(/within 1 rounds/i);
  });

  it("forwards assistant deltas through graph hooks", async () => {
    const provider = new FakeProvider([
      {
        assistantText: "Streaming final answer.",
        toolCalls: [],
        done: true,
      },
    ]);
    const bridge = new FakeToolBridge();
    const onAssistantDelta = vi.fn();

    await runAssistantServerGraph(
      {
        messages: [
          {
            role: "user",
            content: "Say hello",
          },
        ],
      },
      provider,
      bridge,
      {
        onAssistantDelta,
      },
    );

    expect(onAssistantDelta).toHaveBeenCalledWith({
      round: 1,
      textDelta: "Streaming final answer.",
    });
  });
});
