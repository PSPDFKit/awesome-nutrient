import type {
  AssistantToolCall,
  ToolExecutionObservation,
} from "@/lib/assistant/contracts";
import { DocumentMutationSession } from "@/lib/document/mutation-session";
import type { DocumentRuntime } from "@/lib/document/runtime";
import { isWriteToolName } from "@/lib/tools/contracts";

export type ToolExecutionStatus = "queued" | "running" | "success" | "error";

export type ToolExecutionUpdate = {
  toolCallId: string;
  name: string;
  status: ToolExecutionStatus;
  errorMessage?: string;
};

const normalizeErrorMessage = (error: unknown): string =>
  error instanceof Error ? error.message : String(error);

const executeReadToolCall = async (
  runtime: DocumentRuntime,
  toolCall: AssistantToolCall,
): Promise<unknown> =>
  runtime.transaction(async (draft) => {
    const parsedArgs = DocumentMutationSession.parseToolArgs(
      toolCall.name,
      toolCall.args,
    );
    const session = new DocumentMutationSession(draft);
    return session.executeToolCall(toolCall.name, parsedArgs);
  });

const executeWriteToolCall = async (
  runtime: DocumentRuntime,
  toolCall: AssistantToolCall,
): Promise<unknown> => {
  const parsedArgs = DocumentMutationSession.parseToolArgs(
    toolCall.name,
    toolCall.args,
  );
  const beforeSnapshot = await runtime.saveSnapshot();

  try {
    const result = await runtime.transaction(async (draft) => {
      const session = new DocumentMutationSession(draft);
      return session.executeToolCall(toolCall.name, parsedArgs);
    });
    return result;
  } catch (error) {
    await runtime.restoreSnapshot(beforeSnapshot);
    throw error;
  }
};

const executeToolCall = async (
  runtime: DocumentRuntime,
  toolCall: AssistantToolCall,
): Promise<unknown> => {
  if (isWriteToolName(toolCall.name)) {
    return executeWriteToolCall(runtime, toolCall);
  }
  return executeReadToolCall(runtime, toolCall);
};

export const executeAssistantToolCalls = async (input: {
  runtime: DocumentRuntime;
  toolCalls: AssistantToolCall[];
  onUpdate: (update: ToolExecutionUpdate) => void;
}): Promise<ToolExecutionObservation[]> => {
  const observations: ToolExecutionObservation[] = [];

  for (const toolCall of input.toolCalls) {
    input.onUpdate({
      toolCallId: toolCall.id,
      name: toolCall.name,
      status: "running",
    });

    try {
      const result = await executeToolCall(input.runtime, toolCall);

      input.onUpdate({
        toolCallId: toolCall.id,
        name: toolCall.name,
        status: "success",
      });
      observations.push({
        toolCallId: toolCall.id,
        name: toolCall.name,
        result,
      });
    } catch (error) {
      const errorMessage = normalizeErrorMessage(error);
      input.onUpdate({
        toolCallId: toolCall.id,
        name: toolCall.name,
        status: "error",
        errorMessage,
      });
      observations.push({
        toolCallId: toolCall.id,
        name: toolCall.name,
        result: {
          ok: false,
          error: errorMessage,
        },
      });
    }
  }

  return observations;
};
