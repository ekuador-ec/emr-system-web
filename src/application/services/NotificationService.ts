import type { NotificationRepository } from '@/domain/repositories/NotificationRepository';
import type { Notification } from '@/domain/models/Notification';

export class NotificationService {
  private readonly notificationRepository: NotificationRepository;

  constructor(notificationRepository: NotificationRepository) {
    this.notificationRepository = notificationRepository;
  }

  async getNotifications(userId: string): Promise<Notification[]> {
    return this.notificationRepository.getNotifications(userId);
  }

  async markAsRead(notificationId: string): Promise<void> {
    return this.notificationRepository.markAsRead(notificationId);
  }

  async markAllAsRead(userId: string): Promise<void> {
    return this.notificationRepository.markAllAsRead(userId);
  }
}
