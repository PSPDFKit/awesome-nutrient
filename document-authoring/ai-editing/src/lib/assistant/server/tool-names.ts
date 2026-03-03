import {
  type ReadToolName,
  ReadToolNameSchema,
  type WriteToolName,
  WriteToolNameSchema,
} from "@/lib/tools/contracts";

export const READ_TOOL_NAMES = ReadToolNameSchema.options;
export const WRITE_TOOL_NAMES = WriteToolNameSchema.options;

export type ServerReadToolName = ReadToolName;
export type ServerWriteToolName = WriteToolName;
