import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
  type InfiniteData,
} from "@tanstack/react-query";
import type { Message, MessagePage } from "@/domain/modules/messaging/models/Message";
import {
  listMessagesUseCase,
  sendMessageUseCase,
} from "@/infrastructure/modules/messaging/config";
import {
  MESSAGING_QUERY_KEY,
  conversationsKey,
} from "@/presentation/modules/messaging/hooks/useConversations";

const PAGE_SIZE = 50;

export const messagesKey = (conversationId: string | null | undefined) =>
  [...MESSAGING_QUERY_KEY, "messages", conversationId ?? null] as const;

export function useMessages(conversationId: string | undefined | null) {
  return useInfiniteQuery({
    queryKey: messagesKey(conversationId),
    queryFn: ({ pageParam }): Promise<MessagePage> => {
      if (!conversationId) {
        return Promise.resolve({ messages: [], hasMore: false, nextCursor: null });
      }
      return listMessagesUseCase.execute(conversationId, {
        before: pageParam,
        limit: PAGE_SIZE,
      });
    },
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => (lastPage.hasMore ? lastPage.nextCursor : undefined),
    enabled: !!conversationId,
    staleTime: 1000 * 15,
  });
}

export function selectFlatMessages(data: InfiniteData<MessagePage> | undefined): Message[] {
  if (!data) return [];
  return data.pages.flatMap((page) => page.messages);
}

export function useSendMessage(userId: string | undefined | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      conversationId,
      content,
    }: {
      conversationId: string;
      content: string;
    }) => sendMessageUseCase.execute(conversationId, content),

    onMutate: ({ conversationId, content }) => {
      if (!userId) return { optimisticId: null };
      const optimisticId = `optimistic-${
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : Date.now().toString(36) + Math.random().toString(36).slice(2)
      }`;
      const optimisticMessage: Message = {
        id: optimisticId,
        conversationId,
        senderId: userId,
        content: content.trim(),
        createdAt: new Date().toISOString(),
        deletedAt: null,
      };
      appendMessageToCache(queryClient, conversationId, optimisticMessage);
      return { optimisticId };
    },

    onSuccess: (newMessage, variables, context) => {
      const key = messagesKey(variables.conversationId);
      const optimisticId = context?.optimisticId ?? null;

      queryClient.setQueryData<InfiniteData<MessagePage> | undefined>(key, (old) => {
        if (!old) return old;
        const pages = old.pages.map((page, idx) => {
          if (idx !== old.pages.length - 1) return page;
          const withoutOptimistic = optimisticId
            ? page.messages.filter((m) => m.id !== optimisticId)
            : page.messages;
          const alreadyPresent = withoutOptimistic.some((m) => m.id === newMessage.id);
          if (alreadyPresent) {
            return { ...page, messages: withoutOptimistic };
          }
          return { ...page, messages: [...withoutOptimistic, newMessage] };
        });
        return { ...old, pages };
      });

      queryClient.invalidateQueries({ queryKey: conversationsKey(userId) });
    },

    onError: (_error, variables, context) => {
      const optimisticId = context?.optimisticId ?? null;
      if (!optimisticId) return;
      const key = messagesKey(variables.conversationId);
      queryClient.setQueryData<InfiniteData<MessagePage> | undefined>(key, (old) => {
        if (!old) return old;
        const pages = old.pages.map((page) => ({
          ...page,
          messages: page.messages.filter((m) => m.id !== optimisticId),
        }));
        return { ...old, pages };
      });
    },
  });
}

export function appendMessageToCache(
  queryClient: ReturnType<typeof useQueryClient>,
  conversationId: string,
  message: Message,
): void {
  const key = messagesKey(conversationId);
  queryClient.setQueryData<InfiniteData<MessagePage> | undefined>(key, (old) => {
    if (!old) return old;
    const pages = old.pages.map((page, idx) => {
      if (idx !== old.pages.length - 1) return page;
      const alreadyPresent = page.messages.some((m) => m.id === message.id);
      if (alreadyPresent) return page;
      return { ...page, messages: [...page.messages, message] };
    });
    return { ...old, pages };
  });
}
