export type LibraryResourceType =
  | "CONSTITUTION"
  | "ACT"
  | "REGULATION"
  | "RULE"
  | "CIRCULAR"
  | "GOVERNMENT_NOTICE"
  | "GAZETTE"
  | "SUPREME_COURT_DECISION"
  | "HIGH_COURT_DECISION"
  | "ARTICLE"
  | "RESEARCH_PAPER"
  | "JOURNAL"
  | "TEMPLATE"
  | "LEGAL_FORM";

export interface LibraryResource {
  id: string;
  title: string;
  type: LibraryResourceType;
  category: string | null;
  actName: string | null;
  section: string | null;
  chapter: string | null;
  keywords: string[];
  fileUrl: string | null;
  content: string | null;
  isDownloadable: boolean;
  createdAt: string;
}
