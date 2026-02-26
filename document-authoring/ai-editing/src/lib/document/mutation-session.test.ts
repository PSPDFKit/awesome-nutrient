import { describe, expect, it } from "vitest";
import { DocumentMutationSession } from "@/lib/document/mutation-session";

type FormattingCall = {
  style: Record<string, unknown>;
  range?: unknown;
  target?: string;
};

type InlineSeed = {
  text: string;
  fontSize: number | null;
};

type SetTextCall = {
  text: string;
  range?: { begin: number; end?: number };
};

const createParagraphDraft = (inlineSeeds: InlineSeed[]) => {
  const formattingCalls: FormattingCall[] = [];
  const inlineRanges: Array<{ start: number; end: number }> = [];

  let offset = 0;
  const inlineEntries = inlineSeeds.map((seed) => {
    const range = {
      start: offset,
      end: offset + seed.text.length,
    };
    offset = range.end;
    inlineRanges.push(range);
    return {
      range,
      inline: {
        type: "text" as const,
        plainText: () => seed.text,
        formatting: () => ({
          font: null,
          fontSize: seed.fontSize,
          bold: null,
          italic: null,
          underline: null,
          strikeout: null,
          color: null,
          highlight: null,
        }),
      },
    };
  });

  const inlineRange = inlineRanges[0] ?? { start: 0, end: 0 };

  const textView = {
    getPlainText: () => inlineSeeds.map((seed) => seed.text).join(""),
    inlines: () => inlineEntries,
    setFormatting: (style: Record<string, unknown>, range?: unknown) => {
      formattingCalls.push({ style, range });
    },
    setText: (nextText: string) => ({ start: 0, end: nextText.length }),
  };

  const paragraph = {
    type: "paragraph" as const,
    asTextView: () => textView,
  };

  const sectionContent = {
    blocklevels: () => [paragraph],
    addParagraph: () => paragraph,
    removeElement: () => undefined,
  };

  const section = {
    content: () => sectionContent,
  };

  const body = {
    sections: () => [section],
    addSection: () => section,
    removeSection: () => undefined,
  };

  const draft = {
    body: () => body,
  };

  return {
    draft,
    formattingCalls,
    inlineRange,
    inlineRanges,
  };
};

const createSingleParagraphDraft = (fontSize: number | null = null) =>
  createParagraphDraft([{ text: "marsupials", fontSize }]);

const createTableCellParagraphDraft = (fontSize: number | null = null) => {
  const formattingCalls: FormattingCall[] = [];

  const inline = {
    type: "text" as const,
    plainText: () => "Header",
    formatting: () => ({
      font: null,
      fontSize,
      bold: null,
      italic: null,
      underline: null,
      strikeout: null,
      color: null,
      highlight: null,
    }),
  };

  const inlineRange = { start: 0, end: "Header".length };
  const paragraph = {
    type: "paragraph" as const,
    asTextView: () => ({
      getPlainText: () => "Header",
      inlines: () => [{ range: inlineRange, inline }],
      setFormatting: (style: Record<string, unknown>, range?: unknown) => {
        formattingCalls.push({ style, range });
      },
      setText: (nextText: string) => ({ start: 0, end: nextText.length }),
    }),
  };

  const cell = {
    blocklevels: () => [paragraph],
    addParagraph: () => paragraph,
    removeElement: () => undefined,
  };

  const row = {
    cells: () => [cell],
    removeCell: () => undefined,
  };

  const table = {
    type: "table" as const,
    rows: () => [row],
    removeRow: () => undefined,
  };

  const sectionContent = {
    blocklevels: () => [table],
    addParagraph: () => paragraph,
    addTable: () => table,
    removeElement: () => undefined,
  };

  const section = {
    content: () => sectionContent,
  };

  const body = {
    sections: () => [section],
    addSection: () => section,
    removeSection: () => undefined,
  };

  const draft = {
    body: () => body,
  };

  return {
    draft,
    formattingCalls,
    inlineRange,
  };
};

