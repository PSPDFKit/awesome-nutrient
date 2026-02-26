import {
  AIMessage,
  type AIMessageChunk,
  type BaseMessage,
  HumanMessage,
  SystemMessage,
  ToolMessage,
} from "@langchain/core/messages";
import {
  ChatPromptTemplate,
  MessagesPlaceholder,
} from "@langchain/core/prompts";
import { tool } from "@langchain/core/tools";
import { concat } from "@langchain/core/utils/stream";
import { ChatOpenAI } from "@langchain/openai";
import type { ZodType } from "zod";
import {
  type AssistantConversationMessage,
  AssistantToolCallSchema,
} from "@/lib/assistant/contracts";
import type {
  AssistantTurnRequest,
  AssistantTurnResponse,
  LlmProvider,
} from "@/lib/llm/provider";
import {
  AddParagraphsArgsSchema,
  AddTableArgsSchema,
  AdjustParagraphTextStyleArgsSchema,
  DeleteElementArgsSchema,
  EditImageArgsSchema,
  ListElementsArgsSchema,
  ReplaceParagraphArgsSchema,
  ReplaceTableArgsSchema,
  ScrollElementsArgsSchema,
  SearchElementsArgsSchema,
  SetParagraphTextStyleArgsSchema,
  SetTableHeaderTextStyleArgsSchema,
} from "@/lib/tools/contracts";

const SUPPORTED_REASONING_EFFORTS = [
  "none",
  "minimal",
  "low",
  "medium",
  "high",
  "xhigh",
] as const;

type SupportedReasoningEffort = (typeof SUPPORTED_REASONING_EFFORTS)[number];

const parseReasoningEffort = (
  raw: string | undefined,
): SupportedReasoningEffort => {
  const normalized = (raw ?? "medium").trim().toLowerCase();
  const matched = SUPPORTED_REASONING_EFFORTS.find(
    (effort) => effort === normalized,
  );
  if (matched) {
    return matched;
  }

  throw new Error(
    `DOCUMENT_AUTHORING_AI_EXAMPLE_OPENAI_REASONING_EFFORT must be one of: ${SUPPORTED_REASONING_EFFORTS.join(", ")}`,
  );
};

const SYSTEM_PROMPT = `
You are Document Authoring AI Example Assistant. You must edit a live document by calling tools.

Rules:
- Prefer tool calls over free-text when the user asks to modify or inspect the document.
- If element IDs are unknown, call read tools first: list_elements, search_elements, scroll_elements.
- search_elements requires explicit kinds. For global search, pass all kinds.
- search_elements supports regex with args.regex { pattern, ignoreCase, multiline } for exhaustive literal/pattern matching.
- IDs can change after write operations. Read again before dependent writes.
- Use specific IDs in write tool calls. Do not use natural-language selectors in write tools.
- Keep tool arguments precise and minimal.
- You may emit multiple tool calls in one assistant turn when needed to complete a request accurately.
- Avoid repeated read loops: do not call the same read tool with identical arguments more than once unless the previous response is not-found or missing required descendants.

Document writing quality:
- Use only ID-grounded write tools: add_paragraphs, replace_paragraph, add_table, replace_table, edit_image, delete_element, set_table_header_text_style, set_paragraph_text_style, adjust_paragraph_text_style.
- Keep behavior topic-agnostic. Do not hardcode document-specific templates, entity lists, or domain rules.
- Derive structure and content from the user request and current document state.
- Element IDs are opaque runtime handles. Never synthesize or guess IDs from path patterns; only use IDs returned by read tools.
- add_paragraphs anchor edges are only "begin" or "end". Anchors can point to document, section, paragraph, or table IDs.
- For relative placement, resolve exact target IDs with read tools, then anchor explicitly.
- For multi-target placement, prefer one add_paragraphs call with insertions[].
- For new multi-section documents, include headings and supporting body content unless the user explicitly asks for headings only.
- For follow-up requests over existing headings/sections ("complete", "expand", "fill in"), preserve headings and insert or replace body paragraphs under the intended heading IDs.
- For positional edits ("first", "second", "middle", "between"), read ordered siblings first and choose explicit anchors by ID.
- For targeted wording updates, use replace_paragraph.edit (start/end/text) on specific paragraph IDs to preserve formatting outside the edited range.
- Use full replace_paragraph.paragraph only when intentionally rewriting the entire paragraph.
- Never include markdown syntax in paragraph text (no #/## headings, no markdown bullets, no fenced code blocks, no markdown tables).
- Image insertion is currently unavailable. Never claim an image was inserted; explain the limitation and offer text-only alternatives.
- Paragraph style-id and semantic list preset APIs are currently unavailable; use text-only paragraph edits instead.
- Use add_table for tabular data.
- set_paragraph_text_style and adjust_paragraph_text_style accept paragraph (\`p-\`), inline-text (\`it-\`), table-row (\`tr-\`), and table-cell (\`tc-\`) IDs.
- For table header-only styling, use set_table_header_text_style with the table ID.
- For targeted word/phrase styling, first search paragraph elements using search_elements.regex, then scroll paragraph descendants and style matching inline-text IDs.
- For requests like "all occurrences", do not stop after the first match. Collect every matching target before writing.
- set_paragraph_text_style.fontSize is an absolute point size (for example, fontSize: 16).
- For relative font-size requests ("increase by N", "decrease by N"), use adjust_paragraph_text_style with adjust.fontSizeDelta.
- After write operations that change structure, re-read before dependent follow-up writes.

User responses:
- Keep assistantText concise and user-facing.
- Never expose internal IDs unless explicitly asked.
`.trim();

