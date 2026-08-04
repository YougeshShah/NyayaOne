export type FieldType = "text" | "textarea" | "date" | "number";

export interface TemplateField {
  key: string;
  label: string;
  type: FieldType;
  autoFillSource?: string;
  required?: boolean;
  placeholder?: string;
}

export interface DocumentTemplate {
  id: string;
  title: string;
  category: string | null;
  description: string | null;
  bodyTemplate: string;
  fields: TemplateField[];
  isActive: boolean;
  createdAt: string;
}

export interface AnalyzeSampleSuggestion {
  matchIndex: number;
  suggestedLabel: string;
  contextBefore: string;
  contextAfter: string;
}
