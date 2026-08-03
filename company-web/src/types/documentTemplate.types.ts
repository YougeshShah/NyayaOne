export interface DocumentTemplate {
  id: string;
  title: string;
  category: string | null;
  description: string | null;
  bodyTemplate: string;
  isActive: boolean;
  createdAt: string;
}
