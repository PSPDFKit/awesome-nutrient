import type { LlmProvider } from "@/lib/llm/provider";
import { OpenAiLlmProvider } from "@/lib/llm/providers/openai-provider";

export const createLlmProvider = (): LlmProvider => {
  return new OpenAiLlmProvider();
};
