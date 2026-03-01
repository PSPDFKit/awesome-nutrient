import type { Programmatic } from "@nutrient-sdk/document-authoring";
import type { z } from "zod";
import {
  getInlineContextAt,
  getParagraphAt,
  getSectionAt,
  getTableCellAt,
  getTableRowAt,
  getTopLevelBlockAt,
} from "@/lib/document/navigation";
import {
  ElementSearchIndex,
  normalizeSearchText,
  type SearchableElement,
  tokenizeSearchText,
} from "@/lib/document/search-index";
import {
  AddParagraphsArgsSchema,
  AddTableArgsSchema,
  AdjustParagraphTextStyleArgsSchema,
  DeleteElementArgsSchema,
  EditImageArgsSchema,
  type ElementDescriptor,
  type ElementKind,
  ListElementsArgsSchema,
  ListElementsResultSchema,
  ReplaceParagraphArgsSchema,
  ReplaceTableArgsSchema,
  ScrollElementsArgsSchema,
  ScrollElementsResultSchema,
  SearchElementsArgsSchema,
  SearchElementsResultSchema,
  SetParagraphTextStyleArgsSchema,
  SetTableHeaderTextStyleArgsSchema,
  type SupportedToolName,
  ToolExecutionArgsSchemas,
  type ToolName,
} from "@/lib/tools/contracts";

type IndexedElement = SearchableElement & {
  parentId?: string;
};

type BlockLocation = {
  container: Programmatic.BlockLevelContainer;
  index: number;
};

type ParagraphTextStyleTarget =
  | {
      id: string;
      kind: "paragraph";
      path: number[];
    }
  | {
      id: string;
      kind: "inline-text";
      path: number[];
      paragraphId: string;
    };

const DOCUMENT_ID = "d-0";

const normalizeText = normalizeSearchText;

const tokenize = tokenizeSearchText;

const escapeRegExp = (value: string): string =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const truncateText = (value: string, maxChars: number): string =>
  value.length <= maxChars
    ? value
    : `${value.slice(0, Math.max(0, maxChars - 1))}…`;

const truncatePreview = (value: string, maxChars = 100): string => {
  const compact = value.trim().replace(/\s+/g, " ");
  if (compact.length === 0) {
    return "(empty)";
  }
  if (compact.length <= maxChars) {
    return compact;
  }
  return `${compact.slice(0, Math.max(0, maxChars - 1))}…`;
};

const hashString = (value: string): string => {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash +=
      (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
  }
  return `h${(hash >>> 0).toString(16)}`;
};

const comparePaths = (left: number[], right: number[]): number => {
  const maxLength = Math.max(left.length, right.length);
  for (let index = 0; index < maxLength; index += 1) {
    const leftValue = left[index] ?? -1;
    const rightValue = right[index] ?? -1;
    if (leftValue < rightValue) {
      return -1;
    }
    if (leftValue > rightValue) {
      return 1;
    }
  }
  return 0;
};

const prefixByKind: Record<ElementKind, string> = {
  document: "d",
  section: "s",
  paragraph: "p",
  table: "t",
  "table-row": "tr",
  "table-cell": "tc",
  "inline-text": "it",
  "inline-image": "img",
};

const buildElementId = (kind: ElementKind, path: number[]): string => {
  if (kind === "document") {
    return DOCUMENT_ID;
  }
  return `${prefixByKind[kind]}-${path.join(".")}`;
};

const isDescendantPath = (
  ancestorPath: number[],
  candidatePath: number[],
): boolean => {
  if (candidatePath.length <= ancestorPath.length) {
    return false;
  }

  for (let index = 0; index < ancestorPath.length; index += 1) {
    if (candidatePath[index] !== ancestorPath[index]) {
      return false;
    }
  }
  return true;
};

const readInlineText = (inline: Programmatic.Inline): string => {
  if (inline.type === "text") {
    return inline.plainText();
  }
  if (inline.type === "image") {
    const extent = inline.extent();
    return `[image ${extent.width}x${extent.height}]`;
  }
  return `[${inline.type}]`;
};

const blockLevelToText = (block: Programmatic.BlockLevel): string => {
  if (block.type === "paragraph") {
    return block.asTextView().getPlainText();
  }

  return block
    .rows()
    .map((row) =>
      row
        .cells()
        .map((cell) =>
          cell
            .blocklevels()
            .map((cellBlock) =>
              cellBlock.type === "paragraph"
                ? cellBlock.asTextView().getPlainText()
                : "[table]",
            )
            .join(" "),
        )
        .join(" | "),
    )
    .join("\n");
};

const ensureTableRow = (
  table: Programmatic.Table,
  rowIndex: number,
): Programmatic.TableRow => {
  while (table.rows().length <= rowIndex) {
    table.addRow();
  }
  return table.rows()[rowIndex]!;
};

const ensureTableCell = (
  row: Programmatic.TableRow,
  cellIndex: number,
): Programmatic.TableCell => {
  while (row.cells().length <= cellIndex) {
    row.addCell();
  }
  return row.cells()[cellIndex]!;
};

const setTableCellPlainText = (
  cell: Programmatic.TableCell,
  value: string,
): void => {
  const blockLevels = cell.blocklevels();
  const firstParagraph =
    blockLevels.find(
      (blockLevel): blockLevel is Programmatic.Paragraph =>
        blockLevel.type === "paragraph",
    ) ?? cell.addParagraph(0);
  firstParagraph.asTextView().setText(value);

  for (let index = blockLevels.length - 1; index >= 0; index -= 1) {
    if (blockLevels[index] !== firstParagraph) {
      cell.removeElement(index);
    }
  }
};

