import type { ApplyTemplateOptions, TemplateData } from "../types";
import { PlaceholderType } from "../types";
import { TemplateParser } from "./parser/template-parser";
import { ConditionalProcessor } from "./processors/conditional-processor";
import { LoopProcessor } from "./processors/loop-processor";
import { PlaceholderReplacer } from "./processors/placeholder-replacer";

/**
 * Apply template data to an open Document Authoring instance
 *
 * @param instance - The Document Authoring SDK instance
 * @param data - Template data with config and model
 * @param options - Additional options
 */
export async function applyTemplateData(
  instance: any,
  data: TemplateData,
  _options: ApplyTemplateOptions = {},
): Promise<void> {
  const { config, model } = data;
  const parser = new TemplateParser(config.delimiter);
  const replacer = new PlaceholderReplacer(model, config.defaultValue);
  const conditionalProcessor = new ConditionalProcessor(model);
  const loopProcessor = new LoopProcessor(model);

  try {
    console.log("[DocumentTemplating] Starting applyTemplateData");
    console.log("[DocumentTemplating] Instance:", instance);
    console.log("[DocumentTemplating] Config:", config);
    console.log("[DocumentTemplating] Model:", model);

    // Access the document through the programmatic API
    // Use transaction to make atomic changes
    await instance.transaction(async ({ draft }: any) => {
      console.log("[DocumentTemplating] Inside transaction, draft:", draft);

      // Step 1: Process loops first (they need to duplicate content)
      await processLoops(
        draft,
        parser,
        loopProcessor,
        replacer,
        config.delimiter,
        model,
      );

      // Step 2: Process conditionals (remove content if condition is false)
      await processConditionals(
        draft,
        parser,
        conditionalProcessor,
        config.delimiter,
      );

      // Step 3: Replace all simple placeholders
      await replaceSimplePlaceholders(draft, replacer, config.delimiter);

      return { commit: true };
    });
  } catch (error) {
    console.error("Error applying template data:", error);
    throw error;
  }
}

/**
 * Get all paragraphs and tables from the document
 */
function getAllBlockElements(draft: any): {
  paragraphs: any[];
  tables: any[];
} {
  const paragraphs: any[] = [];
  const tables: any[] = [];

  const body = draft.body();
  const sections = body.sections();

  for (const section of sections) {
    const content = section.content();
    const blockLevels = content.blocklevels();

    for (const block of blockLevels) {
      if (block.type === "paragraph") {
        paragraphs.push(block);
      } else if (block.type === "table") {
        tables.push(block);
      }
    }
  }

  return { paragraphs, tables };
}

/**
 * Process loop placeholders
 */
async function processLoops(
  draft: any,
  parser: TemplateParser,
  loopProcessor: LoopProcessor,
  replacer: PlaceholderReplacer,
  delimiter: any,
  model: Record<string, any>,
): Promise<void> {
  // First, process table loops (more structured)
  await processTableLoops(draft, parser, loopProcessor, delimiter, model);

  // Then process text-based loops
  await processTextLoops(draft, parser, loopProcessor, replacer, delimiter);
}

/**
 * Process loops in tables (row duplication)
 */
