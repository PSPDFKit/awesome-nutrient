import { z } from "zod";
import {
  ToolCallSchema,
  type ToolName,
  ToolNameSchema,
} from "@/lib/tools/contracts";

export const AssistantToolCallSchema = ToolCallSchema;
export type AssistantToolCall = z.infer<typeof AssistantToolCallSchema>;

export const AssistantConversationMessageSchema = z.discriminatedUnion("role", [
  z
    .object({
      role: z.literal("user"),
      content: z.string().min(1),
    })
    .strict(),
  z
    .object({
      role: z.literal("assistant"),
      content: z.string(),
      toolCalls: z.array(AssistantToolCallSchema).optional(),
    })
    .strict(),
  z
    .object({
      role: z.literal("tool"),
      content: z.string(),
      toolCallId: z.string().min(1),
      name: ToolNameSchema,
    })
    .strict(),
]);

export type AssistantConversationMessage = z.infer<
  typeof AssistantConversationMessageSchema
>;

export const AssistantRequestSchema = z
  .object({
    messages: z.array(AssistantConversationMessageSchema).min(1),
  })
  .strict();

export type AssistantRequest = z.infer<typeof AssistantRequestSchema>;

export const AssistantTurnSchema = z
  .object({
    assistantText: z.string(),
    toolCalls: z.array(AssistantToolCallSchema),
    done: z.boolean().default(false),
  })
  .strict();

export type AssistantTurn = z.infer<typeof AssistantTurnSchema>;

export type ToolExecutionObservation = {
  toolCallId: string;
  name: ToolName;
  result: unknown;
};