const TOOL_OUTPUT_PLACEHOLDER = JSON.stringify({
  note: "Tool execution is performed by the Document Authoring AI Example client runtime.",
});

const assistantPrompt = ChatPromptTemplate.fromMessages([
  new SystemMessage(SYSTEM_PROMPT),
  new MessagesPlaceholder("messages"),
]);

const createClientTool = <T extends object>(
  name: string,
  description: string,
  schema: ZodType<T>,
) =>
  tool(async () => TOOL_OUTPUT_PLACEHOLDER, {
    name,
    description,
    schema,
  });

const assistantTools = [
  createClientTool(
    "list_elements",
    "List direct children under a parent element (paginated). Use this to discover element IDs and the latest docRevision.",
    ListElementsArgsSchema,
  ),
  createClientTool(
    "search_elements",
    "Search elements with explicit mode and kinds. mode supports exact_phrase, keyword, and hybrid ranking. Optionally provide regex { pattern, ignoreCase, multiline } for exhaustive literal/pattern matching. kinds is required; include all kinds for global search. Use minScore to suppress weak ranked matches.",
    SearchElementsArgsSchema,
  ),
  createClientTool(
    "scroll_elements",
    "Read one element deeply (and optionally descendants) by ID. Returns content plus latest docRevision.",
    ScrollElementsArgsSchema,
  ),
  createClientTool(
    "add_paragraphs",
    "Insert paragraphs using insertions[] (one or more anchor+paragraph groups). Paragraphs support plain text and optional textStyle formatting. Use heading/paragraph IDs as anchors for targeted placement; use document/section anchor only for true prepend/append requests.",
    AddParagraphsArgsSchema,
  ),
  createClientTool(
    "replace_paragraph",
    "Edit one paragraph by ID. Use paragraph { text, textStyle? } for full replacement, or edit { start, end, text, textStyle? } for range-scoped edits that preserve formatting outside the edited range.",
    ReplaceParagraphArgsSchema,
  ),
  createClientTool(
    "add_table",
    "Insert one table near an anchor element.",
    AddTableArgsSchema,
  ),
  createClientTool(
    "replace_table",
    "Replace one table by ID.",
    ReplaceTableArgsSchema,
  ),
  createClientTool(
    "edit_image",
    "Resize an existing inline image by ID (width and/or height).",
    EditImageArgsSchema,
  ),
  createClientTool(
    "delete_element",
    "Delete a document element by ID.",
    DeleteElementArgsSchema,
  ),
  createClientTool(
    "set_table_header_text_style",
    "Apply text formatting to the first (header) row of a table by table ID.",
    SetTableHeaderTextStyleArgsSchema,
  ),
  createClientTool(
    "set_paragraph_text_style",
    "Apply text formatting to IDs. Paragraph IDs style whole paragraphs; inline-text IDs style only that range; table-row/table-cell IDs style paragraph text descendants.",
    SetParagraphTextStyleArgsSchema,
  ),
  createClientTool(
    "adjust_paragraph_text_style",
    "Adjust text formatting relatively on IDs. Paragraph IDs style whole paragraphs; inline-text IDs style only that range; table-row/table-cell IDs style paragraph text descendants. Use this for relative font-size changes (for example increase/decrease by N points).",
    AdjustParagraphTextStyleArgsSchema,
  ),
];

