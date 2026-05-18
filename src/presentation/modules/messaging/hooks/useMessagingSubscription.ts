import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/infrastructure/core/supabaseClient";
import type { Conversation } from "@/domain/modules/messaging/models/Conversation";
import type { Message } from "@/domain/modules/messaging/models/Message";
import { mapMessageRow, type MessageRow } from "@/infrastructure/modules/messaging/mappers/messageMapper";
import {
  conversationByIdKey,
  conversationsKey,
} from "@/presentation/modules/messaging/hooks/useConversations";
import {
  appendMessageToCache,
} from "@/presentation/modules/messaging/hooks/useMessages";
import {
  isConversationOpenSomewhere,
  useMessagingUIStore,
} from "@/presentation/modules/messaging/stores/useMessagingUIStore";
import { conversationRepository } from "@/infrastructure/modules/messaging/config";
import { playMessageSound } from "@/presentation/modules/messaging/utils/playMessageSound";

interface ParticipationCache {
  conversationIds: Set<string>;
}

export function useMessagingSubscription(userId: string | undefined | null) {
  const queryClient = useQueryClient();
  const participationRef = useRef<ParticipationCache>({ conversationIds: new Set() });

  useEffect(() => {
    if (!userId) return;

    let cancelled = false;

    const refreshParticipation = async () => {
      try {
        const conversations = await conversationRepository.listForUser(userId);
        if (cancelled) return;
        participationRef.current.conversationIds = new Set(
          conversations.map((c) => c.id),
        );
      } catch {
        /* Best-effort cache, will recover on next invalidation. */
      }
    };

    refreshParticipation();

    const handleParticipationChange = () => {
      queryClient.invalidateQueries({ queryKey: conversationsKey(userId) });
      refreshParticipation();
    };

    const messageChannel = supabase
      .channel(`messaging:user:${userId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
        },
        (payload) => {
          const row = payload.new as MessageRow;
          if (!participationRef.current.conversationIds.has(row.conversation_id)) {
            return;
          }
          const message: Message = mapMessageRow(row);

          appendMessageToCache(queryClient, message.conversationId, message);
          queryClient.invalidateQueries({ queryKey: conversationsKey(userId) });

          if (message.senderId === userId) return;

          const openSomewhere = isConversationOpenSomewhere(message.conversationId);
          if (!openSomewhere) {
            useMessagingUIStore
              .getState()
              .openBubble(message.conversationId, { minimized: true });
          }

          const soundEnabled = useMessagingUIStore.getState().isSoundEnabled;
          if (soundEnabled && !openSomewhere) {
            const conversations = queryClient.getQueryData<Conversation[]>(
              conversationsKey(userId),
            );
            const conv = conversations?.find((c) => c.id === message.conversationId);
            const myParticipant = conv?.participants.find((p) => p.userId === userId);
            const isMuted = myParticipant?.muted ?? false;
            if (!isMuted) {
              playMessageSound();
            }
          }
        },
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "conversations",
        },
        (payload) => {
          const conversationId = (payload.new as { id?: string }).id;
          if (!conversationId) return;
          if (!participationRef.current.conversationIds.has(conversationId)) return;
          queryClient.invalidateQueries({ queryKey: conversationsKey(userId) });
          queryClient.invalidateQueries({ queryKey: conversationByIdKey(conversationId) });
        },
      )
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "conversation_participants",
          filter: `user_id=eq.${userId}`,
        },
        handleParticipationChange,
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "conversation_participants",
        },
        (payload) => {
          const row = payload.new as { conversation_id?: string; user_id?: string };
          const conversationId = row.conversation_id;
          if (!conversationId) return;
          if (!participationRef.current.conversationIds.has(conversationId)) return;
          queryClient.invalidateQueries({ queryKey: conversationsKey(userId) });
          queryClient.invalidateQueries({ queryKey: conversationByIdKey(conversationId) });
        },
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "conversation_participants",
          filter: `user_id=eq.${userId}`,
        },
        handleParticipationChange,
      )
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(messageChannel);
    };
  }, [userId, queryClient]);
}