async function processTableLoops(
  draft: any,
  _parser: TemplateParser,
  loopProcessor: LoopProcessor,
  delimiter: any,
  _model: Record<string, any>,
): Promise<void> {
  const { tables } = getAllBlockElements(draft);

  console.log("[processTableLoops] Found tables:", tables.length);

  for (const table of tables) {
    console.log("[processTableLoops] Processing table");
    const rows = table.rows();
    console.log("[processTableLoops] Table has rows:", rows.length);

    let i = 0;

    while (i < rows.length) {
      const row = rows[i];
      const cells = row.cells();

      // Check if any cell contains a loop opening tag
      let loopKey: string | null = null;
      let loopStartRowIndex = -1;

      for (const cell of cells) {
        const cellText = getCellText(cell);
        console.log(`[processTableLoops] Row ${i} cell text:`, cellText);

        const escapedStart = escapeRegex(delimiter.start);
        const escapedEnd = escapeRegex(delimiter.end);
        const openPattern = new RegExp(
          `${escapedStart}#([a-zA-Z0-9_]+)${escapedEnd}`,
        );
        const match = cellText.match(openPattern);

        if (match) {
          console.log(
            "[processTableLoops] Found loop opening:",
            match[1],
            "at row",
            i,
          );
          loopKey = match[1];
          loopStartRowIndex = i;
          break;
        }
      }

      if (loopKey !== null && loopStartRowIndex !== -1) {
        console.log(
          "[processTableLoops] Looking for closing tag for:",
          loopKey,
        );

        // Find the closing tag
        let loopEndRowIndex = -1;
        for (let j = loopStartRowIndex; j < rows.length; j++) {
          const checkRow = rows[j];
          const checkCells = checkRow.cells();
          const escapedStart = escapeRegex(delimiter.start);
          const escapedEnd = escapeRegex(delimiter.end);
          const closePattern = new RegExp(
            `${escapedStart}/${loopKey}${escapedEnd}`,
          );

          for (const cell of checkCells) {
            const cellText = getCellText(cell);
            if (closePattern.test(cellText)) {
              loopEndRowIndex = j;
              break;
            }
          }
          if (loopEndRowIndex !== -1) break;
        }

        if (loopEndRowIndex !== -1) {
          console.log(
            "[processTableLoops] Found closing tag at row:",
            loopEndRowIndex,
          );

          // Get array data
          const arrayData = loopProcessor.getArrayData(loopKey);
          console.log(
            "[processTableLoops] Array data for",
            loopKey,
            ":",
            arrayData,
          );

          if (arrayData && arrayData.length > 0) {
            console.log(
              "[processTableLoops] Processing",
              arrayData.length,
              "items",
            );

            // Check if opening and closing are in the same row
            const sameRow = loopStartRowIndex === loopEndRowIndex;
            console.log("[processTableLoops] Same row?", sameRow);

            let contentStartRow: number;
            let contentEndRow: number;

            if (sameRow) {
              // Opening and closing in same row - duplicate this row
              contentStartRow = loopStartRowIndex;
              contentEndRow = loopStartRowIndex + 1;
            } else {
              // Opening and closing in different rows - duplicate rows between them
              contentStartRow = loopStartRowIndex + 1;
              contentEndRow = loopEndRowIndex;
            }

            console.log(
              "[processTableLoops] Content rows:",
              contentStartRow,
              "to",
              contentEndRow,
            );

            // Duplicate content rows for each array item
            const insertPosition = loopEndRowIndex + 1;
            console.log(
              "[processTableLoops] Duplicating rows for",
              arrayData.length,
              "items",
            );
            console.log("[processTableLoops] Insert position:", insertPosition);

            for (let itemIndex = 0; itemIndex < arrayData.length; itemIndex++) {
              const itemData = arrayData[itemIndex];
              console.log(
                "[processTableLoops] Processing item",
                itemIndex,
                ":",
                itemData,
              );

              // Clone each content row
              for (
                let rowIdx = contentStartRow;
                rowIdx < contentEndRow;
                rowIdx++
              ) {
                const templateRow = rows[rowIdx];
                const rowPosition =
                  insertPosition +
                  itemIndex * (contentEndRow - contentStartRow) +
                  (rowIdx - contentStartRow);
                console.log(
                  "[processTableLoops] Creating row at position:",
                  rowPosition,
                );
                console.log(
                  "[processTableLoops] Template row keys:",
                  Object.keys(templateRow),
                );
                console.log("[processTableLoops] Template row:", templateRow);

                // Create a new row
                const newRow = table.addRow(rowPosition);
                console.log("[processTableLoops] New row created:", newRow);
                console.log(
                  "[processTableLoops] New row keys:",
                  Object.keys(newRow),
                );

                // Copy cell structure and content from template row
                const templateCells = templateRow.cells();
                const newCells = newRow.cells();
                console.log(
                  "[processTableLoops] Template cells:",
                  templateCells.length,
                  "New cells:",
                  newCells.length,
                );

                for (
                  let cellIdx = 0;
                  cellIdx < templateCells.length;
                  cellIdx++
                ) {
                  const templateCell = templateCells[cellIdx];
                  const newCell = newCells[cellIdx];

                  if (newCell && templateCell) {
                    console.log("[processTableLoops] Copying cell", cellIdx);
                    // Copy all paragraphs from template cell to new cell
                    copyCellContent(
                      templateCell,
                      newCell,
                      loopKey,
                      delimiter,
                      itemData,
                    );
                  }
                }
              }
            }

            // Remove template rows
            if (sameRow) {
              // Only remove the single template row
              console.log(
                "[processTableLoops] Removing template row:",
                loopStartRowIndex,
              );
              table.removeRow(loopStartRowIndex);
            } else {
              // Remove all rows from opening to closing
              for (
                let rowIdx = loopEndRowIndex;
                rowIdx >= loopStartRowIndex;
                rowIdx--
              ) {
                console.log("[processTableLoops] Removing row:", rowIdx);
                table.removeRow(rowIdx);
              }
            }

            // Refresh rows array and restart from the insertion point
            i = insertPosition;
            continue;
          }
        }
      }

      i++;
    }
  }
}

