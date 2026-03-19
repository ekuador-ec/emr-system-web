import type { Notification } from '@/domain/modules/notifications/models/Notification';

export interface NotificationRepository {
  getNotifications(userId: string): Promise<Notification[]>;
  markAsRead(notificationId: string): Promise<void>;
  markAllAsRead(userId: string): Promise<void>;
}
