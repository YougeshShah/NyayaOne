export type DocumentCategory =
  | "CASE_FILING"
  | "EVIDENCE"
  | "COURT_ORDER"
  | "AGREEMENT"
  | "CORRESPONDENCE"
  | "IDENTIFICATION"
  | "OTHER";

export interface CaseDocument {
  id: string;
  caseId: string | null;
  fileName: string;
  fileType: string;
  fileSizeKb: number | null;
  category: DocumentCategory;
  uploadedBy: { id: string; fullName: string };
  createdAt: string;
}
