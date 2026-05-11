export type KnownNotificationType =
  | 'NEW_USER'
  | 'NEW_PATIENT'
  | 'NEW_MEDICAL_RECORD'
  | 'NEW_EVOLUTION'
  | 'TASK_ASSIGNED'
  | 'SYSTEM_ALERT';

export type NotificationType = KnownNotificationType | (string & {});

export interface Notification {
  id: string;
  recipientId: string;
  actorId: string | null;
  actorName: string | null;
  type: NotificationType;
  entityId: string | null;
  isRead: boolean;
  createdAt: Date;
}
