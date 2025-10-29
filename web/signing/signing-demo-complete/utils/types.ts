export enum AnnotationTypeEnum {
  NAME = "name",
  SIGNATURE = "signature",
  DATE = "date",
  INITIAL = "initial",
}

import type NutrientViewer from "@nutrient-sdk/viewer";

export interface User {
  id: number;
  name: string;
  email: string;
  color?: InstanceType<typeof NutrientViewer.Color>;
  role: string;
}

export interface AIMessage {
  role: string;
  content: string;
}
