import type {
  AssistantConversationMessage,
  AssistantToolCall,
  ToolExecutionObservation,
} from "@/lib/assistant/contracts";

export type ServerToolBridgeContext = {
  messages: AssistantConversationMessage[];
  round: number;
};

export interface ServerToolBridge {
  executeToolCalls(
    toolCalls: AssistantToolCall[],
    context: ServerToolBridgeContext,
  ): Promise<ToolExecutionObservation[]>;
}