const messageToLangChain = (
  message: AssistantConversationMessage,
): BaseMessage => {
  if (message.role === "user") {
    return new HumanMessage(message.content);
  }

  if (message.role === "assistant") {
    return new AIMessage({
      content: message.content,
      tool_calls: message.toolCalls?.map((toolCall) => ({
        id: toolCall.id,
        name: toolCall.name,
        args: toolCall.args as Record<string, unknown>,
      })),
    });
  }

  return new ToolMessage({
    content: message.content,
    tool_call_id: message.toolCallId,
    name: message.name,
  });
};

const flattenMessageContent = (content: AIMessage["content"]): string => {
  if (typeof content === "string") {
    return content.trim();
  }

  if (!Array.isArray(content)) {
    return "";
  }

  return content
    .map((part) => {
      if (typeof part === "string") {
        return part;
      }
      if (part && typeof part === "object" && "text" in part) {
        const text = (part as { text?: unknown }).text;
        return typeof text === "string" ? text : "";
      }
      return "";
    })
    .join("\n")
    .trim();
};

const extractMessageDelta = (content: AIMessage["content"]): string => {
  if (typeof content === "string") {
    return content;
  }

  if (!Array.isArray(content)) {
    return "";
  }

  return content
    .map((part) => {
      if (typeof part === "string") {
        return part;
      }
      if (part && typeof part === "object" && "text" in part) {
        const text = (part as { text?: unknown }).text;
        return typeof text === "string" ? text : "";
      }
      return "";
    })
    .join("");
};
const normalizeToolCalls = (
  message: AIMessage,
): AssistantTurnResponse["toolCalls"] => {
  return (message.tool_calls ?? []).map((toolCall, index) =>
    AssistantToolCallSchema.parse({
      id: toolCall.id ?? `tool-call-${index + 1}`,
      name: toolCall.name,
      args: toolCall.args ?? {},
    }),
  );
};

export class OpenAiLlmProvider implements LlmProvider {
  readonly name = "openai" as const;

  async nextAssistantTurn(
    input: AssistantTurnRequest,
  ): Promise<AssistantTurnResponse> {
    const model =
      process.env.DOCUMENT_AUTHORING_AI_EXAMPLE_OPENAI_MODEL ?? "gpt-4o-mini";
    const reasoningEffort = parseReasoningEffort(
      process.env.DOCUMENT_AUTHORING_AI_EXAMPLE_OPENAI_REASONING_EFFORT,
    );
    const openAiApiKey = process.env.OPENAI_API_KEY;
    if (!openAiApiKey) {
      throw new Error("OPENAI_API_KEY is required.");
    }

    const llm = new ChatOpenAI({
      apiKey: openAiApiKey,
      model,
      temperature: 0.1,
      reasoning: {
        effort: reasoningEffort,
      },
    }).bindTools(assistantTools);

    const messages = await assistantPrompt.formatMessages({
      messages: input.messages.map(messageToLangChain),
    });

    let streamedResponse: AIMessageChunk | null = null;
    const stream = await llm.stream(messages);
    for await (const chunk of stream) {
      const aiChunk = chunk as AIMessageChunk;
      const textDelta = extractMessageDelta(aiChunk.content);
      if (textDelta.length > 0 && input.onAssistantDelta) {
        await input.onAssistantDelta({
          textDelta,
        });
      }
      streamedResponse = streamedResponse
        ? concat(streamedResponse, aiChunk)
        : aiChunk;
    }

    const response = streamedResponse
      ? new AIMessage({
          content: streamedResponse.content,
          tool_calls: streamedResponse.tool_calls,
        })
      : new AIMessage({ content: "" });
    const toolCalls = normalizeToolCalls(response);
    const assistantText = flattenMessageContent(response.content);

    return {
      assistantText,
      toolCalls,
      done: toolCalls.length === 0,
    };
  }
}
