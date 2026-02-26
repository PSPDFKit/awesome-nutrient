import { Annotation, END, START, StateGraph } from "@langchain/langgraph";
import type {
  AssistantConversationMessage,
  AssistantToolCall,
  ToolExecutionObservation,
} from "@/lib/assistant/contracts";
import type { ServerToolBridge } from "@/lib/assistant/server/tools/tool-bridge";
import type { LlmProvider } from "@/lib/llm/provider";

const DEFAULT_MAX_ROUNDS = 40;

const AssistantServerGraphState = Annotation.Root({
  messages: Annotation<AssistantConversationMessage[]>({
    reducer: (_left, right) => right,
    default: () => [],
  }),
  pendingToolCalls: Annotation<AssistantToolCall[]>({
    reducer: (_left, right) => right,
    default: () => [],
  }),
  latestAssistantText: Annotation<string>({
    reducer: (_left, right) => right,
    default: () => "",
  }),
  round: Annotation<number>({
    reducer: (_left, right) => right,
    default: () => 0,
  }),
  maxRounds: Annotation<number>({
    reducer: (_left, right) => right,
    default: () => DEFAULT_MAX_ROUNDS,
  }),
});

type AssistantServerGraphInput = {
  messages: AssistantConversationMessage[];
  maxRounds?: number;
};

export type AssistantServerRunResult = {
  assistantText: string;
  messages: AssistantConversationMessage[];
  rounds: number;
};

export type AssistantServerGraphHooks = {
  onAssistantDelta?: (input: {
    round: number;
    textDelta: string;
  }) => void | Promise<void>;
  onAssistantTurn?: (input: {
    round: number;
    assistantText: string;
    toolCalls: AssistantToolCall[];
  }) => void | Promise<void>;
  onToolCallsRequested?: (input: {
    round: number;
    toolCalls: AssistantToolCall[];
  }) => void | Promise<void>;
  onToolResults?: (input: {
    round: number;
    observations: ToolExecutionObservation[];
  }) => void | Promise<void>;
};

const toToolMessage = (
  observation: ToolExecutionObservation,
): AssistantConversationMessage => ({
  role: "tool",
  toolCallId: observation.toolCallId,
  name: observation.name,
  content: JSON.stringify(observation.result),
});

const throwIfRoundLimitReached = (
  state: typeof AssistantServerGraphState.State,
): void => {
  if (state.round >= state.maxRounds) {
    throw new Error(
      `Assistant did not finish within ${state.maxRounds} rounds. Please rephrase your request.`,
    );
  }
};

const createCallLlmNode =
  (provider: LlmProvider, hooks?: AssistantServerGraphHooks) =>
  async (
    state: typeof AssistantServerGraphState.State,
  ): Promise<Partial<typeof AssistantServerGraphState.State>> => {
    throwIfRoundLimitReached(state);
    const nextRound = state.round + 1;

    const response = await provider.nextAssistantTurn({
      messages: state.messages,
      ...(hooks?.onAssistantDelta
        ? {
            onAssistantDelta: async ({ textDelta }) => {
              await hooks.onAssistantDelta?.({
                round: nextRound,
                textDelta,
              });
            },
          }
        : {}),
    });

    const assistantMessage: AssistantConversationMessage = {
      role: "assistant",
      content: response.assistantText,
      ...(response.toolCalls.length > 0
        ? { toolCalls: response.toolCalls }
        : {}),
    };

    if (hooks?.onAssistantTurn) {
      await hooks.onAssistantTurn({
        round: nextRound,
        assistantText: response.assistantText,
        toolCalls: response.toolCalls,
      });
    }

    return {
      messages: [...state.messages, assistantMessage],
      latestAssistantText: response.assistantText,
      pendingToolCalls: response.toolCalls,
      round: nextRound,
    };
  };

const createToolsNode =
  (toolBridge: ServerToolBridge, hooks?: AssistantServerGraphHooks) =>
  async (
    state: typeof AssistantServerGraphState.State,
  ): Promise<Partial<typeof AssistantServerGraphState.State>> => {
    if (state.pendingToolCalls.length === 0) {
      return {};
    }

    if (hooks?.onToolCallsRequested) {
      await hooks.onToolCallsRequested({
        round: state.round,
        toolCalls: state.pendingToolCalls,
      });
    }

    const observations = await toolBridge.executeToolCalls(
      state.pendingToolCalls,
      {
        messages: state.messages,
        round: state.round,
      },
    );

    if (hooks?.onToolResults) {
      await hooks.onToolResults({
        round: state.round,
        observations,
      });
    }

    const toolMessages = observations.map(toToolMessage);
    return {
      messages: [...state.messages, ...toolMessages],
      pendingToolCalls: [],
    };
  };

const routeAfterLlm = (
  state: typeof AssistantServerGraphState.State,
): "tools" | typeof END => {
  if (state.pendingToolCalls.length > 0) {
    return "tools";
  }
  return END;
};

export const runAssistantServerGraph = async (
  input: AssistantServerGraphInput,
  provider: LlmProvider,
  toolBridge: ServerToolBridge,
  hooks?: AssistantServerGraphHooks,
): Promise<AssistantServerRunResult> => {
  const workflow = new StateGraph(AssistantServerGraphState)
    .addNode("call_llm", createCallLlmNode(provider, hooks))
    .addNode("tools", createToolsNode(toolBridge, hooks))
    .addEdge(START, "call_llm")
    .addConditionalEdges("call_llm", routeAfterLlm, {
      tools: "tools",
      [END]: END,
    })
    .addEdge("tools", "call_llm");

  const app = workflow.compile();
  const maxRounds = input.maxRounds ?? DEFAULT_MAX_ROUNDS;
  const result = await app.invoke(
    {
      messages: input.messages,
      maxRounds,
    },
    {
      // A single round can span several graph steps (LLM + tool execution + routing).
      // Keep LangGraph's recursion limit above our explicit round cap so round-based
      // termination controls the failure mode.
      recursionLimit: maxRounds * 4,
    },
  );

  return {
    assistantText: result.latestAssistantText,
    messages: result.messages,
    rounds: result.round,
  };
};
