import { useConversations } from "@/presentation/modules/messaging/hooks/useConversations";

export function useUnreadMessagesTotal(userId: string | undefined | null): number {
  const { data } = useConversations(userId);
  if (!data) return 0;
  return data.reduce((sum, conv) => sum + (conv.unreadCount ?? 0), 0);
}
