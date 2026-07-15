export type NotificationAudience = "ALL_LAWYERS" | "SPECIFIC_LAW_FIRM" | "ALL_STUDENTS" | "ALL_CLIENTS" | "INDIVIDUAL_USER";

export interface SentNotification {
  id: string;
  title: string;
  body: string;
  audience: NotificationAudience;
  targetId: string | null;
  createdAt: string;
  _count: { recipients: number };
}

export interface SendNotificationPayload {
  title: string;
  body: string;
  audience: NotificationAudience;
  targetId?: string;
}
