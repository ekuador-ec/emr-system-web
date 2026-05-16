import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Conversation, MessagingContact } from "@/domain/modules/messaging/models/Conversation";
import {
  listConversationsUseCase,
  getConversationUseCase,
  openDirectConversationUseCase,
  markConversationReadUseCase,
  toggleConversationMuteUseCase,
  listMessagingContactsUseCase,
} from "@/infrastructure/modules/messaging/config";

export const MESSAGING_QUERY_KEY = ["messaging"] as const;
export const conversationsKey = (userId: string | null | undefined) =>
  [...MESSAGING_QUERY_KEY, "conversations", userId ?? null] as const;
export const conversationByIdKey = (conversationId: string | null | undefined) =>
  [...MESSAGING_QUERY_KEY, "conversation", conversationId ?? null] as const;
export const contactsKey = () => [...MESSAGING_QUERY_KEY, "contacts"] as const;

export function useConversations(userId: string | undefined | null) {
  return useQuery({
    queryKey: conversationsKey(userId),
    queryFn: (): Promise<Conversation[]> => {
      if (!userId) return Promise.resolve([]);
      return listConversationsUseCase.execute(userId);
    },
    enabled: !!userId,
    staleTime: 1000 * 30,
  });
}

export function useConversation(conversationId: string | undefined | null) {
  return useQuery({
    queryKey: conversationByIdKey(conversationId),
    queryFn: (): Promise<Conversation | null> => {
      if (!conversationId) return Promise.resolve(null);
      return getConversationUseCase.execute(conversationId);
    },
    enabled: !!conversationId,
    staleTime: 1000 * 30,
  });
}

export function useMessagingContacts(enabled: boolean = true) {
  return useQuery({
    queryKey: contactsKey(),
    queryFn: (): Promise<MessagingContact[]> => listMessagingContactsUseCase.execute(),
    enabled,
    staleTime: 1000 * 30,
    refetchInterval: 1000 * 60,
  });
}

export function useOpenDirectConversation(userId: string | undefined | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (otherUserId: string) => openDirectConversationUseCase.execute(otherUserId),
    onSuccess: async (conversationId) => {
      await Promise.all([
        queryClient.refetchQueries({ queryKey: conversationsKey(userId) }),
        queryClient.prefetchQuery({
          queryKey: conversationByIdKey(conversationId),
          queryFn: () => getConversationUseCase.execute(conversationId),
        }),
      ]);
    },
  });
}

export function useMarkConversationRead(userId: string | undefined | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (conversationId: string) => markConversationReadUseCase.execute(conversationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: conversationsKey(userId) });
    },
  });
}

export function useToggleConversationMute(userId: string | undefined | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ conversationId, muted }: { conversationId: string; muted: boolean }) =>
      toggleConversationMuteUseCase.execute(conversationId, muted),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: conversationsKey(userId) });
      queryClient.invalidateQueries({ queryKey: conversationByIdKey(variables.conversationId) });
    },
  });
}
