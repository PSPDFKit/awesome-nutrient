import type { Programmatic } from "@nutrient-sdk/document-authoring";

export type DocumentRuntime = {
  hasActiveCursor(): boolean;
  transaction<T>(
    callback: (draft: Programmatic.Document) => Promise<T> | T,
  ): Promise<T>;
  saveSnapshot(): Promise<object>;
  restoreSnapshot(snapshot: object): Promise<void>;
};