const normalizeTableData = (
  headers: string[],
  rows: string[][],
): {
  headerRow: string[];
  bodyRows: string[][];
  maxColumns: number;
} => {
  const maxColumns = Math.max(
    headers.length,
    ...rows.map((row) => row.length),
    1,
  );
  const padRow = (row: string[]): string[] => {
    const next = [...row];
    while (next.length < maxColumns) {
      next.push("");
    }
    return next.slice(0, maxColumns);
  };

  return {
    headerRow: padRow(headers),
    bodyRows: rows.map((row) => padRow(row)),
    maxColumns,
  };
};

const applyTableContent = (
  table: Programmatic.Table,
  headers: string[],
  rows: string[][],
): void => {
  const { headerRow, bodyRows, maxColumns } = normalizeTableData(headers, rows);
  const expectedRowCount = 1 + bodyRows.length;

  while (table.rows().length < expectedRowCount) {
    table.addRow();
  }
  while (table.rows().length > expectedRowCount) {
    table.removeRow(table.rows().length - 1);
  }

  const writeRow = (rowIndex: number, values: string[]) => {
    const row = ensureTableRow(table, rowIndex);
    for (let columnIndex = 0; columnIndex < maxColumns; columnIndex += 1) {
      const cell = ensureTableCell(row, columnIndex);
      setTableCellPlainText(cell, values[columnIndex] ?? "");
    }
    while (row.cells().length > maxColumns) {
      row.removeCell(row.cells().length - 1);
    }
  };

  writeRow(0, headerRow);
  bodyRows.forEach((rowValues, rowIndex) => {
    writeRow(rowIndex + 1, rowValues);
  });
};

const DEFAULT_FONT_SIZE_POINTS = 11;
const MIN_FONT_SIZE_POINTS = 1;
const MAX_FONT_SIZE_POINTS = 400;

const clampFontSize = (value: number): number =>
  Math.min(MAX_FONT_SIZE_POINTS, Math.max(MIN_FONT_SIZE_POINTS, value));

const resolveInlineFontSize = (inline: Programmatic.Inline): number => {
  if (inline.type !== "text") {
    return DEFAULT_FONT_SIZE_POINTS;
  }
  const candidate = inline.formatting().fontSize;
  if (
    typeof candidate === "number" &&
    Number.isFinite(candidate) &&
    candidate > 0
  ) {
    return candidate;
  }
  return DEFAULT_FONT_SIZE_POINTS;
};

const hasFormattingOverrides = (
  style: Partial<Programmatic.Formatting> | undefined,
): style is Partial<Programmatic.Formatting> =>
  style !== undefined && Object.keys(style).length > 0;

const NAMED_COLOR_TO_HEX: Record<string, string> = {
  black: "#000000",
  blue: "#0000ff",
  cyan: "#00ffff",
  gray: "#808080",
  grey: "#808080",
  green: "#008000",
  magenta: "#ff00ff",
  orange: "#ffa500",
  purple: "#800080",
  red: "#ff0000",
  white: "#ffffff",
  yellow: "#ffff00",
};

const toHexByte = (value: number): string =>
  value.toString(16).padStart(2, "0");

const parseRgbToHex = (value: string): string | null => {
  const rgbMatch = value.match(
    /^rgba?\(\s*([+-]?\d{1,3})\s*,\s*([+-]?\d{1,3})\s*,\s*([+-]?\d{1,3})(?:\s*,\s*(?:0|1|0?\.\d+))?\s*\)$/i,
  );
  if (!rgbMatch) {
    return null;
  }

  const rgb = rgbMatch
    .slice(1, 4)
    .map((part) => Number.parseInt(part ?? "", 10));
  if (
    rgb.some(
      (channel) => !Number.isFinite(channel) || channel < 0 || channel > 255,
    )
  ) {
    return null;
  }

  return `#${toHexByte(rgb[0] ?? 0)}${toHexByte(rgb[1] ?? 0)}${toHexByte(rgb[2] ?? 0)}`;
};