/**
 * Process loops in regular text (paragraph duplication)
 */
async function processTextLoops(
  draft: any,
  _parser: TemplateParser,
  loopProcessor: LoopProcessor,
  _replacer: PlaceholderReplacer,
  delimiter: any,
): Promise<void> {
  const escapedStart = escapeRegex(delimiter.start);
  const escapedEnd = escapeRegex(delimiter.end);

  // Pattern to match loops - we need to identify if the key is an array
  // For now, use a callback that checks if it's actually an array
  const body = draft.body();
  const sections = body.sections();

  for (const section of sections) {
    const content = section.content();
    const blockLevels = content.blocklevels();

    for (let i = 0; i < blockLevels.length; i++) {
      const block = blockLevels[i];

      if (block.type === "paragraph") {
        const textView = block.asTextView();
        const text = textView.getPlainText();

        // Check for loop pattern
        const loopPattern = new RegExp(
          `${escapedStart}#([a-zA-Z0-9_]+)${escapedEnd}([\\s\\S]*?)${escapedStart}/\\1${escapedEnd}`,
          "g",
        );

        const matches = [...text.matchAll(loopPattern)];

        if (matches.length > 0) {
          for (const match of matches) {
            const key = match[1];
            const templateContent = match[2];

            // Check if this is actually an array (not a conditional)
            if (loopProcessor.isArrayKey(key)) {
              const arrayData = loopProcessor.getArrayData(key);

              if (arrayData && arrayData.length > 0) {
                // Generate repeated content
                const repeatedContent = arrayData
                  .map((item) =>
                    replacePlaceholdersInText(templateContent, item, delimiter),
                  )
                  .join("\n");

                // Replace the entire loop with repeated content
                textView.replaceText(match[0], repeatedContent);
              }
            }
          }
        }
      }
    }
  }
}

/**
 * Helper: Copy cell content from template to new cell with formatting preserved
 */
