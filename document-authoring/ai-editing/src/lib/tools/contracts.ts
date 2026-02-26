import { z } from "zod";

export const ElementKindSchema = z.enum([
  "document",
  "section",
  "paragraph",
  "table",
  "table-row",
  "table-cell",
  "inline-text",
  "inline-image",
]);

export type ElementKind = z.infer<typeof ElementKindSchema>;

export const ElementIdSchema = z.string().min(1);
export type ElementId = z.infer<typeof ElementIdSchema>;

const createPrefixedElementIdSchema = (
  prefixes: readonly string[],
  label: string,
) =>
  ElementIdSchema.refine(
    (value) => prefixes.some((prefix) => value.startsWith(`${prefix}-`)),
    `${label} id must use one of: ${prefixes.map((prefix) => `${prefix}-`).join(", ")}`,
  );

const ParagraphElementIdSchema = createPrefixedElementIdSchema(
  ["p"],
  "Paragraph",
);
const TableElementIdSchema = createPrefixedElementIdSchema(["t"], "Table");
const InlineImageElementIdSchema = createPrefixedElementIdSchema(
  ["img"],
  "Inline-image",
);
const TextStyleTargetElementIdSchema = createPrefixedElementIdSchema(
  ["p", "it", "tr", "tc"],
  "Text-style target",
);

export const ElementPathSchema = z.array(z.number().int().min(0)).min(1);
export type ElementPath = z.infer<typeof ElementPathSchema>;

export const FormattingStyleSchema = z
  .object({
    bold: z.boolean().nullable().optional(),
    italic: z.boolean().nullable().optional(),
    underline: z.boolean().nullable().optional(),
    strikeout: z.boolean().nullable().optional(),
    color: z.string().nullable().optional(),
    highlight: z.string().nullable().optional(),
    font: z.string().nullable().optional(),
    fontSize: z.number().nullable().optional(),
  })
  .strict();

export type FormattingStyle = z.infer<typeof FormattingStyleSchema>;

export const ParagraphInputSchema = z
  .object({
    text: z.string(),
    textStyle: FormattingStyleSchema.optional(),
  })
  .strict();

export type ParagraphInput = z.infer<typeof ParagraphInputSchema>;

export const TableInputSchema = z
  .object({
    headers: z.array(z.string()).min(1),
    rows: z.array(z.array(z.string())).default([]),
  })
  .strict();

export type TableInput = z.infer<typeof TableInputSchema>;

const BlockAnchorIdSchema = ElementIdSchema.refine(
  (value) =>
    value.startsWith("d-") ||
    value.startsWith("s-") ||
    value.startsWith("p-") ||
    value.startsWith("t-"),
  "Anchor id must point to document, section, paragraph, or table (d-, s-, p-, t-).",
);

export const BlockAnchorSchema = z
  .object({
    id: BlockAnchorIdSchema,
    edge: z.enum(["begin", "end"]),
  })
  .strict();

export type BlockAnchor = z.infer<typeof BlockAnchorSchema>;

export const ListElementsArgsSchema = z
  .object({
    parentId: ElementIdSchema.default("d-0"),
    offset: z.number().int().min(0).default(0),
    limit: z.number().int().min(1).max(200).default(50),
  })
  .strict();

export const SearchElementsArgsSchema = z
  .object({
    query: z.string().min(1),
    mode: z.enum(["exact_phrase", "keyword", "hybrid"]).default("hybrid"),
    regex: z
      .object({
        pattern: z.string().min(1),
        ignoreCase: z.boolean().default(true),
        multiline: z.boolean().default(false),
      })
      .nullable()
      .default(null),
    kinds: z.array(ElementKindSchema).min(1),
    maxResults: z.number().int().min(1).max(100).default(20),
    minScore: z.number().min(0).default(0.15),
  })
  .strict();

export const ScrollElementsArgsSchema = z
  .object({
    id: ElementIdSchema,
    includeDescendants: z.boolean().default(false),
    maxChars: z.number().int().min(120).max(20_000).default(2_000),
    maxDescendants: z.number().int().min(1).max(300).default(80),
  })
  .strict();

export const ParagraphInsertionSchema = z
  .object({
    anchor: BlockAnchorSchema,
    paragraphs: z.array(ParagraphInputSchema).min(1),
  })
  .strict();

export type ParagraphInsertion = z.infer<typeof ParagraphInsertionSchema>;

export const AddParagraphsArgsSchema = z
  .object({
    insertions: z.array(ParagraphInsertionSchema).min(1),
  })
  .strict();

export type AddParagraphsArgs = z.infer<typeof AddParagraphsArgsSchema>;

const ReplaceParagraphEditSchema = z
  .object({
    start: z.number().int().min(0),
    end: z.number().int().min(0),
    text: z.string(),
    textStyle: FormattingStyleSchema.optional(),
  })
  .strict()
  .refine((value) => value.end >= value.start, {
    message: "edit.end must be greater than or equal to edit.start.",
    path: ["end"],
  });

export const ReplaceParagraphArgsSchema = z
  .object({
    id: ParagraphElementIdSchema,
    paragraph: ParagraphInputSchema.optional(),
    edit: ReplaceParagraphEditSchema.optional(),
  })
  .strict()
  .refine(
    (value) => (value.paragraph ? 1 : 0) + (value.edit ? 1 : 0) === 1,
    "replace_paragraph requires exactly one of paragraph or edit.",
  );

export const AddTableArgsSchema = z
  .object({
    anchor: BlockAnchorSchema,
    table: TableInputSchema,
  })
  .strict();

