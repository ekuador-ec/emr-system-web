import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationService } from '@/infrastructure/modules/notifications/config';
import type { Notification } from '@/domain/modules/notifications/models/Notification';

export const NOTIFICATIONS_QUERY_KEY = ['notifications'];

export function useNotificationsList(userId: string | undefined) {
  return useQuery({
    queryKey: [...NOTIFICATIONS_QUERY_KEY, userId],
    queryFn: () => {
      if (!userId) return Promise.resolve([]);
      return notificationService.getNotifications(userId);
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useMarkNotificationRead(userId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (notificationId: string) => notificationService.markAsRead(notificationId),
    onSuccess: (_, notificationId) => {
      if (userId) {
        queryClient.setQueryData(
          [...NOTIFICATIONS_QUERY_KEY, userId],
          (oldData: Notification[] | undefined) => {
            if (!oldData) return oldData;
            return oldData.map(n => n.id === notificationId ? { ...n, isRead: true } : n);
          }
        );
      }
      queryClient.invalidateQueries({ queryKey: [...NOTIFICATIONS_QUERY_KEY, userId] });
    },
  });
}

export function useMarkAllNotificationsRead(userId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => {
      if (!userId) return Promise.resolve();
      return notificationService.markAllAsRead(userId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...NOTIFICATIONS_QUERY_KEY, userId] });
    },
  });
}
