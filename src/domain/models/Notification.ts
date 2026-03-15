export type NotificationType = 'NEW_PATIENT' | 'NEW_EVOLUTION' | 'TASK_ASSIGNED' | 'SYSTEM_ALERT' | string;

export interface Notification {
  id: string;
  recipientId: string;
  actorId: string | null;
  type: NotificationType;
  entityId: string | null;
  isRead: boolean;
  createdAt: Date;
}
