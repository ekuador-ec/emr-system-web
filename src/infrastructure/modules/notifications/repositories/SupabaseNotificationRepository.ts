import { SupabaseClient } from '@supabase/supabase-js';
import type { NotificationRepository } from '@/domain/modules/notifications/repositories/NotificationRepository';
import type { Notification } from '@/domain/modules/notifications/models/Notification';

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

    if (!data || data.length === 0) return [];

    const actorIds = [...new Set(
      data.map((row) => row.actor_id).filter(Boolean)
    )] as string[];

    const actorMap = new Map<string, string>();

    if (actorIds.length > 0) {
      const { data: actors } = await this.supabase
        .from('profiles')
        .select('id, first_name, last_name')
        .in('id', actorIds);

      if (actors) {
        for (const actor of actors) {
          const name = [actor.first_name, actor.last_name].filter(Boolean).join(' ');
          if (name) actorMap.set(actor.id, name);
        }
      }
    }

    return data.map((row) => ({
      id: row.id,
      recipientId: row.recipient_id,
      actorId: row.actor_id,
      actorName: row.actor_id ? (actorMap.get(row.actor_id) ?? null) : null,
      type: row.type,
      entityId: row.entity_id,
      isRead: row.is_read,
      createdAt: new Date(row.created_at),
    }));
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
}
