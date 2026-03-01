"use client";

import {
  type Dispatch,
  type SetStateAction,
  type SubmitEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { DocumentEditorSurface } from "@/components/document-editor-surface";
import type {
  AssistantConversationMessage,
  AssistantToolCall,
} from "@/lib/assistant/contracts";
import {
  AssistantSessionEventSchema,
  CreateAssistantSessionResponseSchema,
  StartAssistantRunRequestSchema,
  StartAssistantRunResponseSchema,
  type ToolExecutionObservationPayload,
} from "@/lib/assistant/server/session-events";
import type { DocumentRuntime } from "@/lib/document/runtime";
import {
  executeAssistantToolCalls,
  type ToolExecutionStatus,
  type ToolExecutionUpdate,
} from "@/lib/tools/executor";

type ChatMessage = {
  id: string;
  createdAt: number;
  role: "user" | "assistant";
  text: string;
  runId?: string;
  round?: number;
  streaming?: boolean;
};

type ToolExecutionLog = {
  toolCallId: string;
  name: string;
  args: unknown;
  status: ToolExecutionStatus;
  startedAt: number;
  finishedAt?: number;
  errorMessage?: string;
  result?: unknown;
};

type DebugEventLog = {
  id: string;
  createdAt: number;
  label: string;
  payload: unknown;
};

const extractRouteErrorMessage = (payload: unknown): string | null => {
  if (typeof payload !== "object" || payload === null) {
    return null;
  }
  const error = (payload as { error?: unknown }).error;
  return typeof error === "string" && error.length > 0 ? error : null;
};

const createMessage = (
  role: ChatMessage["role"],
  text: string,
): ChatMessage => ({
  id: `${role}-${Date.now()}-${Math.random().toString(16).slice(2)}`,
  createdAt: Date.now(),
  role,
  text,
});

const isNoiseResponse = (text: string): boolean => /^[\s[\]{}:,"]*$/.test(text);

const normalizeAssistantReply = (text: string): string | null => {
  const trimmed = text.trim();
  if (trimmed.length === 0 || isNoiseResponse(trimmed)) {
    return null;
  }
  return trimmed;
};

const appendAssistantMessage = (
  setMessagesState: Dispatch<SetStateAction<ChatMessage[]>>,
  text: string,
) => {
  setMessagesState((current) => {
    const trimmed = text.trim();
    if (trimmed.length === 0) {
      return current;
    }
    const last = current.at(-1);
    if (last?.role === "assistant" && last.text === trimmed) {
      return current;
    }
    return [...current, createMessage("assistant", trimmed)];
  });
};

const buildAssistantRoundMessageId = (runId: string, round: number): string =>
  `assistant-${runId}-round-${round}`;

const upsertAssistantDeltaMessage = (
  setMessagesState: Dispatch<SetStateAction<ChatMessage[]>>,
  input: { runId: string; round: number; textDelta: string },
) => {
  if (input.textDelta.length === 0) {
    return;
  }

  const messageId = buildAssistantRoundMessageId(input.runId, input.round);
  setMessagesState((current) => {
    const existingIndex = current.findIndex(
      (message) => message.id === messageId,
    );
    if (existingIndex < 0) {
      return [
        ...current,
        {
          id: messageId,
          createdAt: Date.now(),
          role: "assistant",
          text: input.textDelta,
          runId: input.runId,
          round: input.round,
          streaming: true,
        },
      ];
    }

    const existing = current[existingIndex]!;
    const next = [...current];
    next[existingIndex] = {
      ...existing,
      text: `${existing.text}${input.textDelta}`,
      streaming: true,
    };
    return next;
  });
};

const finalizeAssistantRoundMessage = (
  setMessagesState: Dispatch<SetStateAction<ChatMessage[]>>,
  input: { runId: string; round: number; text: string },
) => {
  const normalized = normalizeAssistantReply(input.text);
  const messageId = buildAssistantRoundMessageId(input.runId, input.round);

  setMessagesState((current) => {
    const existingIndex = current.findIndex(
      (message) => message.id === messageId,
    );

    if (!normalized) {
      if (existingIndex < 0) {
        return current;
      }
      const next = [...current];
      next.splice(existingIndex, 1);
      return next;
    }

    if (existingIndex < 0) {
      const last = current.at(-1);
      if (last?.role === "assistant" && last.text === normalized) {
        return current;
      }

      return [
        ...current,
        {
          id: messageId,
          createdAt: Date.now(),
          role: "assistant",
          text: normalized,
          runId: input.runId,
          round: input.round,
          streaming: false,
        },
      ];
    }

    const existing = current[existingIndex]!;
    if (existing.text === normalized && existing.streaming === false) {
      return current;
    }

    const next = [...current];
    next[existingIndex] = {
      ...existing,
      text: normalized,
      streaming: false,
    };
    return next;
  });
};

const settleStreamingAssistantMessagesForRun = (
  setMessagesState: Dispatch<SetStateAction<ChatMessage[]>>,
  runId: string,
) => {
  setMessagesState((current) => {
    let hasChanges = false;
    const nextMessages: ChatMessage[] = [];

    for (const message of current) {
      if (
        message.role !== "assistant" ||
        message.runId !== runId ||
        message.streaming !== true
      ) {
        nextMessages.push(message);
        continue;
      }

      const normalized = normalizeAssistantReply(message.text);
      if (!normalized) {
        hasChanges = true;
        continue;
      }

      if (normalized !== message.text || message.streaming) {
        hasChanges = true;
      }
      nextMessages.push({
        ...message,
        text: normalized,
        streaming: false,
      });
    }

    return hasChanges ? nextMessages : current;
  });
};

const normalizeToolError = (result: unknown): string | undefined => {
  if (typeof result !== "object" || result === null) {
    return undefined;
  }
  const ok = (result as { ok?: unknown }).ok;
  const error = (result as { error?: unknown }).error;
  if (ok === false && typeof error === "string" && error.length > 0) {
    return error;
  }
  return undefined;
};

const formatRequestError = (status: number, payload: unknown): string => {
  const routeErrorMessage = extractRouteErrorMessage(payload);
  if (routeErrorMessage) {
    return routeErrorMessage;
  }
  return `Request failed with status ${status}`;
};

const readDebugFlag = (): boolean => {
  if (typeof window !== "undefined") {
    const params = new URLSearchParams(window.location.search);
    const queryValue = params.get("debug");
    if (queryValue === "1" || queryValue === "true") {
      return true;
    }
  }

  const envValue = process.env.NEXT_PUBLIC_DOC_AUTH_AI_DEBUG;
  return envValue === "1" || envValue === "true";
};

export function DocumentAuthoringAiShell() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [agentMessages, setAgentMessages] = useState<
    AssistantConversationMessage[]
  >([]);
  const [toolLogs, setToolLogs] = useState<ToolExecutionLog[]>([]);
  const [debugEvents, setDebugEvents] = useState<DebugEventLog[]>([]);
  const [draftInput, setDraftInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [documentRuntime, setDocumentRuntime] =
    useState<DocumentRuntime | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);

  const [panelWidth, setPanelWidth] = useState(340);
  const debugEnabled = useMemo(readDebugFlag, []);
  const layoutRef = useRef<HTMLElement | null>(null);
  const draggingRef = useRef(false);

  const handleResizePointerDown = useCallback((event: React.PointerEvent) => {
    event.preventDefault();
    draggingRef.current = true;
    (event.target as HTMLElement).setPointerCapture(event.pointerId);
  }, []);

  const handleResizePointerMove = useCallback((event: React.PointerEvent) => {
    if (!draggingRef.current || !layoutRef.current) return;
    const layoutRect = layoutRef.current.getBoundingClientRect();
    const newWidth = Math.min(
      Math.max(event.clientX - layoutRect.left, 220),
      600,
    );
    setPanelWidth(newWidth);
  }, []);

  const handleResizePointerUp = useCallback(() => {
    draggingRef.current = false;
  }, []);

  const timelineEntries = useMemo(() => {
    const messageEntries = messages.map((message) => ({
      key: message.id,
      timestamp: message.createdAt,
      kind: "message" as const,
      message,
    }));
    const toolEntries = toolLogs.map((log) => ({
      key: `${log.toolCallId}-${log.startedAt}`,
      timestamp: log.startedAt,
      kind: "tool" as const,
      log,
    }));

    return [...messageEntries, ...toolEntries].sort(
      (left, right) => left.timestamp - right.timestamp,
    );
  }, [messages, toolLogs]);
  const activeRunIdRef = useRef<string | null>(null);
  const runtimeRef = useRef<DocumentRuntime | null>(null);
  const sessionIdRef = useRef<string | null>(null);
  const agentMessagesRef =
    useRef<AssistantConversationMessage[]>(agentMessages);
  const bubbleFeedRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    agentMessagesRef.current = agentMessages;
  }, [agentMessages]);

  useEffect(() => {
    sessionIdRef.current = sessionId;
  }, [sessionId]);

  useEffect(() => {
    if (timelineEntries.length === 0) {
      return;
    }

    const frame = window.requestAnimationFrame(() => {
      const bubbleFeed = bubbleFeedRef.current;
      if (!bubbleFeed) {
        return;
      }
      bubbleFeed.scrollTop = bubbleFeed.scrollHeight;
    });

    return () => {
      window.cancelAnimationFrame(frame);
    };
  }, [timelineEntries]);

  const handleEditorReady = useCallback((runtime: DocumentRuntime) => {
    runtimeRef.current = runtime;
    setDocumentRuntime(runtime);
  }, []);

  const handleEditorUnavailable = useCallback(() => {
    runtimeRef.current = null;
    setDocumentRuntime(null);
  }, []);

  const applyToolUpdate = useCallback(
    (update: ToolExecutionUpdate & { result?: unknown }) => {
      setToolLogs((current) =>
        current.map((log) =>
          log.toolCallId === update.toolCallId
            ? {
                ...log,
                status: update.status,
                errorMessage: update.errorMessage,
                result: update.result ?? log.result,
                finishedAt:
                  update.status === "running" || update.status === "queued"
                    ? undefined
                    : Date.now(),
              }
            : log,
        ),
      );
    },
    [],
  );

  const appendDebugEvent = useCallback(
    (label: string, payload: unknown) => {
      if (!debugEnabled) {
        return;
      }
      setDebugEvents((current) => [
        ...current,
        {
          id: `debug-${Date.now()}-${Math.random().toString(16).slice(2)}`,
          createdAt: Date.now(),
          label,
          payload,
        },
      ]);
    },
    [debugEnabled],
  );

  const recordQueuedToolLogs = useCallback((toolCalls: AssistantToolCall[]) => {
    if (toolCalls.length === 0) {
      return;
    }

    setToolLogs((current) => [
      ...current,
      ...toolCalls.map((toolCall) => ({
        toolCallId: toolCall.id,
        name: toolCall.name,
        args: toolCall.args,
        status: "queued" as const,
        startedAt: Date.now(),
      })),
    ]);
  }, []);

  const submitToolResults = useCallback(
    async (input: {
      sessionId: string;
      runId: string;
      requestId: string;
      observations: ToolExecutionObservationPayload[];
    }) => {
      const response = await fetch(
        `/api/assistant/sessions/${encodeURIComponent(input.sessionId)}/tool-results`,
        {
          method: "POST",
          headers: {
            "content-type": "application/json",
          },
          body: JSON.stringify({
            runId: input.runId,
            requestId: input.requestId,
            observations: input.observations,
          }),
        },
      );
      if (!response.ok) {
        let payload: unknown = null;
        try {
          payload = (await response.json()) as unknown;
        } catch {
          payload = null;
        }
        throw new Error(
          `Tool result submission failed (${response.status}): ${formatRequestError(response.status, payload)}`,
        );
      }
    },
    [],
  );

  const executeRequestedToolCalls = useCallback(
    async (input: {
      sessionId: string;
      runId: string;
      requestId: string;
      toolCalls: AssistantToolCall[];
    }) => {
      const runtime = runtimeRef.current;
      if (!runtime) {
        const observations: ToolExecutionObservationPayload[] =
          input.toolCalls.map((toolCall) => ({
            toolCallId: toolCall.id,
            name: toolCall.name,
            result: {
              ok: false,
              error:
                "Document editor is still loading. Please retry in a moment.",
            },
          }));
        await submitToolResults({
          sessionId: input.sessionId,
          runId: input.runId,
          requestId: input.requestId,
          observations,
        });
        return;
      }

      recordQueuedToolLogs(input.toolCalls);
      const observations = await executeAssistantToolCalls({
        runtime,
        toolCalls: input.toolCalls,
        onUpdate: applyToolUpdate,
      });

      for (const observation of observations) {
        const toolError = normalizeToolError(observation.result);
        if (toolError) {
          applyToolUpdate({
            toolCallId: observation.toolCallId,
            name: observation.name,
            status: "error",
            errorMessage: toolError,
            result: observation.result,
          });
          continue;
        }
        applyToolUpdate({
          toolCallId: observation.toolCallId,
          name: observation.name,
          status: "success",
          result: observation.result,
        });
      }

      await submitToolResults({
        sessionId: input.sessionId,
        runId: input.runId,
        requestId: input.requestId,
        observations,
      });
    },
    [applyToolUpdate, recordQueuedToolLogs, submitToolResults],
  );

  useEffect(() => {
    let disposed = false;
    let source: EventSource | null = null;

    const start = async () => {
      const response = await fetch("/api/assistant/sessions", {
        method: "POST",
      });
      if (!response.ok) {
        let payload: unknown = null;
        try {
          payload = (await response.json()) as unknown;
        } catch {
          payload = null;
        }
        throw new Error(formatRequestError(response.status, payload));
      }

      const session = CreateAssistantSessionResponseSchema.parse(
        (await response.json()) as unknown,
      );
      if (disposed) {
        return;
      }

      setSessionId(session.sessionId);
      source = new EventSource(
        `/api/assistant/sessions/${encodeURIComponent(session.sessionId)}/events`,
      );

      source.onmessage = (event) => {
        if (disposed) {
          return;
        }

        let eventPayload: unknown;
        try {
          eventPayload = JSON.parse(event.data) as unknown;
        } catch {
          return;
        }

        const parsed = AssistantSessionEventSchema.safeParse(eventPayload);
        if (!parsed.success) {
          return;
        }

        const serverEvent = parsed.data;
        const activeRunId = activeRunIdRef.current;
        if (serverEvent.type === "session.connected") {
          return;
        }

        if (serverEvent.type === "assistant.delta") {
          if (activeRunId !== serverEvent.runId) {
            return;
          }
          upsertAssistantDeltaMessage(setMessages, {
            runId: serverEvent.runId,
            round: serverEvent.round,
            textDelta: serverEvent.textDelta,
          });
          return;
        }

        if (serverEvent.type === "assistant.turn") {
          if (activeRunId !== serverEvent.runId) {
            return;
          }
          appendDebugEvent("assistant.turn", serverEvent);
          finalizeAssistantRoundMessage(setMessages, {
            runId: serverEvent.runId,
            round: serverEvent.round,
            text: serverEvent.assistantText,
          });
          return;
        }

        if (serverEvent.type === "tools.requested") {
          if (activeRunId !== serverEvent.runId) {
            return;
          }
          appendDebugEvent("tools.requested", serverEvent);
          void executeRequestedToolCalls({
            sessionId: session.sessionId,
            runId: serverEvent.runId,
            requestId: serverEvent.requestId,
            toolCalls: serverEvent.toolCalls,
          }).catch((error) => {
            const message =
              error instanceof Error
                ? error.message
                : "Failed to execute requested tool calls.";
            setMessages((current) => [
              ...current,
              createMessage("assistant", `Request failed: ${message}`),
            ]);
            setIsSubmitting(false);
            activeRunIdRef.current = null;
          });
          return;
        }

        if (serverEvent.type === "run.completed") {
          if (activeRunId !== serverEvent.runId) {
            return;
          }
          appendDebugEvent("run.completed", serverEvent);
          setAgentMessages(serverEvent.messages);
          finalizeAssistantRoundMessage(setMessages, {
            runId: serverEvent.runId,
            round: serverEvent.rounds,
            text: serverEvent.assistantText,
          });
          settleStreamingAssistantMessagesForRun(
            setMessages,
            serverEvent.runId,
          );
          if (!normalizeAssistantReply(serverEvent.assistantText)) {
            appendAssistantMessage(
              setMessages,
              "Completed the requested update.",
            );
          }
          setIsSubmitting(false);
          activeRunIdRef.current = null;
          return;
        }

        if (serverEvent.type === "run.failed") {
          if (activeRunId !== serverEvent.runId) {
            return;
          }
          settleStreamingAssistantMessagesForRun(
            setMessages,
            serverEvent.runId,
          );
          setMessages((current) => [
            ...current,
            createMessage("assistant", `Request failed: ${serverEvent.error}`),
          ]);
          setIsSubmitting(false);
          activeRunIdRef.current = null;
        }
      };

      source.onerror = () => {
        if (disposed) {
          return;
        }
        if (activeRunIdRef.current) {
          settleStreamingAssistantMessagesForRun(
            setMessages,
            activeRunIdRef.current,
          );
          setMessages((current) => [
            ...current,
            createMessage(
              "assistant",
              "Request failed: Lost connection to assistant session stream. Please retry.",
            ),
          ]);
          setIsSubmitting(false);
          activeRunIdRef.current = null;
        }
      };
    };

    void start().catch((error) => {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to initialize assistant session.";
      setMessages((current) => [
        ...current,
        createMessage("assistant", `Request failed: ${message}`),
      ]);
    });

    return () => {
      disposed = true;
      source?.close();
    };
  }, [appendDebugEvent, executeRequestedToolCalls]);

  const handleSubmit = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = draftInput.trim();
    if (!trimmed || isSubmitting) {
      return;
    }

    const currentSessionId = sessionIdRef.current;
    if (!currentSessionId) {
      setMessages((current) => [
        ...current,
        createMessage(
          "assistant",
          "Request failed: Assistant session is still starting. Please retry.",
        ),
      ]);
      return;
    }

    const nextMessages = [...messages, createMessage("user", trimmed)];
    setMessages(nextMessages);
    setDraftInput("");
    setIsSubmitting(true);

    const nextAgentMessages: AssistantConversationMessage[] = [
      ...agentMessagesRef.current,
      {
        role: "user",
        content: trimmed,
      },
    ];

    try {
      const payload = StartAssistantRunRequestSchema.parse({
        messages: nextAgentMessages,
      });
      const response = await fetch(
        `/api/assistant/sessions/${encodeURIComponent(currentSessionId)}/run`,
        {
          method: "POST",
          headers: {
            "content-type": "application/json",
          },
          body: JSON.stringify(payload),
        },
      );

      if (!response.ok) {
        let errorPayload: unknown = null;
        try {
          errorPayload = (await response.json()) as unknown;
        } catch {
          errorPayload = null;
        }
        throw new Error(
          `Assistant request failed (${response.status}): ${formatRequestError(response.status, errorPayload)}`,
        );
      }

      const runPayload = StartAssistantRunResponseSchema.parse(
        (await response.json()) as unknown,
      );
      activeRunIdRef.current = runPayload.runId;
      setAgentMessages(nextAgentMessages);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Assistant request failed unexpectedly.";
      setMessages((current) => [
        ...current,
        createMessage("assistant", `Request failed: ${message}`),
      ]);
      setIsSubmitting(false);
      activeRunIdRef.current = null;
    }
  };

  return (
    <div className="app-frame">
      <header className="app-header">
        <nav>
          <div className="app-header-left">
            <a href="https://nutrient.io" className="app-logo-link">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/icons/logo.svg"
                width={148}
                height={44}
                alt="Nutrient"
              />
            </a>
            <span className="app-tagline">AI-Powered Document Authoring</span>
          </div>
          <div className="app-header-right">
            <a
              href="https://nutrient.io/sdk/document-authoring/"
              className="app-header-btn app-header-btn-outline"
            >
              Learn More
            </a>
            <a
              href="https://nutrient.io/contact-sales/"
              className="app-header-btn app-header-btn-filled"
            >
              Contact Sales
            </a>
          </div>
        </nav>
      </header>
      <main
        ref={layoutRef}
        className="document-authoring-ai-layout"
        style={{ gridTemplateColumns: `${panelWidth}px 0 1fr` }}
      >
        <section
          aria-label="AI Assistant"
          className="assistant-panel"
          onWheelCapture={(event) => event.stopPropagation()}
          onTouchMoveCapture={(event) => event.stopPropagation()}
        >
          <div
            ref={bubbleFeedRef}
            className="bubble-feed"
            data-testid="assistant-bubble-feed"
          >
            {timelineEntries.length === 0 ? (
              <p className="empty-state">No messages yet.</p>
            ) : (
              timelineEntries.map((entry) => {
                if (entry.kind === "message") {
                  const { message } = entry;
                  return (
                    <article
                      key={entry.key}
                      className={`bubble bubble-${message.role}`}
                    >
                      <strong>
                        {message.role === "user" ? "You" : "Assistant"}
                      </strong>
                      <p>{message.text}</p>
                    </article>
                  );
                }

                const { log } = entry;
                return (
                  <article
                    key={entry.key}
                    className={`bubble bubble-tool bubble-tool-${log.status}`}
                    data-testid="tool-log-entry"
                  >
                    <strong>Tool</strong>
                    <p>{`${log.name} (${log.status})`}</p>
                    <details
                      className="tool-log-details"
                      data-testid="tool-log-details"
                    >
                      <summary>Show tool call</summary>
                      <pre className="tool-args" data-testid="tool-log-args">
                        {JSON.stringify(
                          {
                            id: log.toolCallId,
                            name: log.name,
                            args: log.args,
                          },
                          null,
                          2,
                        )}
                      </pre>
                    </details>
                    {debugEnabled ? (
                      <details
                        className="tool-log-details"
                        data-testid="tool-log-result-details"
                      >
                        <summary>Show tool result</summary>
                        <pre
                          className="tool-args"
                          data-testid="tool-log-result"
                        >
                          {JSON.stringify(log.result ?? null, null, 2)}
                        </pre>
                      </details>
                    ) : null}
                    {log.errorMessage ? <p>{log.errorMessage}</p> : null}
                  </article>
                );
              })
            )}
            {debugEnabled && debugEvents.length > 0 ? (
              <article className="bubble bubble-assistant">
                <strong>Debug</strong>
                {debugEvents.map((debugEvent) => (
                  <details key={debugEvent.id} className="tool-log-details">
                    <summary>{`${debugEvent.label} @ ${new Date(debugEvent.createdAt).toLocaleTimeString()}`}</summary>
                    <pre className="tool-args">
                      {JSON.stringify(debugEvent.payload, null, 2)}
                    </pre>
                  </details>
                ))}
              </article>
            ) : null}
          </div>

          <form className="assistant-form" onSubmit={handleSubmit}>
            <label htmlFor="assistant-input" className="sr-only">
              Ask assistant
            </label>
            <textarea
              id="assistant-input"
              name="assistant-input"
              value={draftInput}
              onChange={(changeEvent) =>
                setDraftInput(changeEvent.target.value)
              }
              onKeyDown={(keyEvent) => {
                if (keyEvent.key === "Enter" && !keyEvent.shiftKey) {
                  keyEvent.preventDefault();
                  keyEvent.currentTarget.form?.requestSubmit();
                }
              }}
              rows={3}
              disabled={isSubmitting || sessionId === null}
              placeholder="What do you want to do in the document?"
            />
            <div className="assistant-form-actions">
              <button
                type="submit"
                disabled={
                  isSubmitting ||
                  sessionId === null ||
                  documentRuntime === null ||
                  draftInput.trim().length === 0
                }
              >
                {isSubmitting ? "Submitting..." : "Submit"}
              </button>
            </div>
          </form>
        </section>

        <div
          className="resize-handle"
          onPointerDown={handleResizePointerDown}
          onPointerMove={handleResizePointerMove}
          onPointerUp={handleResizePointerUp}
        />

        <DocumentEditorSurface
          onReadyAction={handleEditorReady}
          onUnavailableAction={handleEditorUnavailable}
        />
      </main>
    </div>
  );
}
