import type { Notification } from '@/domain/models/Notification';

export interface NotificationRepository {
  getNotifications(userId: string): Promise<Notification[]>;
  markAsRead(notificationId: string): Promise<void>;
  markAllAsRead(userId: string): Promise<void>;
}
