export interface ApiSuccessResponse<T> {
  success: true;
  message?: string;
  data: T;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResult<T> {
  items: T[];
  pagination: PaginationMeta;
}

export type AccountType = "COMPANY" | "LAW_FIRM_ADMIN" | "LAWYER" | "STAFF" | "CLIENT";

export interface AuthUser {
  id: string;
  fullName: string;
  email: string;
  accountType: AccountType;
  lawFirmId: string | null;
  lawFirmStatus: string | null;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
}

export type CaseStatus = "OPEN" | "ONGOING" | "ON_HOLD" | "CLOSED" | "DISMISSED";
export type CasePriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

export interface CaseListItem {
  id: string;
  caseNumber: string;
  caseTitle: string;
  status: CaseStatus;
  priority: CasePriority;
  court: { id: string; name: string; type: string; province: string | null };
  lawyers: { lawyer: { id: string; fullName: string; email: string; phone: string | null }; isLead: boolean }[];
  _count: { hearings: number; documents: number };
  createdAt: string;
}

export interface CaseDetail extends CaseListItem {
  opposingParty: string | null;
  opposingLawyer: string | null;
  courtSubject: string | null;
  category: string | null;
  judge: string | null;
  remarks: string | null;
  hearings: { id: string; hearingDate: string; status: string; judge: string | null; remarks: string | null }[];
}

export type HearingStatus = "SCHEDULED" | "COMPLETED" | "ADJOURNED" | "CANCELLED";

export interface Hearing {
  id: string;
  caseId: string;
  hearingDate: string;
  courtName: string | null;
  judge: string | null;
  remarks: string | null;
  status: HearingStatus;
  case: { id: string; caseNumber: string; caseTitle: string };
  createdAt: string;
}

export interface Client {
  id: string;
  fullName: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  createdAt: string;
  _count?: { cases: number };
}

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
  case: { id: string; caseNumber: string; caseTitle: string } | null;
  createdAt: string;
}
