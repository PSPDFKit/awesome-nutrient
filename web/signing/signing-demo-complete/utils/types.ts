export enum AnnotationTypeEnum {
  NAME = "name",
  SIGNATURE = "signature",
  DATE = "date",
  INITIAL = "initial",
}

export interface User {
  id: number;
  name: string;
  email: string;
  color?: InstanceType<typeof window.NutrientViewer.Color>;
  role: string;
}

export interface AIMessage {
  role: string;
  content: string;
}

export interface AIResponse {
  choices: Array<{
    message: {
      role: string;
      content: string;
    };
  }>;
}