function copyCellContent(
  templateCell: any,
  newCell: any,
  loopKey: string,
  delimiter: any,
  itemData: Record<string, any>,
): void {
  console.log("[copyCellContent] Starting copy, itemData:", itemData);
  const escapedStart = escapeRegex(delimiter.start);
  const escapedEnd = escapeRegex(delimiter.end);
  const openTagPattern = new RegExp(
    `${escapedStart}#${loopKey}${escapedEnd}`,
    "g",
  );
  const closeTagPattern = new RegExp(
    `${escapedStart}/${loopKey}${escapedEnd}`,
    "g",
  );

  // Get all paragraphs from template cell
  const templateBlocks = templateCell.blocklevels();
  console.log("[copyCellContent] Template blocks:", templateBlocks.length);

  // Clear the new cell (it may have a default paragraph)
  const newBlocks = newCell.blocklevels();
  console.log(
    "[copyCellContent] Clearing",
    newBlocks.length,
    "existing blocks",
  );
  for (let i = newBlocks.length - 1; i >= 0; i--) {
    newCell.removeElement(i);
  }

  // Copy each paragraph with formatting
  for (const templateBlock of templateBlocks) {
    console.log("[copyCellContent] Processing block type:", templateBlock.type);
    if (templateBlock.type === "paragraph") {
      const newParagraph = newCell.addParagraph();
      const templateTextView = templateBlock.asTextView();
      const newTextView = newParagraph.asTextView();

      // Get all inline elements with their formatting
      const inlines = templateTextView.inlines();
      console.log("[copyCellContent] Found", inlines.length, "inlines");

      for (const rangeInline of inlines) {
        const inline = rangeInline.inline;
        console.log("[copyCellContent] Inline type:", inline.type);

        if (inline.type === "text") {
          let text = inline.plainText();
          const formatting = inline.formatting();
          console.log("[copyCellContent] Original text:", text);
          console.log("[copyCellContent] Formatting:", formatting);

          // Remove loop tags
          text = text.replace(openTagPattern, "").replace(closeTagPattern, "");
          console.log("[copyCellContent] After removing loop tags:", text);

          // Replace placeholders with item data
          text = replacePlaceholdersInText(text, itemData, delimiter);
          console.log("[copyCellContent] After replacing placeholders:", text);

          // Add the text and apply formatting
          if (text) {
            const range = newTextView.addInlineText(text);
            console.log("[copyCellContent] Added text, range:", range);
            if (formatting) {
              newTextView.setFormatting(formatting, range);
              console.log("[copyCellContent] Applied formatting");
            }
          }
        } else if (inline.type === "lineBreak") {
          newTextView.addLineBreak();
          console.log("[copyCellContent] Added line break");
        }
        // Could handle other inline types (images, etc.) if needed
      }
    }
  }
  console.log("[copyCellContent] Finished copying cell");
}

/**
 * Helper: Get text from a table cell
 */
function getCellText(cell: any): string {
  console.log("[getCellText] Cell object keys:", Object.keys(cell));
  console.log("[getCellText] Cell:", cell);

  // Try different ways to get content
  if (typeof cell.content === "function") {
    const content = cell.content();
    console.log("[getCellText] cell.content():", content);
    if (content && content.length > 0) {
      const texts = content.map((p: any) => {
        console.log("[getCellText] Paragraph:", p);
        if (p.asTextView) {
          return p.asTextView().getPlainText();
        }
        return "";
      });
      return texts.join("\n");
    }
  }

  // Try alternative: maybe cells have blocklevels?
  if (typeof cell.blocklevels === "function") {
    const blocks = cell.blocklevels();
    console.log("[getCellText] cell.blocklevels():", blocks);
    return blocks
      .map((p: any) => (p.asTextView ? p.asTextView().getPlainText() : ""))
      .join("\n");
  }

  console.log("[getCellText] Could not get text from cell");
  return "";
}

/**
 * Helper: Replace placeholders in text with data
 */
function replacePlaceholdersInText(
  text: string,
  data: Record<string, any>,
  delimiter: any,
): string {
  const escapedStart = escapeRegex(delimiter.start);
  const escapedEnd = escapeRegex(delimiter.end);
  const pattern = new RegExp(
    `${escapedStart}([a-zA-Z0-9_]+)${escapedEnd}`,
    "g",
  );

  return text.replace(pattern, (_match, key) => {
    const value = data[key];
    return value !== undefined && value !== null ? String(value) : "";
  });
}

/**
 * Process conditional placeholders
 */
