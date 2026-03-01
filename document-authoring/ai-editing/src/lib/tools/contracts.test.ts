import { toJsonSchema } from "@langchain/core/utils/json_schema";
import { describe, expect, it } from "vitest";
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

describe("tool argument schemas", () => {
  const assertObjectSchema = (schema: Parameters<typeof toJsonSchema>[0]) => {
    const jsonSchema = toJsonSchema(schema) as {
      type?: string | string[];
      anyOf?: unknown;
      oneOf?: unknown;
      allOf?: unknown;
    };

    expect(jsonSchema.type).toBe("object");
    expect(jsonSchema.anyOf).toBeUndefined();
    expect(jsonSchema.oneOf).toBeUndefined();
    expect(jsonSchema.allOf).toBeUndefined();
  };

  it("keeps all tool schemas as top-level object schemas for OpenAI tool calling", () => {
    [
      ListElementsArgsSchema,
      SearchElementsArgsSchema,
      ScrollElementsArgsSchema,
      AddParagraphsArgsSchema,
      ReplaceParagraphArgsSchema,
      AddTableArgsSchema,
      ReplaceTableArgsSchema,
      EditImageArgsSchema,
      DeleteElementArgsSchema,
      SetTableHeaderTextStyleArgsSchema,
      SetParagraphTextStyleArgsSchema,
      AdjustParagraphTextStyleArgsSchema,
    ].forEach(assertObjectSchema);
  });

  it("accepts optional textStyle in paragraph inputs", () => {
    const parsed = AddParagraphsArgsSchema.parse({
      insertions: [
        {
          anchor: { id: "d-0", edge: "end" },
          paragraphs: [
            {
              text: "Welcome",
              textStyle: {
                bold: true,
              },
            },
          ],
        },
      ],
    });

    expect(parsed.insertions[0]?.paragraphs[0]?.textStyle).toEqual({
      bold: true,
    });
  });

  it("requires explicit kinds for search_elements and defaults to hybrid mode", () => {
    const parsed = SearchElementsArgsSchema.parse({
      query: "heading",
      kinds: ["paragraph"],
    });

    expect(parsed.mode).toBe("hybrid");
    expect(parsed.minScore).toBe(0.15);
    expect(parsed.kinds).toEqual(["paragraph"]);

    expect(() =>
      SearchElementsArgsSchema.parse({
        query: "heading",
      }),
    ).toThrow();
  });

  it("rejects unknown paragraph input properties", () => {
    expect(() =>
      AddParagraphsArgsSchema.parse({
        insertions: [
          {
            anchor: { id: "d-0", edge: "end" },
            paragraphs: [
              {
                text: "Invalid",
                styleId: "Heading 1",
              },
            ],
          },
        ],
      }),
    ).toThrow();

    expect(() =>
      AddParagraphsArgsSchema.parse({
        insertions: [
          {
            anchor: { id: "d-0", edge: "end" },
            paragraphs: [
              {
                text: "Invalid",
                list: { preset: "Bullet", level: 0 },
              },
            ],
          },
        ],
      }),
    ).toThrow();
  });

  it("supports full and range replace_paragraph payloads", () => {
    expect(
      ReplaceParagraphArgsSchema.parse({
        id: "p-0.1",
        paragraph: {
          text: "New paragraph text",
        },
      }),
    ).toMatchObject({
      id: "p-0.1",
      paragraph: {
        text: "New paragraph text",
      },
    });

    expect(
      ReplaceParagraphArgsSchema.parse({
        id: "p-0.1",
        edit: {
          start: 0,
          end: 5,
          text: "Updated",
        },
      }),
    ).toMatchObject({
      id: "p-0.1",
      edit: {
        start: 0,
        end: 5,
        text: "Updated",
      },
    });
  });

  it("requires exactly one replace_paragraph mode and validates range bounds", () => {
    expect(() =>
      ReplaceParagraphArgsSchema.parse({
        id: "p-0.1",
      }),
    ).toThrow(/exactly one of paragraph or edit/i);

    expect(() =>
      ReplaceParagraphArgsSchema.parse({
        id: "p-0.1",
        paragraph: { text: "A" },
        edit: { start: 0, end: 1, text: "B" },
      }),
    ).toThrow(/exactly one of paragraph or edit/i);

    expect(() =>
      ReplaceParagraphArgsSchema.parse({
        id: "p-0.1",
        edit: { start: 5, end: 3, text: "B" },
      }),
    ).toThrow(/greater than or equal to/i);
  });

  it("requires table ids for table header styling", () => {
    expect(
      SetTableHeaderTextStyleArgsSchema.parse({
        id: "t-0.2",
        style: { bold: true },
      }),
    ).toMatchObject({
      id: "t-0.2",
    });

    expect(() =>
      SetTableHeaderTextStyleArgsSchema.parse({
        id: "tr-0.2.0",
        style: { bold: true },
      }),
    ).toThrow(/Table id must use one of/i);
  });

  it("accepts paragraph, inline-text, and table-scoped ids for text-style tools", () => {
    expect(
      SetParagraphTextStyleArgsSchema.parse({
        ids: ["p-0.1", "it-0.2.0.0.0.0", "tc-0.2.0.1", "tr-0.2.0"],
        style: { bold: true },
      }),
    ).toMatchObject({
      ids: ["p-0.1", "it-0.2.0.0.0.0", "tc-0.2.0.1", "tr-0.2.0"],
    });

    expect(
      AdjustParagraphTextStyleArgsSchema.parse({
        ids: ["tc-0.2.0.0"],
        adjust: { fontSizeDelta: 2 },
      }),
    ).toMatchObject({
      ids: ["tc-0.2.0.0"],
    });

    expect(() =>
      SetParagraphTextStyleArgsSchema.parse({
        ids: ["t-0.2"],
        style: { bold: true },
      }),
    ).toThrow(/Text-style target id must use one of/i);

    expect(() =>
      SetParagraphTextStyleArgsSchema.parse({
        ids: ["s-0"],
        style: { bold: true },
      }),
    ).toThrow(/Text-style target id must use one of/i);
  });
});
