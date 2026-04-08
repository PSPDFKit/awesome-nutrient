export const AssistantSessionErrorCode = {
  RunAlreadyInProgress: "run_already_in_progress",
  UnknownToolRequest: "unknown_tool_request",
  ToolResultRunMismatch: "tool_result_run_mismatch",
} as const;

export type AssistantSessionErrorCode =
  (typeof AssistantSessionErrorCode)[keyof typeof AssistantSessionErrorCode];

export class AssistantSessionError extends Error {
  constructor(
    readonly code: AssistantSessionErrorCode,
    message: string,
  ) {
    super(message);
    this.name = "AssistantSessionError";
  }
}

export const isAssistantSessionError = (
  error: unknown,
  code?: AssistantSessionErrorCode,
): error is AssistantSessionError => {
  if (!(error instanceof AssistantSessionError)) {
    return false;
  }
  return code === undefined ? true : error.code === code;
};
