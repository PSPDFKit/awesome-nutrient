import type {
  AssistantConversationMessage,
  AssistantTurn,
} from "@/lib/assistant/contracts";
import type { ToolName } from "@/lib/tools/contracts";

export type LlmProviderName = "openai";

export type AssistantDeltaPayload = {
  textDelta: string;
};

export type AssistantTurnRequest = {
  messages: AssistantConversationMessage[];
  onAssistantDelta?: (payload: AssistantDeltaPayload) => void | Promise<void>;
};

export type AssistantTurnResponse = {
  assistantText: string;
  toolCalls: Array<{ id: string; name: ToolName; args: unknown }>;
  done: boolean;
};

export interface LlmProvider {
  readonly name: LlmProviderName;
  nextAssistantTurn(
    input: AssistantTurnRequest,
  ): Promise<AssistantTurnResponse>;
}

export const normalizeAssistantTurnResponse = (
  response: AssistantTurnResponse,
): AssistantTurn => ({
  assistantText: response.assistantText,
  toolCalls: response.toolCalls,
  done: response.done,
});