async function processConditionals(
  draft: any,
  _parser: TemplateParser,
  conditionalProcessor: ConditionalProcessor,
  delimiter: any,
): Promise<void> {
  const escapedStart = escapeRegex(delimiter.start);
  const escapedEnd = escapeRegex(delimiter.end);

  // Process regular conditionals {{#condition}}...{{/condition}}
  const conditionalPattern = new RegExp(
    `${escapedStart}#([a-zA-Z0-9_]+)${escapedEnd}([\\s\\S]*?)${escapedStart}/\\1${escapedEnd}`,
    "g",
  );

  // Process negated conditionals {{^condition}}...{{/condition}}
  const negatedPattern = new RegExp(
    `${escapedStart}\\^([a-zA-Z0-9_]+)${escapedEnd}([\\s\\S]*?)${escapedStart}/\\1${escapedEnd}`,
    "g",
  );

  // Replace regular conditionals
  draft.replaceText(
    conditionalPattern,
    (_match: string, key: string, content: string) => {
      const shouldShow = conditionalProcessor.shouldShowContent(
        key,
        PlaceholderType.CONDITIONAL,
      );
      return shouldShow ? content : "";
    },
  );

  // Replace negated conditionals
  draft.replaceText(
    negatedPattern,
    (_match: string, key: string, content: string) => {
      const shouldShow = conditionalProcessor.shouldShowContent(
        key,
        PlaceholderType.NEGATED,
      );
      return shouldShow ? content : "";
    },
  );
}

/**
 * Replace simple placeholders with values
 */
async function replaceSimplePlaceholders(
  draft: any,
  replacer: PlaceholderReplacer,
  delimiter: any,
): Promise<void> {
  console.log("[replaceSimplePlaceholders] Starting...");
  // Build regex pattern for simple placeholders: {{variable}}
  const escapedStart = escapeRegex(delimiter.start);
  const escapedEnd = escapeRegex(delimiter.end);

  // Match simple placeholders only (no # or ^ prefix)
  const placeholderPattern = new RegExp(
    `${escapedStart}\\s*([a-zA-Z0-9_]+)\\s*${escapedEnd}`,
    "g",
  );

  console.log("[replaceSimplePlaceholders] Pattern:", placeholderPattern);
  console.log("[replaceSimplePlaceholders] Calling draft.replaceText...");

  // Use document-wide replace with a callback function
  const result = draft.replaceText(placeholderPattern, (match: string) => {
    console.log("[replaceSimplePlaceholders] Found match:", match);
    // Extract the variable name from the match
    const keyMatch = match.match(
      new RegExp(`${escapedStart}\\s*([a-zA-Z0-9_]+)\\s*${escapedEnd}`),
    );
    if (!keyMatch) {
      console.log(
        "[replaceSimplePlaceholders] No key match, returning original",
      );
      return match;
    }

    const key = keyMatch[1];
    const value = replacer.getValue(key);
    console.log("[replaceSimplePlaceholders] Replacing", key, "with", value);

    return String(value);
  });

  console.log("[replaceSimplePlaceholders] Result:", result);

  // Also process table cells manually
  console.log("[replaceSimplePlaceholders] Processing table cells...");
  const { tables } = getAllBlockElements(draft);
  console.log("[replaceSimplePlaceholders] Found", tables.length, "tables");

  for (const table of tables) {
    const rows = table.rows();
    for (const row of rows) {
      const cells = row.cells();
      for (const cell of cells) {
        // Use cell's replaceText if available
        if (typeof cell.replaceText === "function") {
          console.log("[replaceSimplePlaceholders] Using cell.replaceText");
          cell.replaceText(placeholderPattern, (match: string) => {
            const keyMatch = match.match(
              new RegExp(`${escapedStart}\\s*([a-zA-Z0-9_]+)\\s*${escapedEnd}`),
            );
            if (!keyMatch) return match;
            const key = keyMatch[1];
            const value = replacer.getValue(key);
            console.log(
              "[replaceSimplePlaceholders] Replacing in cell",
              key,
              "with",
              value,
            );
            return String(value);
          });
        }
      }
    }
  }
}

/**
 * Escape special regex characters
 */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