const createTableHeaderBodyDraft = () => {
  const formattingCalls: FormattingCall[] = [];

  const createParagraph = (text: string, target: string) => ({
    type: "paragraph" as const,
    asTextView: () => ({
      getPlainText: () => text,
      inlines: () => [
        {
          range: { start: 0, end: text.length },
          inline: {
            type: "text" as const,
            plainText: () => text,
            formatting: () => ({
              font: null,
              fontSize: 11,
              bold: null,
              italic: null,
              underline: null,
              strikeout: null,
              color: null,
              highlight: null,
            }),
          },
        },
      ],
      setFormatting: (style: Record<string, unknown>, range?: unknown) => {
        formattingCalls.push({ style, range, target });
      },
      setText: (nextText: string) => ({ start: 0, end: nextText.length }),
    }),
  });

  const headerRow = {
    cells: () => [
      { blocklevels: () => [createParagraph("Property", "header")] },
      { blocklevels: () => [createParagraph("Value", "header")] },
    ],
    removeCell: () => undefined,
  };

  const bodyRow = {
    cells: () => [
      { blocklevels: () => [createParagraph("Surface Area", "body")] },
      { blocklevels: () => [createParagraph("37.9 million km²", "body")] },
    ],
    removeCell: () => undefined,
  };

  const table = {
    type: "table" as const,
    rows: () => [headerRow, bodyRow],
    removeRow: () => undefined,
  };

  const sectionContent = {
    blocklevels: () => [table],
    addParagraph: () => createParagraph("unused", "unused"),
    addTable: () => table,
    removeElement: () => undefined,
  };

  const section = {
    content: () => sectionContent,
  };

  const body = {
    sections: () => [section],
    addSection: () => section,
    removeSection: () => undefined,
  };

  const draft = {
    body: () => body,
  };

  return {
    draft,
    formattingCalls,
  };
};

const createReplaceParagraphDraft = (initialText: string) => {
  const formattingCalls: FormattingCall[] = [];
  const setTextCalls: SetTextCall[] = [];

  const textView = {
    getPlainText: () => initialText,
    inlines: () => [],
    setFormatting: (style: Record<string, unknown>, range?: unknown) => {
      formattingCalls.push({ style, range });
    },
    setText: (nextText: string, range?: { begin: number; end?: number }) => {
      setTextCalls.push({ text: nextText, range });
      if (range) {
        return {
          begin: range.begin,
          end: range.begin + nextText.length,
        };
      }
      return { begin: 0, end: nextText.length };
    },
  };

  const paragraph = {
    type: "paragraph" as const,
    asTextView: () => textView,
  };

  const sectionContent = {
    blocklevels: () => [paragraph],
    addParagraph: () => paragraph,
    removeElement: () => undefined,
  };

  const section = {
    content: () => sectionContent,
  };

  const body = {
    sections: () => [section],
    addSection: () => section,
    removeSection: () => undefined,
  };

  const draft = {
    body: () => body,
  };

  return {
    draft,
    formattingCalls,
    setTextCalls,
  };
};

const createSearchDraft = (paragraphInputs: Array<string | string[]>) => {
  const paragraphs = paragraphInputs.map((paragraphInput) => {
    const inlineChunks = Array.isArray(paragraphInput)
      ? paragraphInput
      : [paragraphInput];
    const paragraphText = inlineChunks.join("");
    return {
      type: "paragraph" as const,
      asTextView: () => ({
        getPlainText: () => paragraphText,
        inlines: () => {
          let offset = 0;
          return inlineChunks.map((chunk) => {
            const start = offset;
            const end = start + chunk.length;
            offset = end;
            return {
              range: { start, end },
              inline: {
                type: "text" as const,
                plainText: () => chunk,
                formatting: () => ({
                  font: null,
                  fontSize: 11,
                  bold: null,
                  italic: null,
                  underline: null,
                  strikeout: null,
                  color: null,
                  highlight: null,
                }),
              },
            };
          });
        },
        setFormatting: () => undefined,
        setText: (nextText: string) => ({ start: 0, end: nextText.length }),
      }),
    };
  });

  const sectionContent = {
    blocklevels: () => paragraphs,
    addParagraph: () => paragraphs[0],
    removeElement: () => undefined,
  };

  const section = {
    content: () => sectionContent,
  };

  const body = {
    sections: () => [section],
    addSection: () => section,
    removeSection: () => undefined,
  };

  const draft = {
    body: () => body,
  };

  return {
    draft,
  };
};

