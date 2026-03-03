import type { Programmatic } from "@nutrient-sdk/document-authoring";

export type InlineContext = {
  paragraph: Programmatic.Paragraph;
  range: Programmatic.Range;
  inline: Programmatic.Inline;
};

export const getSectionAt = (
  draft: Programmatic.Document,
  sectionIndex: number,
): Programmatic.Section => {
  const existing = draft.body().sections()[sectionIndex];
  if (existing) {
    return existing;
  }
  return draft.body().addSection(sectionIndex);
};

export const getTopLevelBlockAt = (
  draft: Programmatic.Document,
  sectionIndex: number,
  blockIndex: number,
): Programmatic.BlockLevel => {
  const block = getSectionAt(draft, sectionIndex).content().blocklevels()[
    blockIndex
  ];
  if (!block) {
    throw new Error(
      `Block ${blockIndex} does not exist in section ${sectionIndex}.`,
    );
  }
  return block;
};

export const getTableRowAt = (
  draft: Programmatic.Document,
  path: number[],
): Programmatic.TableRow => {
  if (path.length < 3) {
    throw new Error("Table-row path is incomplete.");
  }
  const [sectionIndex, blockIndex, rowIndex] = path;
  const block = getTopLevelBlockAt(draft, sectionIndex, blockIndex);
  if (block.type !== "table") {
    throw new Error("Target path does not point to a table.");
  }
  const row = block.rows()[rowIndex];
  if (!row) {
    throw new Error(`Table row ${rowIndex} does not exist.`);
  }
  return row;
};

export const getTableCellAt = (
  draft: Programmatic.Document,
  path: number[],
): Programmatic.TableCell => {
  if (path.length < 4) {
    throw new Error("Table-cell path is incomplete.");
  }
  const row = getTableRowAt(draft, path);
  const cell = row.cells()[path[3]!];
  if (!cell) {
    throw new Error(`Table cell ${path[3]} does not exist.`);
  }
  return cell;
};

export const getParagraphAt = (
  draft: Programmatic.Document,
  path: number[],
): Programmatic.Paragraph => {
  if (path.length === 2) {
    const block = getTopLevelBlockAt(draft, path[0]!, path[1]!);
    if (block.type !== "paragraph") {
      throw new Error("Target path does not point to a paragraph.");
    }
    return block;
  }

  if (path.length >= 5) {
    const cell = getTableCellAt(draft, path);
    const paragraph = cell.blocklevels()[path[4]!];
    if (!paragraph || paragraph.type !== "paragraph") {
      throw new Error("Target path does not point to a table-cell paragraph.");
    }
    return paragraph;
  }

  throw new Error("Unsupported paragraph path.");
};

export const getInlineContextAt = (
  draft: Programmatic.Document,
  path: number[],
): InlineContext => {
  if (path.length !== 3 && path.length !== 6) {
    throw new Error("Unsupported inline path.");
  }
  const paragraphPath = path.slice(0, path.length - 1);
  const inlineIndex = path[path.length - 1]!;
  const paragraph = getParagraphAt(draft, paragraphPath);
  const rangeInline = paragraph.asTextView().inlines()[inlineIndex];
  if (!rangeInline) {
    throw new Error(`Inline ${inlineIndex} does not exist.`);
  }
  return {
    paragraph,
    range: rangeInline.range,
    inline: rangeInline.inline,
  };
};