export const ReplaceTableArgsSchema = z
  .object({
    id: TableElementIdSchema,
    table: TableInputSchema,
  })
  .strict();

export const EditImageArgsSchema = z
  .object({
    id: InlineImageElementIdSchema,
    width: z.number().positive().optional(),
    height: z.number().positive().optional(),
  })
  .strict();

export const DeleteElementArgsSchema = z
  .object({
    id: ElementIdSchema,
  })
  .strict();

export const SetTableHeaderTextStyleArgsSchema = z
  .object({
    id: TableElementIdSchema,
    style: FormattingStyleSchema,
  })
  .strict();

export const SetParagraphTextStyleArgsSchema = z
  .object({
    ids: z.array(TextStyleTargetElementIdSchema).min(1),
    style: FormattingStyleSchema,
  })
  .strict();

export const TextStyleAdjustSchema = z
  .object({
    fontSizeDelta: z
      .number()
      .finite()
      .refine((value) => value !== 0, {
        message: "fontSizeDelta must be non-zero.",
      }),
  })
  .strict();

export type TextStyleAdjust = z.infer<typeof TextStyleAdjustSchema>;

export const AdjustParagraphTextStyleArgsSchema = z
  .object({
    ids: z.array(TextStyleTargetElementIdSchema).min(1),
    adjust: TextStyleAdjustSchema,
  })
  .strict();

export const ReadToolNameSchema = z.enum([
  "list_elements",
  "search_elements",
  "scroll_elements",
]);
export const WriteToolNameSchema = z.enum([
  "add_paragraphs",
  "replace_paragraph",
  "add_table",
  "replace_table",
  "edit_image",
  "delete_element",
  "set_table_header_text_style",
  "set_paragraph_text_style",
  "adjust_paragraph_text_style",
]);

export const ToolNameSchema = z.union([
  ReadToolNameSchema,
  WriteToolNameSchema,
]);

export type ReadToolName = z.infer<typeof ReadToolNameSchema>;
export type WriteToolName = z.infer<typeof WriteToolNameSchema>;
export type ToolName = z.infer<typeof ToolNameSchema>;

export const isReadToolName = (name: ToolName): name is ReadToolName =>
  ReadToolNameSchema.safeParse(name).success;

export const isWriteToolName = (name: ToolName): name is WriteToolName =>
  WriteToolNameSchema.safeParse(name).success;

export const ToolExecutionArgsSchemas = {
  list_elements: ListElementsArgsSchema,
  search_elements: SearchElementsArgsSchema,
  scroll_elements: ScrollElementsArgsSchema,
  add_paragraphs: AddParagraphsArgsSchema,
  replace_paragraph: ReplaceParagraphArgsSchema,
  add_table: AddTableArgsSchema,
  replace_table: ReplaceTableArgsSchema,
  edit_image: EditImageArgsSchema,
  delete_element: DeleteElementArgsSchema,
  set_table_header_text_style: SetTableHeaderTextStyleArgsSchema,
  set_paragraph_text_style: SetParagraphTextStyleArgsSchema,
  adjust_paragraph_text_style: AdjustParagraphTextStyleArgsSchema,
} as const;

export type SupportedToolName = keyof typeof ToolExecutionArgsSchemas;

export const ToolCallSchema = z
  .object({
    id: z.string().min(1),
    name: ToolNameSchema,
    args: z.unknown(),
  })
  .strict();

export type ToolCall = z.infer<typeof ToolCallSchema>;

export const ElementDescriptorSchema = z
  .object({
    id: ElementIdSchema,
    parentId: ElementIdSchema.optional(),
    kind: ElementKindSchema,
    path: ElementPathSchema,
    preview: z.string(),
    text: z.string().optional(),
  })
  .strict();

export type ElementDescriptor = z.infer<typeof ElementDescriptorSchema>;

export const ListElementsResultSchema = z
  .object({
    docRevision: z.string().min(1),
    parentId: ElementIdSchema,
    offset: z.number().int().min(0),
    limit: z.number().int().min(1),
    total: z.number().int().min(0),
    elements: z.array(ElementDescriptorSchema),
  })
  .strict();

export const SearchElementsResultSchema = z
  .object({
    docRevision: z.string().min(1),
    query: z.string().min(1),
    mode: z.enum(["exact_phrase", "keyword", "hybrid"]),
    matches: z.array(
      z
        .object({
          element: ElementDescriptorSchema,
          score: z.number().finite(),
          scoreBreakdown: z
            .object({
              bm25: z.number().finite(),
              phrase: z.number().finite(),
              proximity: z.number().finite(),
              kindPrior: z.number().finite(),
              positionPrior: z.number().finite(),
              final: z.number().finite(),
            })
            .strict(),
          snippets: z.array(z.string()).default([]),
        })
        .strict(),
    ),
  })
  .strict();

const ScrollElementsResolvedSchema = z
  .object({
    status: z.literal("resolved"),
    docRevision: z.string().min(1),
    element: ElementDescriptorSchema,
    content: z.string(),
    descendants: z.array(ElementDescriptorSchema).optional(),
  })
  .strict();

const ScrollElementsNotFoundSchema = z
  .object({
    status: z.literal("not-found"),
    docRevision: z.string().min(1),
  })
  .strict();

export const ScrollElementsResultSchema = z.discriminatedUnion("status", [
  ScrollElementsResolvedSchema,
  ScrollElementsNotFoundSchema,
]);
