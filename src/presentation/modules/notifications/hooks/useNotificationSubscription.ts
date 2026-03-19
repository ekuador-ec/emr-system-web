import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/infrastructure/core/supabaseClient';
import { useToastStore } from '@/presentation/modules/shared/components/Toaster';
import { NOTIFICATIONS_QUERY_KEY } from './useNotifications';
import type { Notification } from '@/domain/modules/notifications/models/Notification';

function getToastDetailsForType(notification: Notification): { title: string; type: 'success' | 'info' | 'warning' } {
  switch (notification.type) {
    case 'NEW_USER':
      return { title: 'Nuevo usuario registrado en el sistema.', type: 'info' };
    default:
      return { title: 'Nueva notificación.', type: 'info' };
  }
}

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
          
          const newNotification: Notification = {
            id: newNotificationTemp.id,
            recipientId: newNotificationTemp.recipient_id,
            actorId: newNotificationTemp.actor_id,
            actorName: null,
            type: newNotificationTemp.type,
            entityId: newNotificationTemp.entity_id,
            isRead: newNotificationTemp.is_read,
            createdAt: new Date(newNotificationTemp.created_at),
          };

          queryClient.invalidateQueries({ queryKey: [...NOTIFICATIONS_QUERY_KEY, userId] });

          const toastDetails = getToastDetailsForType(newNotification);
          addToast({
            type: toastDetails.type,
            message: toastDetails.title,
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
