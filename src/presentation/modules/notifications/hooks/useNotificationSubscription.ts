import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/infrastructure/core/supabaseClient';
import { useToastStore } from '@/presentation/modules/shared/components/Toaster';
import { NOTIFICATIONS_QUERY_KEY } from './useNotifications';
import { describeNotification } from '@/presentation/modules/notifications/registry/notificationRegistry';
import type { Notification } from '@/domain/modules/notifications/models/Notification';

export function useNotificationSubscription(userId: string | undefined | null) {
  const queryClient = useQueryClient();
  const { addToast } = useToastStore();

  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel(`notifications:${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `recipient_id=eq.${userId}`,
        },
        (payload) => {
          const newNotificationTemp = payload.new;
          const metadata = (newNotificationTemp.metadata ?? {}) as Notification['metadata'];
          const metadataActorName =
            typeof metadata.actorName === 'string' && metadata.actorName.trim().length > 0
              ? metadata.actorName
              : null;

          const newNotification: Notification = {
            id: newNotificationTemp.id,
            recipientId: newNotificationTemp.recipient_id,
            actorId: newNotificationTemp.actor_id,
            actorName: metadataActorName,
            type: newNotificationTemp.type,
            entityId: newNotificationTemp.entity_id,
            metadata,
            isRead: newNotificationTemp.is_read,
            createdAt: new Date(newNotificationTemp.created_at),
          };

          queryClient.invalidateQueries({ queryKey: [...NOTIFICATIONS_QUERY_KEY, userId] });

          const descriptor = describeNotification(newNotification.type);
          addToast({
            type: descriptor.toastVariant,
            message: descriptor.getMessage(newNotification, userId),
            duration: 4000,
          });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'notifications',
          filter: `recipient_id=eq.${userId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: [...NOTIFICATIONS_QUERY_KEY, userId] });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'notifications',
        },
        () => {
          queryClient.invalidateQueries({ queryKey: [...NOTIFICATIONS_QUERY_KEY, userId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, queryClient, addToast]);
}