describe("DocumentMutationSession.searchElements", () => {
  it("supports regex-based exhaustive paragraph matching", () => {
    const { draft } = createSearchDraft([
      "Poets in the Middle Ages shaped literature.",
      "No historical phrase here.",
      "The middle ages influenced art and music.",
    ]);
    const session = new DocumentMutationSession(draft as never);

    const result = session.searchElements({
      query: "Middle Ages",
      mode: "exact_phrase",
      regex: {
        pattern: "middle\\s+ages",
        ignoreCase: true,
        multiline: false,
      },
      kinds: ["paragraph"],
      maxResults: 20,
      minScore: 0.15,
    });

    expect(result.matches.map((match) => match.element.id)).toEqual([
      "p-0.0",
      "p-0.2",
    ]);
    expect(result.matches.every((match) => match.score === 1)).toBe(true);
  });

  it("supports exact-phrase inline matching across split inline runs", () => {
    const { draft } = createSearchDraft([
      ["The ", "Middle", " ", "Ages", " shaped culture."],
      ["In ", "Middle", " ", "Ages", ", poetry thrived."],
    ]);
    const session = new DocumentMutationSession(draft as never);

    const result = session.searchElements({
      query: "Middle Ages",
      mode: "exact_phrase",
      regex: null,
      kinds: ["inline-text"],
      maxResults: 20,
      minScore: 0,
    });

    expect(result.matches.map((match) => match.element.id)).toEqual([
      "it-0.0.1",
      "it-0.0.2",
      "it-0.0.3",
      "it-0.1.1",
      "it-0.1.2",
      "it-0.1.3",
    ]);
  });
});

describe("DocumentMutationSession.replaceParagraph", () => {
  it("supports range edits and ignores empty textStyle payloads", async () => {
    const { draft, formattingCalls, setTextCalls } =
      createReplaceParagraphDraft("First sentence. Second sentence stays red.");
    const session = new DocumentMutationSession(draft as never);

    const result = await session.replaceParagraph({
      id: "p-0.0",
      edit: {
        start: 0,
        end: 15,
        text: "",
        textStyle: {},
      },
    });

    expect(result.id).toBe("p-0.0");
    expect(setTextCalls).toEqual([
      {
        text: "",
        range: { begin: 0, end: 15 },
      },
    ]);
    expect(formattingCalls).toEqual([]);
  });

  it("rejects range edits that exceed paragraph bounds", async () => {
    const { draft } = createReplaceParagraphDraft("Short");
    const session = new DocumentMutationSession(draft as never);

    await expect(
      session.replaceParagraph({
        id: "p-0.0",
        edit: {
          start: 0,
          end: 6,
          text: "",
        },
      }),
    ).rejects.toThrow(/exceeds paragraph length/i);
  });
});

describe("DocumentMutationSession.setParagraphTextStyle", () => {
  it("applies formatting to inline range when given inline-text ids", async () => {
    const { draft, formattingCalls, inlineRange } =
      createSingleParagraphDraft(11);
    const session = new DocumentMutationSession(draft as never);

    const result = await session.setParagraphTextStyle({
      ids: ["it-0.0.0"],
      style: {
        underline: true,
        color: "#0000ff",
      },
    });

    expect(result.updatedCount).toBe(1);
    expect(result.ids).toEqual(["it-0.0.0"]);
    expect(formattingCalls).toHaveLength(1);
    expect(formattingCalls[0]).toMatchObject({
      style: {
        underline: true,
        color: "#0000ff",
      },
      range: inlineRange,
    });
  });

  it("normalizes named CSS colors to hex before applying formatting", async () => {
    const { draft, formattingCalls, inlineRange } =
      createSingleParagraphDraft(11);
    const session = new DocumentMutationSession(draft as never);

    const result = await session.setParagraphTextStyle({
      ids: ["it-0.0.0"],
      style: {
        color: "red",
      },
    });

    expect(result.updatedCount).toBe(1);
    expect(formattingCalls).toHaveLength(1);
    expect(formattingCalls[0]).toMatchObject({
      style: {
        color: "#ff0000",
      },
      range: inlineRange,
    });
  });

  it("rejects unsupported element kinds for text styling", async () => {
    const { draft } = createSingleParagraphDraft();
    const session = new DocumentMutationSession(draft as never);

    await expect(
      session.setParagraphTextStyle({
        ids: ["s-0"],
        style: {
          underline: true,
        },
      }),
    ).rejects.toThrow(/Text-style target id must use one of/i);
  });

  it("applies formatting to descendant paragraph text when targeting a table cell id", async () => {
    const { draft, formattingCalls } = createTableCellParagraphDraft(11);
    const session = new DocumentMutationSession(draft as never);

    const result = await session.setParagraphTextStyle({
      ids: ["tc-0.0.0.0"],
      style: {
        bold: true,
      },
    });

    expect(result.updatedCount).toBe(1);
    expect(result.ids).toEqual(["p-0.0.0.0.0"]);
    expect(formattingCalls).toEqual([
      {
        style: {
          bold: true,
        },
        range: undefined,
      },
    ]);
  });
});

