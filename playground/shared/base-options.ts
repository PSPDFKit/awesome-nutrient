export const baseOptions = {
  container: ".nutrient-viewer",
  document: "document.pdf",
} as const;

export type BaseOptions = typeof baseOptions;
