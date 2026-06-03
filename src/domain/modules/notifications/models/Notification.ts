export type KnownNotificationType =
  | 'NEW_USER'
  | 'NEW_PATIENT'
  | 'NEW_MEDICAL_RECORD'
  | 'NEW_EVOLUTION'
  | 'NEW_FORM005'
  | 'NEW_MESSAGE'
  | 'TASK_ASSIGNED'
  | 'SYSTEM_ALERT';

export type NotificationType = KnownNotificationType | (string & {});

export interface NotificationMetadata {
  actorName?: string | null;
  subjectName?: string | null;
  subjectEmail?: string | null;
  subjectRole?: string | null;
  patientId?: string | null;
  patientName?: string | null;
  patientIdNumber?: string | null;
  evolutionStatus?: string | null;
  documentStatus?: string | null;
  conversationId?: string | null;
  preview?: string | null;
  [key: string]: unknown;
}

export interface Notification {
  id: string;
  recipientId: string;
  actorId: string | null;
  actorName: string | null;
  type: NotificationType;
  entityId: string | null;
  metadata: NotificationMetadata;
  isRead: boolean;
  createdAt: Date;
}