const normalizeColor = (value: string): string | null => {
  const trimmed = value.trim().toLowerCase();
  if (trimmed.length === 0) {
    return null;
  }

  const named = NAMED_COLOR_TO_HEX[trimmed];
  if (named) {
    return named;
  }

  const shortHexMatch = trimmed.match(/^#([0-9a-f]{3})$/i);
  if (shortHexMatch) {
    const hex = shortHexMatch[1];
    if (!hex) {
      return null;
    }
    const [r, g, b] = hex.split("");
    return `#${r}${r}${g}${g}${b}${b}`;
  }

  const fullHexMatch = trimmed.match(/^#([0-9a-f]{6})$/i);
  if (fullHexMatch) {
    const hex = fullHexMatch[1];
    if (!hex) {
      return null;
    }
    return `#${hex.toLowerCase()}`;
  }

  return parseRgbToHex(trimmed);
};

const normalizeFormattingStyle = (
  style: Partial<Programmatic.Formatting> | undefined,
): Partial<Programmatic.Formatting> | undefined => {
  if (!style) {
    return undefined;
  }

  const normalized: Partial<Programmatic.Formatting> = { ...style };

  if (typeof normalized.color === "string") {
    const color = normalizeColor(normalized.color);
    if (color) {
      normalized.color = color;
    } else {
      delete normalized.color;
    }
  }

  if (typeof normalized.highlight === "string") {
    const highlight = normalizeColor(normalized.highlight);
    if (highlight) {
      normalized.highlight = highlight;
    } else {
      delete normalized.highlight;
    }
  }

  return normalized;
};

const setFormattingIfPresent = (
  textView: Programmatic.TextView,
  style: Partial<Programmatic.Formatting> | undefined,
  range?: Programmatic.Range,
): void => {
  const normalized = normalizeFormattingStyle(style);
  if (!hasFormattingOverrides(normalized)) {
    return;
  }
  textView.setFormatting(normalized, range);
};

const applyParagraphInput = (
  paragraph: Programmatic.Paragraph,
  input: {
    text: string;
    textStyle?: Partial<Programmatic.Formatting>;
  },
): void => {
  const textView = paragraph.asTextView();
  const range = textView.setText(input.text);

  setFormattingIfPresent(textView, input.textStyle, range);
};

export class DocumentMutationSession {
  private indexedElements: IndexedElement[] = [];
  private indexedById = new Map<string, IndexedElement>();
  private readonly searchIndex = new ElementSearchIndex();

  constructor(private readonly draft: Programmatic.Document) {
    this.rebuildIndex();
  }

  private createElement(input: Omit<IndexedElement, "id">): IndexedElement {
    return {
      ...input,
      id: buildElementId(input.kind, input.path),
      preview: truncatePreview(input.preview),
    };
  }

  private addParagraphElements(
    nodes: IndexedElement[],
    paragraph: Programmatic.Paragraph,
    paragraphPath: number[],
    parentId: string,
    label: string,
  ): void {
    const textView = paragraph.asTextView();
    const paragraphText = textView.getPlainText();
    const paragraphElement = this.createElement({
      parentId,
      kind: "paragraph",
      path: paragraphPath,
      preview: paragraphText.length > 0 ? paragraphText : label,
      searchText: normalizeText(paragraphText),
    });
    nodes.push(paragraphElement);

    textView.inlines().forEach((entry, inlineIndex) => {
      const kind: ElementKind =
        entry.inline.type === "image" ? "inline-image" : "inline-text";
      const inlineText = readInlineText(entry.inline);
      nodes.push(
        this.createElement({
          parentId: paragraphElement.id,
          kind,
          path: [...paragraphPath, inlineIndex],
          preview:
            inlineText.length > 0
              ? inlineText
              : `${label} / inline ${inlineIndex + 1}`,
          searchText: normalizeText(inlineText),
        }),
      );
    });
  }

  private buildIndex(): IndexedElement[] {
    const nodes: IndexedElement[] = [
      this.createElement({
        kind: "document",
        path: [0],
        preview: "Document",
        searchText: "document",
      }),
    ];

    const sections = this.draft.body().sections();
    sections.forEach((section, sectionIndex) => {
      const sectionPath = [sectionIndex];
      const sectionElement = this.createElement({
        parentId: DOCUMENT_ID,
        kind: "section",
        path: sectionPath,
        preview: `Section ${sectionIndex + 1}`,
        searchText: `section ${sectionIndex + 1}`,
      });
      nodes.push(sectionElement);

      section
        .content()
        .blocklevels()
        .forEach((block, blockIndex) => {
          const topLevelPath = [sectionIndex, blockIndex];
          const blockLabel = `Section ${sectionIndex + 1} / block ${blockIndex + 1}`;
          if (block.type === "paragraph") {
            this.addParagraphElements(
              nodes,
              block,
              topLevelPath,
              sectionElement.id,
              `${blockLabel} / paragraph`,
            );
            return;
          }

          const tableElement = this.createElement({
            parentId: sectionElement.id,
            kind: "table",
            path: topLevelPath,
            preview: `${blockLabel} / table`,
            searchText: normalizeText(blockLevelToText(block)),
          });
          nodes.push(tableElement);

          block.rows().forEach((row, rowIndex) => {
            const rowPath = [sectionIndex, blockIndex, rowIndex];
            const rowElement = this.createElement({
              parentId: tableElement.id,
              kind: "table-row",
              path: rowPath,
              preview: `${blockLabel} / row ${rowIndex + 1}`,
              searchText: `row ${rowIndex + 1}`,
            });
            nodes.push(rowElement);

            row.cells().forEach((cell, cellIndex) => {
              const cellPath = [sectionIndex, blockIndex, rowIndex, cellIndex];
              const cellElement = this.createElement({
                parentId: rowElement.id,
                kind: "table-cell",
                path: cellPath,
                preview: `${blockLabel} / row ${rowIndex + 1} / cell ${cellIndex + 1}`,
                searchText: normalizeText(
                  cell
                    .blocklevels()
                    .map((cellBlock) =>
                      cellBlock.type === "paragraph"
                        ? cellBlock.asTextView().getPlainText()
                        : "[table]",
                    )
                    .join(" "),
                ),
              });
              nodes.push(cellElement);

              cell.blocklevels().forEach((cellBlock, paragraphIndex) => {
                if (cellBlock.type !== "paragraph") {
                  return;
                }
                this.addParagraphElements(
                  nodes,
                  cellBlock,
                  [
                    sectionIndex,
                    blockIndex,
                    rowIndex,
                    cellIndex,
                    paragraphIndex,
                  ],
                  cellElement.id,
                  `${blockLabel} / row ${rowIndex + 1} / cell ${cellIndex + 1} / paragraph ${paragraphIndex + 1}`,
                );
              });
            });
          });
        });
    });

    return nodes.sort((left, right) => comparePaths(left.path, right.path));
  }

  rebuildIndex(): void {
    this.indexedElements = this.buildIndex();
    this.indexedById = new Map(
      this.indexedElements.map((element) => [element.id, element]),
    );
    this.searchIndex.rebuild(this.indexedElements);
  }

  revision(): string {
    const digest = this.indexedElements
      .map(
        (element) =>
          `${element.id}|${element.kind}|${element.parentId ?? ""}|${element.searchText}`,
      )
      .join(";");
    return `rev-${this.indexedElements.length}-${hashString(digest)}`;
  }

  private toDescriptor(
    element: IndexedElement,
    text?: string,
  ): ElementDescriptor {
    return {
      id: element.id,
      ...(element.parentId ? { parentId: element.parentId } : {}),
      kind: element.kind,
      path: element.path,
      preview: element.preview,
      ...(text !== undefined ? { text } : {}),
    };
  }

  private requireElement(id: string): IndexedElement {
    const element = this.indexedById.get(id);
    if (!element) {
      throw new Error(`Element not found: ${id}`);
    }
    return element;
  }

  private buildSearchSnippets(
    rawText: string,
    normalizedRawText: string,
    queryTerms: string[],
    normalizedQuery: string,
  ): string[] {
    if (rawText.length === 0) {
      return [];
    }

    const snippets: string[] = [];
    if (
      normalizedQuery.length > 0 &&
      normalizedRawText.includes(normalizedQuery)
    ) {
      const phraseIndex = normalizedRawText.indexOf(normalizedQuery);
      const start = Math.max(0, phraseIndex - 50);
      const end = Math.min(
        rawText.length,
        phraseIndex + normalizedQuery.length + 50,
      );
      snippets.push(truncateText(rawText.slice(start, end), 180));
    }

    queryTerms
      .filter((term) => normalizedRawText.includes(term))
      .slice(0, 3)
      .forEach((term) => {
        const index = normalizedRawText.indexOf(term);
        if (index < 0) {
          return;
        }
        const start = Math.max(0, index - 40);
        const end = Math.min(rawText.length, index + term.length + 40);
        snippets.push(truncateText(rawText.slice(start, end), 160));
      });

    return [...new Set(snippets)].slice(0, 4);
  }

  private findInlineExactPhraseMatches(input: {
    query: string;
    normalizedQuery: string;
    queryTerms: string[];
    maxResults: number;
  }): Array<{
    element: IndexedElement;
    snippets: string[];
  }> {
    const pattern = input.query.trim();
    if (pattern.length === 0) {
      return [];
    }

    const matcher = new RegExp(escapeRegExp(pattern), "gi");
    const matches: Array<{
      element: IndexedElement;
      snippets: string[];
    }> = [];
    const seenInlineIds = new Set<string>();
    const paragraphElements = this.indexedElements.filter(
      (element): element is IndexedElement => element.kind === "paragraph",
    );

    for (const paragraphElement of paragraphElements) {
      if (matches.length >= input.maxResults) {
        break;
      }

      const paragraph = getParagraphAt(this.draft, paragraphElement.path);
      const textView = paragraph.asTextView();
      const paragraphText = textView.getPlainText();
      const normalizedParagraphText = normalizeText(paragraphText);
      if (!normalizedParagraphText.includes(input.normalizedQuery)) {
        continue;
      }

      const inlineRanges: Array<{ id: string; start: number; end: number }> =
        [];
      let cursor = 0;
      textView.inlines().forEach((entry, inlineIndex) => {
        if (entry.inline.type !== "text") {
          return;
        }
        const inlineText = entry.inline.plainText();
        if (inlineText.length === 0) {
          return;
        }

        const start = paragraphText
          .toLowerCase()
          .indexOf(inlineText.toLowerCase(), cursor);
        if (start < 0) {
          return;
        }
        const end = start + inlineText.length;
        cursor = end;

        inlineRanges.push({
          id: buildElementId("inline-text", [
            ...paragraphElement.path,
            inlineIndex,
          ]),
          start,
          end,
        });
      });

      matcher.lastIndex = 0;
      let match = matcher.exec(paragraphText);
      while (match && matches.length < input.maxResults) {
        const matchStart = match.index;
        const matchEnd = matchStart + match[0].length;
        const snippetHits = this.buildSearchSnippets(
          paragraphText,
          normalizedParagraphText,
          input.queryTerms,
          input.normalizedQuery,
        );

        inlineRanges
          .filter((range) => range.end > matchStart && range.start < matchEnd)
          .forEach((range) => {
            if (
              seenInlineIds.has(range.id) ||
              matches.length >= input.maxResults
            ) {
              return;
            }
            const inlineElement = this.indexedById.get(range.id);
            if (!inlineElement || inlineElement.kind !== "inline-text") {
              return;
            }

            seenInlineIds.add(range.id);
            matches.push({
              element: inlineElement,
              snippets: snippetHits,
            });
          });

        if (match[0].length === 0) {
          matcher.lastIndex += 1;
        }
        match = matcher.exec(paragraphText);
      }
    }

    return matches;
  }

  private readElementText(element: IndexedElement): string {
    switch (element.kind) {
      case "document":
        return this.draft
          .body()
          .sections()
          .map((section) =>
            section.content().blocklevels().map(blockLevelToText).join("\n\n"),
          )
          .join("\n\n")
          .trim();
      case "section":
        return getSectionAt(this.draft, element.path[0]!)
          .content()
          .blocklevels()
          .map(blockLevelToText)
          .join("\n\n")
          .trim();
      case "paragraph":
        return getParagraphAt(this.draft, element.path)
          .asTextView()
          .getPlainText();
      case "table": {
        const block = getTopLevelBlockAt(
          this.draft,
          element.path[0]!,
          element.path[1]!,
        );
        if (block.type !== "table") {
          throw new Error("Target element is not a table.");
        }
        return blockLevelToText(block);
      }
      case "table-row":
        return getTableRowAt(this.draft, element.path)
          .cells()
          .map((cell) =>
            cell
              .blocklevels()
              .map((block) =>
                block.type === "paragraph"
                  ? block.asTextView().getPlainText()
                  : "[table]",
              )
              .join(" "),
          )
          .join(" | ");
      case "table-cell":
        return getTableCellAt(this.draft, element.path)
          .blocklevels()
          .map((block) =>
            block.type === "paragraph"
              ? block.asTextView().getPlainText()
              : "[table]",
          )
          .join("\n");
      case "inline-text":
      case "inline-image": {
        const inline = getInlineContextAt(this.draft, element.path);
        if (inline.inline.type === "text") {
          return inline.inline.plainText();
        }
        if (inline.inline.type === "image") {
          const extent = inline.inline.extent();
          return `[image ${extent.width}x${extent.height}]`;
        }
        return `[${inline.inline.type}]`;
      }
      default:
        return "";
    }
  }

  private resolveBlockLocation(element: IndexedElement): BlockLocation {
    if (element.kind === "paragraph") {
      if (element.path.length === 2) {
        return {
          container: getSectionAt(this.draft, element.path[0]!).content(),
          index: element.path[1]!,
        };
      }
      if (element.path.length >= 5) {
        return {
          container: getTableCellAt(this.draft, element.path),
          index: element.path[4]!,
        };
      }
    }

    if (element.kind === "table") {
      return {
        container: getSectionAt(this.draft, element.path[0]!).content(),
        index: element.path[1]!,
      };
    }

    if (element.kind === "inline-text" || element.kind === "inline-image") {
      const paragraphElement = this.requireElement(
        buildElementId("paragraph", element.path.slice(0, -1)),
      );
      return this.resolveBlockLocation(paragraphElement);
    }

    throw new Error(
      `Element ${element.id} is not a movable block-level element.`,
    );
  }

  private resolveInsertionTarget(
    anchorId: string,
    edge: "begin" | "end",
  ): BlockLocation {
    const anchor = this.requireElement(anchorId);

    if (anchor.kind === "document") {
      const section = getSectionAt(this.draft, 0);
      const content = section.content();
      return {
        container: content,
        index: edge === "begin" ? 0 : content.blocklevels().length,
      };
    }

    if (anchor.kind === "section") {
      const content = getSectionAt(this.draft, anchor.path[0]!).content();
      return {
        container: content,
        index: edge === "begin" ? 0 : content.blocklevels().length,
      };
    }

    if (anchor.kind === "paragraph" || anchor.kind === "table") {
      const location = this.resolveBlockLocation(anchor);
      if (edge === "begin") {
        return location;
      }
      return {
        container: location.container,
        index: location.index + 1,
      };
    }

    if (anchor.kind === "inline-text" || anchor.kind === "inline-image") {
      const paragraphElement = this.requireElement(
        buildElementId("paragraph", anchor.path.slice(0, -1)),
      );
      return this.resolveInsertionTarget(paragraphElement.id, edge);
    }

    if (anchor.kind === "table-row" || anchor.kind === "table-cell") {
      const tableElement = this.requireElement(
        buildElementId("table", anchor.path.slice(0, 2)),
      );
      return this.resolveInsertionTarget(tableElement.id, edge);
    }

    throw new Error(`Unsupported anchor kind: ${anchor.kind}`);
  }

  listElements(args: unknown): z.infer<typeof ListElementsResultSchema> {
    const parsedArgs = ListElementsArgsSchema.parse(args);
    this.rebuildIndex();
    const parent = this.requireElement(parsedArgs.parentId);
    const children = this.indexedElements.filter(
      (element) => element.parentId === parent.id,
    );
    const paged = children.slice(
      parsedArgs.offset,
      parsedArgs.offset + parsedArgs.limit,
    );
    return ListElementsResultSchema.parse({
      docRevision: this.revision(),
      parentId: parent.id,
      offset: parsedArgs.offset,
      limit: parsedArgs.limit,
      total: children.length,
      elements: paged.map((element) => this.toDescriptor(element)),
    });
  }

  searchElements(args: unknown): z.infer<typeof SearchElementsResultSchema> {
    const parsedArgs = SearchElementsArgsSchema.parse(args);
    this.rebuildIndex();

    const normalizedQuery = normalizeText(parsedArgs.query);
    const queryTerms = tokenize(parsedArgs.query);
    const allowedKinds = new Set(parsedArgs.kinds);

    if (parsedArgs.regex) {
      const flags = `${parsedArgs.regex.multiline ? "m" : ""}${parsedArgs.regex.ignoreCase ? "i" : ""}`;
      let matcher: RegExp;
      try {
        matcher = new RegExp(parsedArgs.regex.pattern, flags);
      } catch (error) {
        throw new Error(
          `Invalid search_elements.regex pattern "${parsedArgs.regex.pattern}": ${
            error instanceof Error ? error.message : String(error)
          }`,
        );
      }

      const matches = this.indexedElements
        .filter((element) => allowedKinds.has(element.kind))
        .filter((element) => {
          const rawText = this.readElementText(element);
          matcher.lastIndex = 0;
          return matcher.test(rawText);
        })
        .slice(0, parsedArgs.maxResults)
        .map((element) => {
          const rawText = this.readElementText(element);
          const normalized = normalizeText(rawText);
          const snippetHits = this.buildSearchSnippets(
            rawText,
            normalized,
            queryTerms,
            normalizedQuery,
          );

          return {
            element: this.toDescriptor(element),
            score: 1,
            scoreBreakdown: {
              bm25: 0,
              phrase: 0,
              proximity: 0,
              kindPrior: 1,
              positionPrior: 1,
              final: 1,
            },
            snippets: snippetHits,
          };
        });

      return SearchElementsResultSchema.parse({
        docRevision: this.revision(),
        query: parsedArgs.query,
        mode: parsedArgs.mode,
        matches,
      });
    }

    const shouldUseInlineExactPhraseMatching =
      parsedArgs.regex === null &&
      parsedArgs.mode === "exact_phrase" &&
      allowedKinds.has("inline-text") &&
      queryTerms.length > 1;

    const inlineExactPhraseMatches = shouldUseInlineExactPhraseMatching
      ? this.findInlineExactPhraseMatches({
          query: parsedArgs.query,
          normalizedQuery,
          queryTerms,
          maxResults: parsedArgs.maxResults,
        })
      : [];

    const rankingKinds = shouldUseInlineExactPhraseMatching
      ? parsedArgs.kinds.filter((kind) => kind !== "inline-text")
      : parsedArgs.kinds;

    const rankedMatches =
      rankingKinds.length > 0
        ? this.searchIndex.search({
            query: parsedArgs.query,
            mode: parsedArgs.mode,
            kinds: rankingKinds,
            maxResults: parsedArgs.maxResults,
            minScore: parsedArgs.minScore,
          })
        : [];

    const rankedResults = rankedMatches.map(
      ({ elementId, score, scoreBreakdown }) => {
        const element = this.requireElement(elementId);
        const rawText = this.readElementText(element);
        const normalized = normalizeText(rawText);
        const snippetHits = this.buildSearchSnippets(
          rawText,
          normalized,
          queryTerms,
          normalizedQuery,
        );

        return {
          element: this.toDescriptor(element),
          score,
          scoreBreakdown,
          snippets: snippetHits,
        };
      },
    );

    const inlineResults = inlineExactPhraseMatches.map((match) => ({
      element: this.toDescriptor(match.element),
      score: 1,
      scoreBreakdown: {
        bm25: 0,
        phrase: 1,
        proximity: 0,
        kindPrior: 1,
        positionPrior: 1,
        final: 1,
      },
      snippets: match.snippets,
    }));

    const matches = [...inlineResults, ...rankedResults]
      .sort((left, right) =>
        comparePaths(left.element.path, right.element.path),
      )
      .slice(0, parsedArgs.maxResults);

    return SearchElementsResultSchema.parse({
      docRevision: this.revision(),
      query: parsedArgs.query,
      mode: parsedArgs.mode,
      matches,
    });
  }

  scrollElements(args: unknown): z.infer<typeof ScrollElementsResultSchema> {
    const parsedArgs = ScrollElementsArgsSchema.parse(args);
    this.rebuildIndex();
    const element = this.indexedById.get(parsedArgs.id);
    if (!element) {
      return ScrollElementsResultSchema.parse({
        status: "not-found",
        docRevision: this.revision(),
      });
    }

    const descendants = parsedArgs.includeDescendants
      ? this.indexedElements
          .filter((candidate) => isDescendantPath(element.path, candidate.path))
          .slice(0, parsedArgs.maxDescendants)
          .map((candidate) =>
            this.toDescriptor(
              candidate,
              truncateText(this.readElementText(candidate), 400),
            ),
          )
      : undefined;

    return ScrollElementsResultSchema.parse({
      status: "resolved",
      docRevision: this.revision(),
      element: this.toDescriptor(element),
      content: truncateText(this.readElementText(element), parsedArgs.maxChars),
      ...(descendants !== undefined ? { descendants } : {}),
    });
  }

  async addParagraphs(
    args: unknown,
  ): Promise<{ docRevision: string; insertedCount: number }> {
    const parsedArgs = AddParagraphsArgsSchema.parse(args);
    this.rebuildIndex();

    const mergedInsertions = parsedArgs.insertions.reduce<
      Array<{
        anchor: { id: string; edge: "begin" | "end" };
        paragraphs: (typeof parsedArgs.insertions)[number]["paragraphs"];
      }>
    >((accumulator, insertion) => {
      const existing = accumulator.find(
        (candidate) =>
          candidate.anchor.id === insertion.anchor.id &&
          candidate.anchor.edge === insertion.anchor.edge,
      );
      if (existing) {
        existing.paragraphs.push(...insertion.paragraphs);
        return accumulator;
      }
      accumulator.push({
        anchor: {
          id: insertion.anchor.id,
          edge: insertion.anchor.edge,
        },
        paragraphs: [...insertion.paragraphs],
      });
      return accumulator;
    }, []);

    const orderedInsertions = mergedInsertions
      .map((insertion, insertionOrder) => {
        const anchorElement = this.requireElement(insertion.anchor.id);
        return {
          insertion,
          insertionOrder,
          anchorPath: anchorElement.path,
        };
      })
      // Apply later anchors first so path-based IDs for earlier anchors remain valid.
      .sort((left, right) => {
        const byPathDescending = comparePaths(
          right.anchorPath,
          left.anchorPath,
        );
        if (byPathDescending !== 0) {
          return byPathDescending;
        }
        return left.insertionOrder - right.insertionOrder;
      });

    let insertedCount = 0;
    orderedInsertions.forEach(({ insertion }) => {
      this.rebuildIndex();
      const target = this.resolveInsertionTarget(
        insertion.anchor.id,
        insertion.anchor.edge,
      );
      let insertionIndex = target.index;
      insertion.paragraphs.forEach((paragraphInput) => {
        const paragraph = target.container.addParagraph(insertionIndex);
        insertionIndex += 1;
        applyParagraphInput(paragraph, paragraphInput);
      });
      insertedCount += insertion.paragraphs.length;
    });

    this.rebuildIndex();
    return {
      docRevision: this.revision(),
      insertedCount,
    };
  }

  async replaceParagraph(
    args: unknown,
  ): Promise<{ docRevision: string; id: string }> {
    const parsedArgs = ReplaceParagraphArgsSchema.parse(args);
    this.rebuildIndex();

    const element = this.requireElement(parsedArgs.id);
    if (element.kind !== "paragraph") {
      throw new Error(
        `replace_paragraph requires paragraph id, got ${element.kind}.`,
      );
    }

    const paragraph = getParagraphAt(this.draft, element.path);
    if (parsedArgs.paragraph) {
      applyParagraphInput(paragraph, parsedArgs.paragraph);
    } else if (parsedArgs.edit) {
      const textView = paragraph.asTextView();
      const currentText = textView.getPlainText();
      if (parsedArgs.edit.end > currentText.length) {
        throw new Error(
          `replace_paragraph edit range end (${parsedArgs.edit.end}) exceeds paragraph length (${currentText.length}).`,
        );
      }
      const replacedRange = textView.setText(parsedArgs.edit.text, {
        begin: parsedArgs.edit.start,
        end: parsedArgs.edit.end,
      });
      setFormattingIfPresent(
        textView,
        parsedArgs.edit.textStyle,
        replacedRange,
      );
    } else {
      throw new Error(
        "replace_paragraph resolved with neither paragraph nor edit payload.",
      );
    }

    this.rebuildIndex();
    const updated = this.indexedElements.find(
      (candidate) =>
        candidate.kind === "paragraph" &&
        comparePaths(candidate.path, element.path) === 0,
    );
    return {
      docRevision: this.revision(),
      id: updated?.id ?? parsedArgs.id,
    };
  }

  async addTable(
    args: unknown,
  ): Promise<{ docRevision: string; insertedCount: number }> {
    const parsedArgs = AddTableArgsSchema.parse(args);
    this.rebuildIndex();

    const target = this.resolveInsertionTarget(
      parsedArgs.anchor.id,
      parsedArgs.anchor.edge,
    );
    const table = target.container.addTable(target.index);
    applyTableContent(table, parsedArgs.table.headers, parsedArgs.table.rows);

    this.rebuildIndex();
    return {
      docRevision: this.revision(),
      insertedCount: 1,
    };
  }

  async replaceTable(
    args: unknown,
  ): Promise<{ docRevision: string; id: string }> {
    const parsedArgs = ReplaceTableArgsSchema.parse(args);
    this.rebuildIndex();

    const element = this.requireElement(parsedArgs.id);
    if (element.kind !== "table") {
      throw new Error(`replace_table requires table id, got ${element.kind}.`);
    }

    const location = this.resolveBlockLocation(element);
    location.container.removeElement(location.index);
    const table = location.container.addTable(location.index);
    applyTableContent(table, parsedArgs.table.headers, parsedArgs.table.rows);

    this.rebuildIndex();
    return {
      docRevision: this.revision(),
      id: this.requireElement(buildElementId("table", element.path)).id,
    };
  }

  async editImage(args: unknown): Promise<{ docRevision: string; id: string }> {
    const parsedArgs = EditImageArgsSchema.parse(args);
    this.rebuildIndex();

    const element = this.requireElement(parsedArgs.id);
    if (element.kind !== "inline-image") {
      throw new Error(
        `edit_image requires inline-image id, got ${element.kind}.`,
      );
    }

    const context = getInlineContextAt(this.draft, element.path);
    if (context.inline.type !== "image") {
      throw new Error(`Element ${parsedArgs.id} is not an image inline.`);
    }

    context.inline.setExtent({
      ...(parsedArgs.width !== undefined ? { width: parsedArgs.width } : {}),
      ...(parsedArgs.height !== undefined ? { height: parsedArgs.height } : {}),
    });

    this.rebuildIndex();
    return {
      docRevision: this.revision(),
      id: parsedArgs.id,
    };
  }

  async deleteElement(
    args: unknown,
  ): Promise<{ docRevision: string; id: string }> {
    const parsedArgs = DeleteElementArgsSchema.parse(args);
    this.rebuildIndex();

    const element = this.requireElement(parsedArgs.id);
    if (element.kind === "document") {
      throw new Error("Cannot delete the root document.");
    }

    if (element.kind === "section") {
      const body = this.draft.body();
      if (body.sections().length > 1) {
        body.removeSection(element.path[0]!);
      } else {
        const content = getSectionAt(this.draft, element.path[0]!).content();
        for (
          let index = content.blocklevels().length - 1;
          index >= 0;
          index -= 1
        ) {
          content.removeElement(index);
        }
      }
      this.rebuildIndex();
      return { docRevision: this.revision(), id: parsedArgs.id };
    }

    if (element.kind === "table-row") {
      const table = getTopLevelBlockAt(
        this.draft,
        element.path[0]!,
        element.path[1]!,
      );
      if (table.type !== "table") {
        throw new Error("Target row parent is not a table.");
      }
      table.removeRow(element.path[2]!);
      this.rebuildIndex();
      return { docRevision: this.revision(), id: parsedArgs.id };
    }

    if (element.kind === "table-cell") {
      const row = getTableRowAt(this.draft, element.path);
      row.removeCell(element.path[3]!);
      this.rebuildIndex();
      return { docRevision: this.revision(), id: parsedArgs.id };
    }

    if (element.kind === "inline-text" || element.kind === "inline-image") {
      const context = getInlineContextAt(this.draft, element.path);
      context.paragraph.asTextView().setText("", context.range);
      this.rebuildIndex();
      return { docRevision: this.revision(), id: parsedArgs.id };
    }

    const location = this.resolveBlockLocation(element);
    location.container.removeElement(location.index);
    this.rebuildIndex();
    return { docRevision: this.revision(), id: parsedArgs.id };
  }

  async setTableHeaderTextStyle(
    args: unknown,
  ): Promise<{ docRevision: string; id: string; updatedCount: number }> {
    const parsedArgs = SetTableHeaderTextStyleArgsSchema.parse(args);
    this.rebuildIndex();

    const element = this.requireElement(parsedArgs.id);
    if (element.kind !== "table") {
      throw new Error(
        `set_table_header_text_style requires table id, got ${element.kind}.`,
      );
    }

    const block = getTopLevelBlockAt(
      this.draft,
      element.path[0]!,
      element.path[1]!,
    );
    if (block.type !== "table") {
      throw new Error(`Element ${parsedArgs.id} is not a table.`);
    }

    const headerRow = block.rows()[0];
    if (!headerRow) {
      this.rebuildIndex();
      return {
        docRevision: this.revision(),
        id: parsedArgs.id,
        updatedCount: 0,
      };
    }

    let updatedCount = 0;
    headerRow.cells().forEach((cell) => {
      cell.blocklevels().forEach((cellBlock) => {
        if (cellBlock.type !== "paragraph") {
          return;
        }
        updatedCount += 1;
        setFormattingIfPresent(cellBlock.asTextView(), parsedArgs.style);
      });
    });

    this.rebuildIndex();
    return {
      docRevision: this.revision(),
      id: parsedArgs.id,
      updatedCount,
    };
  }

  private resolveParagraphTextStyleTargetsByIds(
    ids: string[],
  ): ParagraphTextStyleTarget[] {
    const resolveFromElement = (
      element: IndexedElement,
    ): ParagraphTextStyleTarget[] => {
      if (element.kind === "paragraph") {
        return [
          {
            id: element.id,
            kind: "paragraph" as const,
            path: element.path,
          },
        ];
      }

      if (element.kind === "inline-text") {
        const paragraphId = buildElementId(
          "paragraph",
          element.path.slice(0, -1),
        );
        this.requireElement(paragraphId);
        return [
          {
            id: element.id,
            kind: "inline-text" as const,
            path: element.path,
            paragraphId,
          },
        ];
      }

      if (element.kind === "table-row" || element.kind === "table-cell") {
        const paragraphTargets = this.indexedElements
          .filter((candidate) => {
            if (candidate.kind !== "paragraph") {
              return false;
            }
            return isDescendantPath(element.path, candidate.path);
          })
          .map((candidate) => ({
            id: candidate.id,
            kind: "paragraph" as const,
            path: candidate.path,
          }));

        if (paragraphTargets.length === 0) {
          throw new Error(
            `No paragraph text targets found under ${element.id}.`,
          );
        }
        return paragraphTargets;
      }

      throw new Error(
        `set_paragraph_text_style requires paragraph, inline-text, table-row, or table-cell id, got ${element.kind}.`,
      );
    };

    const targets = ids.flatMap((id) =>
      resolveFromElement(this.requireElement(id)),
    );

    const uniqueById = new Map<string, ParagraphTextStyleTarget>();
    targets.forEach((target) => {
      if (!uniqueById.has(target.id)) {
        uniqueById.set(target.id, target);
      }
    });

    return [...uniqueById.values()].sort((left, right) =>
      comparePaths(left.path, right.path),
    );
  }

  async setParagraphTextStyle(
    args: unknown,
  ): Promise<{ docRevision: string; ids: string[]; updatedCount: number }> {
    const parsedArgs = SetParagraphTextStyleArgsSchema.parse(args);
    this.rebuildIndex();

    const targets = this.resolveParagraphTextStyleTargetsByIds(parsedArgs.ids);
    targets.forEach((target) => {
      if (target.kind === "paragraph") {
        const paragraph = getParagraphAt(this.draft, target.path);
        setFormattingIfPresent(paragraph.asTextView(), parsedArgs.style);
        return;
      }

      const inlineContext = getInlineContextAt(this.draft, target.path);
      if (inlineContext.inline.type !== "text") {
        throw new Error(
          `Inline-style target must be text, got ${inlineContext.inline.type}.`,
        );
      }
      setFormattingIfPresent(
        inlineContext.paragraph.asTextView(),
        parsedArgs.style,
        inlineContext.range,
      );
    });

    this.rebuildIndex();
    return {
      docRevision: this.revision(),
      ids: targets.map((target) => target.id),
      updatedCount: targets.length,
    };
  }

  async adjustParagraphTextStyle(
    args: unknown,
  ): Promise<{ docRevision: string; ids: string[]; updatedCount: number }> {
    const parsedArgs = AdjustParagraphTextStyleArgsSchema.parse(args);
    this.rebuildIndex();

    const targets = this.resolveParagraphTextStyleTargetsByIds(parsedArgs.ids);
    const delta = parsedArgs.adjust.fontSizeDelta;

    targets.forEach((target) => {
      if (target.kind === "paragraph") {
        const paragraph = getParagraphAt(this.draft, target.path);
        const textView = paragraph.asTextView();
        const inlines = textView.inlines();
        let styledInlineCount = 0;

        inlines.forEach((rangeInline) => {
          if (rangeInline.inline.type !== "text") {
            return;
          }
          styledInlineCount += 1;
          const nextFontSize = clampFontSize(
            resolveInlineFontSize(rangeInline.inline) + delta,
          );
          textView.setFormatting({ fontSize: nextFontSize }, rangeInline.range);
        });

        if (styledInlineCount === 0) {
          const fallbackFontSize = clampFontSize(
            DEFAULT_FONT_SIZE_POINTS + delta,
          );
          textView.setFormatting({ fontSize: fallbackFontSize });
        }
        return;
      }

      const inlineContext = getInlineContextAt(this.draft, target.path);
      if (inlineContext.inline.type !== "text") {
        throw new Error(
          `Inline-style target must be text, got ${inlineContext.inline.type}.`,
        );
      }
      const nextFontSize = clampFontSize(
        resolveInlineFontSize(inlineContext.inline) + delta,
      );
      inlineContext.paragraph
        .asTextView()
        .setFormatting({ fontSize: nextFontSize }, inlineContext.range);
    });

    this.rebuildIndex();
    return {
      docRevision: this.revision(),
      ids: targets.map((target) => target.id),
      updatedCount: targets.length,
    };
  }

  async executeToolCall(name: ToolName, args: unknown): Promise<unknown> {
    switch (name) {
      case "list_elements":
        return this.listElements(args);
      case "search_elements":
        return this.searchElements(args);
      case "scroll_elements":
        return this.scrollElements(args);
      case "add_paragraphs":
        return this.addParagraphs(args);
      case "replace_paragraph":
        return this.replaceParagraph(args);
      case "add_table":
        return this.addTable(args);
      case "replace_table":
        return this.replaceTable(args);
      case "edit_image":
        return this.editImage(args);
      case "delete_element":
        return this.deleteElement(args);
      case "set_table_header_text_style":
        return this.setTableHeaderTextStyle(args);
      case "set_paragraph_text_style":
        return this.setParagraphTextStyle(args);
      case "adjust_paragraph_text_style":
        return this.adjustParagraphTextStyle(args);
      default: {
        const exhaustive: never = name;
        throw new Error(`Unsupported tool name: ${String(exhaustive)}`);
      }
    }
  }

  static parseToolArgs<TName extends SupportedToolName>(
    name: TName,
    args: unknown,
  ) {
    return ToolExecutionArgsSchemas[name].parse(args);
  }
}
