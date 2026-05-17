import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AiConversationWithMessages } from "@/domain/modules/ai/models/Conversation";
import type { CreateConversationInput } from "@/domain/modules/ai/repositories/AiServiceRepository";
import {
  aiServiceConfigured,
  deleteAiConversationUseCase,
  getAiConversationUseCase,
  listAiConversationsUseCase,
  startAiConversationUseCase,
} from "@/infrastructure/modules/ai/config";
import { AI_QUERY_KEY } from "@/presentation/modules/ai/hooks/useAiSummary";

export const aiConversationsKey = () => [...AI_QUERY_KEY, "conversations"] as const;
export const aiConversationByIdKey = (conversationId: string | null | undefined) =>
  [...AI_QUERY_KEY, "conversation", conversationId ?? null] as const;

export function useAiConversations(enabled = true) {
  return useQuery({
    queryKey: aiConversationsKey(),
    queryFn: () => listAiConversationsUseCase.execute({ limit: 50, offset: 0 }),
    enabled: aiServiceConfigured && enabled,
    staleTime: 1000 * 30,
  });
}

export function useAiConversation(conversationId: string | null | undefined) {
  return useQuery({
    queryKey: aiConversationByIdKey(conversationId),
    queryFn: (): Promise<AiConversationWithMessages | null> => {
      if (!conversationId) return Promise.resolve(null);
      return getAiConversationUseCase.execute(conversationId);
    },
    enabled: aiServiceConfigured && !!conversationId,
    staleTime: 1000 * 30,
  });
}

export function useStartAiConversation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateConversationInput) => startAiConversationUseCase.execute(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: aiConversationsKey() });
    },
  });
}

export function useDeleteAiConversation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (conversationId: string) =>
      deleteAiConversationUseCase.execute(conversationId),
    onSuccess: (_data, conversationId) => {
      queryClient.removeQueries({ queryKey: aiConversationByIdKey(conversationId) });
      queryClient.invalidateQueries({ queryKey: aiConversationsKey() });
    },
  });
}
