import { SupabaseClient } from '@supabase/supabase-js';
import type { NotificationRepository } from '@/domain/repositories/NotificationRepository';
import type { Notification } from '@/domain/models/Notification';

export class SupabaseNotificationRepository implements NotificationRepository {
  private readonly supabase: SupabaseClient;

  constructor(supabase: SupabaseClient) {
    this.supabase = supabase;
  }

  async getNotifications(userId: string): Promise<Notification[]> {
    const { data, error } = await this.supabase
      .from('notifications')
      .select('*')
      .eq('recipient_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Error fetching notifications: ${error.message}`);
    }

    return (data || []).map(this.mapToEntity);
  }

  async markAsRead(notificationId: string): Promise<void> {
    const { error } = await this.supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId);

    if (error) {
      throw new Error(`Error marking notification as read: ${error.message}`);
    }
  }

  async markAllAsRead(userId: string): Promise<void> {
    const { error } = await this.supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('recipient_id', userId)
      .eq('is_read', false);

    if (error) {
      throw new Error(`Error marking all notifications as read: ${error.message}`);
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private mapToEntity(row: any): Notification {
    return {
      id: row.id,
      recipientId: row.recipient_id,
      actorId: row.actor_id,
      type: row.type,
      entityId: row.entity_id,
      isRead: row.is_read,
      createdAt: new Date(row.created_at),
    };
  }
}