describe("DocumentMutationSession.adjustParagraphTextStyle", () => {
  it("applies relative font-size changes to inline-text targets", async () => {
    const { draft, formattingCalls, inlineRange } =
      createSingleParagraphDraft(11);
    const session = new DocumentMutationSession(draft as never);

    const result = await session.adjustParagraphTextStyle({
      ids: ["it-0.0.0"],
      adjust: {
        fontSizeDelta: 10,
      },
    });

    expect(result.updatedCount).toBe(1);
    expect(result.ids).toEqual(["it-0.0.0"]);
    expect(formattingCalls).toHaveLength(1);
    expect(formattingCalls[0]).toMatchObject({
      style: {
        fontSize: 21,
      },
      range: inlineRange,
    });
  });

  it("falls back to default size for inherited text when applying relative changes", async () => {
    const { draft, formattingCalls } = createSingleParagraphDraft(null);
    const session = new DocumentMutationSession(draft as never);

    await session.adjustParagraphTextStyle({
      ids: ["it-0.0.0"],
      adjust: {
        fontSizeDelta: 3,
      },
    });

    expect(formattingCalls).toHaveLength(1);
    expect(formattingCalls[0]).toMatchObject({
      style: {
        fontSize: 14,
      },
    });
  });

  it("applies relative font-size changes across each text inline when targeting a paragraph id", async () => {
    const { draft, formattingCalls, inlineRanges } = createParagraphDraft([
      { text: "Mercury ", fontSize: 12 },
      { text: "Venus", fontSize: 15 },
    ]);
    const session = new DocumentMutationSession(draft as never);

    const result = await session.adjustParagraphTextStyle({
      ids: ["p-0.0"],
      adjust: {
        fontSizeDelta: -2,
      },
    });

    expect(result.updatedCount).toBe(1);
    expect(result.ids).toEqual(["p-0.0"]);
    expect(formattingCalls).toEqual([
      {
        style: { fontSize: 10 },
        range: inlineRanges[0],
      },
      {
        style: { fontSize: 13 },
        range: inlineRanges[1],
      },
    ]);
  });

  it("rejects unsupported element kinds for relative text style changes", async () => {
    const { draft } = createSingleParagraphDraft(11);
    const session = new DocumentMutationSession(draft as never);

    await expect(
      session.adjustParagraphTextStyle({
        ids: ["s-0"],
        adjust: {
          fontSizeDelta: 2,
        },
      }),
    ).rejects.toThrow(/Text-style target id must use one of/i);
  });
});

describe("DocumentMutationSession.setTableHeaderTextStyle", () => {
  it("styles only the first table row when given a table id", async () => {
    const { draft, formattingCalls } = createTableHeaderBodyDraft();
    const session = new DocumentMutationSession(draft as never);

    const result = await session.setTableHeaderTextStyle({
      id: "t-0.0",
      style: {
        bold: true,
      },
    });

    expect(result.updatedCount).toBe(2);
    expect(formattingCalls).toHaveLength(2);
    expect(formattingCalls.map((call) => call.target)).toEqual([
      "header",
      "header",
    ]);
    expect(formattingCalls.every((call) => call.style.bold === true)).toBe(
      true,
    );
  });
});
