import { SupabaseClient } from '@supabase/supabase-js';
import type { NotificationRepository } from '@/domain/modules/notifications/repositories/NotificationRepository';
import type { Notification, NotificationMetadata } from '@/domain/modules/notifications/models/Notification';

export class SupabaseNotificationRepository implements NotificationRepository {
  private readonly supabase: SupabaseClient;

  constructor(supabase: SupabaseClient) {
    this.supabase = supabase;
  }

  async getNotifications(userId: string): Promise<Notification[]> {
    const { data, error } = await this.supabase
      .from('notifications')
      .select('id, recipient_id, actor_id, type, entity_id, metadata, is_read, created_at')
      .eq('recipient_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Error fetching notifications: ${error.message}`);
    }

    if (!data || data.length === 0) return [];

    return data.map((row) => toDomain(row));
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

interface NotificationRow {
  id: string;
  recipient_id: string;
  actor_id: string | null;
  type: string;
  entity_id: string | null;
  metadata: NotificationMetadata | null;
  is_read: boolean;
  created_at: string;
}

function toDomain(row: NotificationRow): Notification {
  const metadata: NotificationMetadata = row.metadata ?? {};
  const actorNameFromMetadata =
    typeof metadata.actorName === 'string' && metadata.actorName.trim().length > 0
      ? metadata.actorName
      : null;

  return {
    id: row.id,
    recipientId: row.recipient_id,
    actorId: row.actor_id,
    actorName: actorNameFromMetadata,
    type: row.type,
    entityId: row.entity_id,
    metadata,
    isRead: row.is_read,
    createdAt: new Date(row.created_at),
  };
}
