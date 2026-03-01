import { z } from "zod";
import {
  AssistantConversationMessageSchema,
  AssistantToolCallSchema,
} from "@/lib/assistant/contracts";
import { ToolNameSchema } from "@/lib/tools/contracts";

export const ToolExecutionObservationSchema = z
  .object({
    toolCallId: z.string().min(1),
    name: ToolNameSchema,
    result: z.unknown(),
  })
  .strict();

export type ToolExecutionObservationPayload = z.infer<
  typeof ToolExecutionObservationSchema
>;

export const CreateAssistantSessionResponseSchema = z
  .object({
    sessionId: z.string().min(1),
  })
  .strict();

export const StartAssistantRunRequestSchema = z
  .object({
    messages: z.array(AssistantConversationMessageSchema).min(1),
  })
  .strict();

export const StartAssistantRunResponseSchema = z
  .object({
    runId: z.string().min(1),
  })
  .strict();

export const SubmitToolResultsRequestSchema = z
  .object({
    runId: z.string().min(1),
    requestId: z.string().min(1),
    observations: z.array(ToolExecutionObservationSchema),
  })
  .strict();

const SessionConnectedEventSchema = z
  .object({
    type: z.literal("session.connected"),
    sessionId: z.string().min(1),
  })
  .strict();

const AssistantTurnEventSchema = z
  .object({
    type: z.literal("assistant.turn"),
    runId: z.string().min(1),
    round: z.number().int().min(1),
    assistantText: z.string(),
    toolCalls: z.array(AssistantToolCallSchema),
  })
  .strict();

const AssistantDeltaEventSchema = z
  .object({
    type: z.literal("assistant.delta"),
    runId: z.string().min(1),
    round: z.number().int().min(1),
    textDelta: z.string(),
  })
  .strict();

const ToolCallsRequestedEventSchema = z
  .object({
    type: z.literal("tools.requested"),
    runId: z.string().min(1),
    requestId: z.string().min(1),
    round: z.number().int().min(1),
    toolCalls: z.array(AssistantToolCallSchema),
  })
  .strict();

const RunCompletedEventSchema = z
  .object({
    type: z.literal("run.completed"),
    runId: z.string().min(1),
    assistantText: z.string(),
    messages: z.array(AssistantConversationMessageSchema),
    rounds: z.number().int().min(1),
  })
  .strict();

const RunFailedEventSchema = z
  .object({
    type: z.literal("run.failed"),
    runId: z.string().min(1),
    error: z.string().min(1),
  })
  .strict();

export const AssistantSessionEventSchema = z.discriminatedUnion("type", [
  SessionConnectedEventSchema,
  AssistantDeltaEventSchema,
  AssistantTurnEventSchema,
  ToolCallsRequestedEventSchema,
  RunCompletedEventSchema,
  RunFailedEventSchema,
]);

export type AssistantSessionEvent = z.infer<typeof AssistantSessionEventSchema>;
