import { beforeEach, describe, expect, it, vi } from "vitest";
import { OpenAiLlmProvider } from "@/lib/llm/providers/openai-provider";

const mockInvoke = vi.fn();
const mockBindTools = vi.fn();
const mockChatOpenAiCtor = vi.fn();

const toAsyncIterable = <T>(values: T[]): AsyncIterable<T> => ({
  async *[Symbol.asyncIterator]() {
    for (const value of values) {
      yield value;
    }
  },
});

vi.mock("@langchain/openai", () => ({
  ChatOpenAI: class {
    constructor(fields?: unknown) {
      mockChatOpenAiCtor(fields);
    }

    bindTools(...args: unknown[]) {
      mockBindTools(...args);
      return {
        stream: async () => {
          const payload = (await mockInvoke()) as unknown;
          return toAsyncIterable(Array.isArray(payload) ? payload : [payload]);
        },
      };
    }
  },
}));

describe("OpenAiLlmProvider", () => {
  beforeEach(() => {
    process.env.OPENAI_API_KEY = "test-key";
    delete process.env.DOCUMENT_AUTHORING_AI_EXAMPLE_OPENAI_REASONING_EFFORT;
    mockInvoke.mockReset();
    mockBindTools.mockReset();
    mockChatOpenAiCtor.mockReset();
  });

  it("returns assistant text and tool calls from model tool-calling output", async () => {
    mockInvoke.mockResolvedValue({
      content: "I will inspect the document first.",
      tool_calls: [
        {
          id: "tool-1",
          name: "list_elements",
          args: {
            parentId: "d-0",
            offset: 0,
            limit: 50,
          },
        },
      ],
    });

    const provider = new OpenAiLlmProvider();
    const result = await provider.nextAssistantTurn({
      messages: [
        {
          role: "user",
          content: "Write two paragraphs about Spain.",
        },
      ],
    });

    expect(result.assistantText).toContain("inspect");
    expect(result.toolCalls).toHaveLength(1);
    expect(result.toolCalls[0]).toMatchObject({
      id: "tool-1",
      name: "list_elements",
      args: {
        parentId: "d-0",
      },
    });
    expect(result.done).toBe(false);
    expect(mockBindTools).toHaveBeenCalledTimes(1);
  });

  it("emits assistant deltas while streaming chunks", async () => {
    mockInvoke.mockResolvedValue([
      {
        content: "Completed",
      },
      {
        content: " update.",
      },
    ]);

    const onAssistantDelta = vi.fn();
    const provider = new OpenAiLlmProvider();
    const result = await provider.nextAssistantTurn({
      messages: [
        {
          role: "user",
          content: "Do it",
        },
      ],
      onAssistantDelta,
    });

    expect(onAssistantDelta).toHaveBeenNthCalledWith(1, {
      textDelta: "Completed",
    });
    expect(onAssistantDelta).toHaveBeenNthCalledWith(2, {
      textDelta: " update.",
    });
    expect(result.assistantText).toBe("Completed update.");
  });

  it("preserves mixed read/write calls as emitted by the model", async () => {
    mockInvoke.mockResolvedValue({
      content: "I will inspect first.",
      tool_calls: [
        {
          id: "tool-read-1",
          name: "list_elements",
          args: {
            parentId: "d-0",
            offset: 0,
            limit: 50,
          },
        },
        {
          id: "tool-write-1",
          name: "add_paragraphs",
          args: {
            expectedRevision: "rev-1",
            anchor: { id: "d-0", edge: "end" },
            paragraphs: [{ text: "Heading" }],
          },
        },
      ],
    });

    const provider = new OpenAiLlmProvider();
    const result = await provider.nextAssistantTurn({
      messages: [
        {
          role: "user",
          content: "Write a heading.",
        },
      ],
    });

    expect(result.toolCalls).toHaveLength(2);
    expect(result.toolCalls[0]?.name).toBe("list_elements");
    expect(result.toolCalls[1]).toMatchObject({
      name: "add_paragraphs",
      args: {
        expectedRevision: "rev-1",
        anchor: { id: "d-0", edge: "end" },
        paragraphs: [{ text: "Heading" }],
      },
    });
  });

  it("passes replace_paragraph payloads through without local textStyle rewriting", async () => {
    mockInvoke.mockResolvedValue({
      content: "Updating paragraph.",
      tool_calls: [
        {
          id: "tool-write-1",
          name: "replace_paragraph",
          args: {
            id: "p-0.1",
            paragraph: {
              text: "Updated text",
              textStyle: {},
            },
          },
        },
      ],
    });

    const provider = new OpenAiLlmProvider();
    const result = await provider.nextAssistantTurn({
      messages: [
        {
          role: "user",
          content: "Update this paragraph wording only.",
        },
        {
          role: "assistant",
          content: "Inspecting paragraph first.",
          toolCalls: [
            {
              id: "tool-read-1",
              name: "list_elements",
              args: { parentId: "d-0", offset: 0, limit: 50 },
            },
          ],
        },
        {
          role: "tool",
          toolCallId: "tool-read-1",
          name: "list_elements",
          content: JSON.stringify({
            docRevision: "rev-2",
            parentId: "d-0",
            offset: 0,
            limit: 50,
            total: 1,
            elements: [],
          }),
        },
      ],
    });

    expect(result.toolCalls).toHaveLength(1);
    expect(result.toolCalls[0]).toMatchObject({
      name: "replace_paragraph",
      args: {
        id: "p-0.1",
        paragraph: {
          text: "Updated text",
          textStyle: {},
        },
      },
    });
  });

  it("keeps write-only calls as emitted by the model", async () => {
    mockInvoke.mockResolvedValue({
      content: "Applying changes.",
      tool_calls: [
        {
          id: "tool-write-1",
          name: "add_paragraphs",
          args: {
            expectedRevision: "rev-1",
            anchor: { id: "d-0", edge: "end" },
            paragraphs: [{ text: "Paragraph text" }],
          },
        },
      ],
    });

    const provider = new OpenAiLlmProvider();
    const result = await provider.nextAssistantTurn({
      messages: [
        {
          role: "user",
          content: "Add a paragraph.",
        },
      ],
    });

    expect(result.toolCalls).toHaveLength(1);
    expect(result.toolCalls[0]).toMatchObject({
      name: "add_paragraphs",
      args: {
        expectedRevision: "rev-1",
        anchor: { id: "d-0", edge: "end" },
        paragraphs: [{ text: "Paragraph text" }],
      },
    });
  });

  it("keeps write-call payload shape unchanged", async () => {
    mockInvoke.mockResolvedValue({
      content: "Applying update.",
      tool_calls: [
        {
          id: "tool-write-2",
          name: "add_paragraphs",
          args: {
            expectedRevision: "rev-2",
            anchor: { id: "p-0.1", edge: "after" },
            paragraphs: [{ text: "Supporting paragraph." }],
          },
        },
      ],
    });

    const provider = new OpenAiLlmProvider();
    const result = await provider.nextAssistantTurn({
      messages: [
        {
          role: "user",
          content: "Add supporting details under the heading.",
        },
        {
          role: "assistant",
          content: "I will inspect the current structure first.",
          toolCalls: [
            {
              id: "tool-read-1",
              name: "list_elements",
              args: { parentId: "d-0", offset: 0, limit: 50 },
            },
          ],
        },
        {
          role: "tool",
          toolCallId: "tool-read-1",
          name: "list_elements",
          content: JSON.stringify({
            docRevision: "rev-2",
            parentId: "d-0",
            offset: 0,
            limit: 50,
            total: 2,
            elements: [],
          }),
        },
      ],
    });

    expect(result.toolCalls).toHaveLength(1);
    expect(result.toolCalls[0]).toMatchObject({
      name: "add_paragraphs",
      args: {
        expectedRevision: "rev-2",
        anchor: { id: "p-0.1", edge: "after" },
        paragraphs: [{ text: "Supporting paragraph." }],
      },
    });
  });

  it("keeps multiple write calls in a single assistant turn", async () => {
    mockInvoke.mockResolvedValue({
      content: "Continuing edits.",
      tool_calls: [
        {
          id: "tool-write-3a",
          name: "add_paragraphs",
          args: {
            anchor: { id: "p-0.1", edge: "after" },
            paragraphs: [{ text: "Planet paragraph." }],
          },
        },
        {
          id: "tool-write-3b",
          name: "add_paragraphs",
          args: {
            anchor: { id: "p-0.2", edge: "after" },
            paragraphs: [{ text: "Second paragraph." }],
          },
        },
      ],
    });

    const provider = new OpenAiLlmProvider();
    const result = await provider.nextAssistantTurn({
      messages: [
        {
          role: "user",
          content: "Complete each heading.",
        },
        {
          role: "assistant",
          content: "Inspecting headings first.",
          toolCalls: [
            {
              id: "tool-read-1",
              name: "list_elements",
              args: { parentId: "d-0", offset: 0, limit: 100 },
            },
          ],
        },
        {
          role: "tool",
          toolCallId: "tool-read-1",
          name: "list_elements",
          content: JSON.stringify({
            docRevision: "rev-9",
            parentId: "d-0",
            offset: 0,
            limit: 100,
            total: 8,
            elements: [],
          }),
        },
      ],
    });

    expect(result.toolCalls).toHaveLength(2);
    expect(result.toolCalls[0]).toMatchObject({
      name: "add_paragraphs",
      args: {
        anchor: { id: "p-0.1", edge: "after" },
        paragraphs: [{ text: "Planet paragraph." }],
      },
    });
    expect(result.toolCalls[1]).toMatchObject({
      name: "add_paragraphs",
      args: {
        anchor: { id: "p-0.2", edge: "after" },
        paragraphs: [{ text: "Second paragraph." }],
      },
    });
  });

  it("keeps adjust_paragraph_text_style payloads untouched", async () => {
    mockInvoke.mockResolvedValue({
      content: "Adjusting font size.",
      tool_calls: [
        {
          id: "tool-write-adjust-style",
          name: "adjust_paragraph_text_style",
          args: {
            id: "p-0.4",
            adjust: {
              fontSizeDelta: 10,
            },
          },
        },
      ],
    });

    const provider = new OpenAiLlmProvider();
    const result = await provider.nextAssistantTurn({
      messages: [
        {
          role: "user",
          content: "Increase this paragraph by 10 points.",
        },
        {
          role: "assistant",
          content: "Inspecting structure first.",
          toolCalls: [
            {
              id: "tool-read-1",
              name: "list_elements",
              args: { parentId: "d-0", offset: 0, limit: 100 },
            },
          ],
        },
        {
          role: "tool",
          toolCallId: "tool-read-1",
          name: "list_elements",
          content: JSON.stringify({
            docRevision: "rev-11",
            parentId: "d-0",
            offset: 0,
            limit: 100,
            total: 3,
            elements: [],
          }),
        },
      ],
    });

    expect(result.toolCalls).toHaveLength(1);
    expect(result.toolCalls[0]).toMatchObject({
      name: "adjust_paragraph_text_style",
      args: {
        adjust: {
          fontSizeDelta: 10,
        },
      },
    });
  });

  it("keeps legacy before/after anchor edge values unchanged", async () => {
    mockInvoke.mockResolvedValue({
      content: "Applying edits.",
      tool_calls: [
        {
          id: "tool-write-edge",
          name: "add_paragraphs",
          args: {
            anchor: { id: "p-0.3", edge: "before" },
            paragraphs: [{ text: "Inserted before anchor." }],
          },
        },
      ],
    });

    const provider = new OpenAiLlmProvider();
    const result = await provider.nextAssistantTurn({
      messages: [
        {
          role: "user",
          content: "Insert before that heading.",
        },
        {
          role: "assistant",
          content: "Inspecting headings first.",
          toolCalls: [
            {
              id: "tool-read-1",
              name: "search_elements",
              args: {
                query: "heading",
                mode: "hybrid",
                kinds: ["paragraph"],
                maxResults: 5,
              },
            },
          ],
        },
        {
          role: "tool",
          toolCallId: "tool-read-1",
          name: "search_elements",
          content: JSON.stringify({
            docRevision: "rev-10",
            query: "heading",
            mode: "hybrid",
            matches: [],
          }),
        },
      ],
    });

    expect(result.toolCalls).toHaveLength(1);
    expect(result.toolCalls[0]).toMatchObject({
      name: "add_paragraphs",
      args: {
        anchor: { id: "p-0.3", edge: "before" },
        paragraphs: [{ text: "Inserted before anchor." }],
      },
    });
  });

  it("preserves paragraph textStyle payloads for add_paragraphs", async () => {
    mockInvoke.mockResolvedValue({
      content: "Creating formatted paragraph.",
      tool_calls: [
        {
          id: "tool-write-format-inline",
          name: "add_paragraphs",
          args: {
            insertions: [
              {
                anchor: { id: "d-0", edge: "end" },
                paragraphs: [
                  {
                    text: "Welcome",
                    textStyle: {
                      bold: true,
                      fontSize: 14,
                    },
                  },
                ],
              },
            ],
          },
        },
      ],
    });

    const provider = new OpenAiLlmProvider();
    const result = await provider.nextAssistantTurn({
      messages: [
        {
          role: "user",
          content: "Create a formatted paragraph with welcome.",
        },
        {
          role: "assistant",
          content: "Inspecting structure first.",
          toolCalls: [
            {
              id: "tool-read-1",
              name: "list_elements",
              args: { parentId: "d-0", offset: 0, limit: 100 },
            },
          ],
        },
        {
          role: "tool",
          toolCallId: "tool-read-1",
          name: "list_elements",
          content: JSON.stringify({
            docRevision: "rev-11",
            parentId: "d-0",
            offset: 0,
            limit: 100,
            total: 1,
            elements: [],
          }),
        },
      ],
    });

    expect(result.toolCalls).toHaveLength(1);
    expect(result.toolCalls[0]).toMatchObject({
      name: "add_paragraphs",
      args: {
        insertions: [
          {
            anchor: { id: "d-0", edge: "end" },
            paragraphs: [
              {
                text: "Welcome",
                textStyle: {
                  bold: true,
                  fontSize: 14,
                },
              },
            ],
          },
        ],
      },
    });
  });

  it("marks run as done when model emits no tool calls", async () => {
    mockInvoke.mockResolvedValue({
      content: "Completed.",
      tool_calls: [],
    });

    const provider = new OpenAiLlmProvider();
    const result = await provider.nextAssistantTurn({
      messages: [
        {
          role: "user",
          content: "Thanks",
        },
      ],
    });

    expect(result.assistantText).toBe("Completed.");
    expect(result.toolCalls).toHaveLength(0);
    expect(result.done).toBe(true);
  });

  it("throws when OPENAI_API_KEY is missing", async () => {
    delete process.env.OPENAI_API_KEY;
    const provider = new OpenAiLlmProvider();

    await expect(
      provider.nextAssistantTurn({
        messages: [
          {
            role: "user",
            content: "Hello",
          },
        ],
      }),
    ).rejects.toThrow(/OPENAI_API_KEY is required/i);
  });
});
