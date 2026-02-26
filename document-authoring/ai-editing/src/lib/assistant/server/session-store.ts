import type {
  AssistantConversationMessage,
  AssistantToolCall,
} from "@/lib/assistant/contracts";
import { runAssistantServerGraph } from "@/lib/assistant/server/graph";
import {
  type AssistantSessionEvent,
  AssistantSessionEventSchema,
  type ToolExecutionObservationPayload,
} from "@/lib/assistant/server/session-events";
import type { ServerToolBridge } from "@/lib/assistant/server/tools/tool-bridge";
import { createLlmProvider } from "@/lib/llm/provider-factory";

type SessionSubscriber = (event: AssistantSessionEvent) => void;

type PendingToolRequest = {
  runId: string;
  resolve: (observations: ToolExecutionObservationPayload[]) => void;
  reject: (error: Error) => void;
  timeout: NodeJS.Timeout;
};

const TOOL_REQUEST_TIMEOUT_MS = 120_000;
const SESSION_STALE_AFTER_MS = 30 * 60_000;

const makeId = (prefix: string): string =>
  `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;

class AssistantSession {
  private readonly subscribers = new Set<SessionSubscriber>();
  private readonly pendingToolRequests = new Map<string, PendingToolRequest>();
  private lastTouchedAt = Date.now();
  private activeRunId: string | null = null;

  constructor(readonly id: string) {}

  touch(): void {
    this.lastTouchedAt = Date.now();
  }

  isStale(now: number): boolean {
    if (this.activeRunId !== null) {
      return false;
    }
    return now - this.lastTouchedAt > SESSION_STALE_AFTER_MS;
  }

  subscribe(subscriber: SessionSubscriber): () => void {
    this.touch();
    this.subscribers.add(subscriber);

    subscriber(
      AssistantSessionEventSchema.parse({
        type: "session.connected",
        sessionId: this.id,
      }),
    );

    return () => {
      this.subscribers.delete(subscriber);
      this.touch();
    };
  }

  private publish(event: AssistantSessionEvent): void {
    this.touch();
    for (const subscriber of this.subscribers) {
      subscriber(event);
    }
  }

  private async requestToolExecution(
    runId: string,
    round: number,
    toolCalls: AssistantToolCall[],
  ): Promise<ToolExecutionObservationPayload[]> {
    const requestId = makeId("tool-request");

    const requestPromise = new Promise<ToolExecutionObservationPayload[]>(
      (resolve, reject) => {
        const timeout = setTimeout(() => {
          this.pendingToolRequests.delete(requestId);
          reject(new Error("Tool result request timed out."));
        }, TOOL_REQUEST_TIMEOUT_MS);

        this.pendingToolRequests.set(requestId, {
          runId,
          resolve,
          reject,
          timeout,
        });
      },
    );

    this.publish(
      AssistantSessionEventSchema.parse({
        type: "tools.requested",
        runId,
        requestId,
        round,
        toolCalls,
      }),
    );

    return requestPromise;
  }

  private completePendingToolRequestsForRun(
    runId: string,
    message: string,
  ): void {
    for (const [requestId, pending] of this.pendingToolRequests.entries()) {
      if (pending.runId !== runId) {
        continue;
      }
      clearTimeout(pending.timeout);
      pending.reject(new Error(message));
      this.pendingToolRequests.delete(requestId);
    }
  }

  async startRun(input: {
    messages: AssistantConversationMessage[];
  }): Promise<string> {
    if (this.activeRunId !== null) {
      throw new Error("A run is already in progress for this session.");
    }

    this.touch();
    const runId = makeId("run");
    this.activeRunId = runId;

    const provider = createLlmProvider();
    const toolBridge: ServerToolBridge = {
      executeToolCalls: async (toolCalls, context) =>
        this.requestToolExecution(runId, context.round, toolCalls),
    };

    void (async () => {
      try {
        const result = await runAssistantServerGraph(
          {
            messages: input.messages,
          },
          provider,
          toolBridge,
          {
            onAssistantDelta: async ({ round, textDelta }) => {
              this.publish(
                AssistantSessionEventSchema.parse({
                  type: "assistant.delta",
                  runId,
                  round,
                  textDelta,
                }),
              );
            },
            onAssistantTurn: async ({ round, assistantText, toolCalls }) => {
              this.publish(
                AssistantSessionEventSchema.parse({
                  type: "assistant.turn",
                  runId,
                  round,
                  assistantText,
                  toolCalls,
                }),
              );
            },
          },
        );

        this.publish(
          AssistantSessionEventSchema.parse({
            type: "run.completed",
            runId,
            assistantText: result.assistantText,
            messages: result.messages,
            rounds: result.rounds,
          }),
        );
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Unknown assistant run failure.";
        this.publish(
          AssistantSessionEventSchema.parse({
            type: "run.failed",
            runId,
            error: errorMessage,
          }),
        );
      } finally {
        this.completePendingToolRequestsForRun(
          runId,
          "Run terminated before pending tool request completed.",
        );
        this.activeRunId = null;
        this.touch();
      }
    })();

    return runId;
  }

  submitToolResults(input: {
    runId: string;
    requestId: string;
    observations: ToolExecutionObservationPayload[];
  }): void {
    this.touch();
    const pending = this.pendingToolRequests.get(input.requestId);
    if (!pending) {
      throw new Error(`Unknown tool request: ${input.requestId}`);
    }
    if (pending.runId !== input.runId) {
      throw new Error(
        `Tool result run mismatch. request runId=${pending.runId}, payload runId=${input.runId}`,
      );
    }

    clearTimeout(pending.timeout);
    pending.resolve(input.observations);
    this.pendingToolRequests.delete(input.requestId);
  }
}

type AssistantSessionRegistry = {
  sessions: Map<string, AssistantSession>;
};

const SESSION_REGISTRY_KEY = "__documentAuthoringAiExampleSessionRegistry__";

const getGlobalRegistry = (): AssistantSessionRegistry => {
  const globalRecord = globalThis as typeof globalThis & {
    [SESSION_REGISTRY_KEY]?: AssistantSessionRegistry;
  };
  if (!globalRecord[SESSION_REGISTRY_KEY]) {
    globalRecord[SESSION_REGISTRY_KEY] = {
      sessions: new Map<string, AssistantSession>(),
    };
  }
  return globalRecord[SESSION_REGISTRY_KEY];
};

const sessions = getGlobalRegistry().sessions;

const sweepStaleSessions = (): void => {
  const now = Date.now();
  for (const [sessionId, session] of sessions.entries()) {
    if (session.isStale(now)) {
      sessions.delete(sessionId);
    }
  }
};

export const createAssistantSession = (): AssistantSession => {
  sweepStaleSessions();
  const session = new AssistantSession(makeId("session"));
  sessions.set(session.id, session);
  return session;
};

export const getAssistantSession = (
  sessionId: string,
): AssistantSession | null => sessions.get(sessionId) ?? null;
