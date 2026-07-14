export type CaseStatus = "OPEN" | "ONGOING" | "ON_HOLD" | "CLOSED" | "DISMISSED";
export type CasePriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

export interface CaseListItem {
  id: string;
  caseNumber: string;
  caseTitle: string;
  status: CaseStatus;
  priority: CasePriority;
  court: { id: string; name: string; type: string; province: string | null };
  clients: { client: { id: string; fullName: string; phone: string | null } }[];
  lawyers: { lawyer: { id: string; fullName: string; email: string }; isLead: boolean }[];
  _count: { hearings: number; documents: number };
  createdAt: string;
}

export interface CaseDetail extends CaseListItem {
  opposingParty: string | null;
  opposingLawyer: string | null;
  courtSubject: string | null;
  category: string | null;
  filingDate: string | null;
  judge: string | null;
  remarks: string | null;
  hearings: {
    id: string;
    hearingDate: string;
    status: string;
    judge: string | null;
    remarks: string | null;
  }[];
}

export interface CreateCasePayload {
  caseNumber: string;
  caseTitle: string;
  courtId: string;
  clientIds: string[];
  lawyerIds: string[];
  leadLawyerId?: string;
  opposingParty?: string;
  opposingLawyer?: string;
  courtSubject?: string;
  category?: string;
  filingDate?: string;
  judge?: string;
  priority: CasePriority;
  remarks?: string;
}
