export type HearingStatus = "SCHEDULED" | "COMPLETED" | "ADJOURNED" | "CANCELLED";

export interface HearingReminder {
  id: string;
  remindAt: string;
  label: string;
  sent: boolean;
}

export interface Hearing {
  id: string;
  caseId: string;
  hearingDate: string;
  courtName: string | null;
  judge: string | null;
  remarks: string | null;
  status: HearingStatus;
  case: { id: string; caseNumber: string; caseTitle: string };
  reminders?: HearingReminder[];
  createdAt: string;
}

export interface CreateHearingPayload {
  caseId: string;
  hearingDate: string;
  courtName?: string;
  judge?: string;
  remarks?: string;
}
