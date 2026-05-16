import { useEffect, useRef, useState } from "react";
import { supabase } from "@/infrastructure/core/supabaseClient";
import type { RealtimeChannel } from "@supabase/supabase-js";

const TYPING_EVENT = "typing";
const STOPPED_AFTER_MS = 4000;

interface TypingPayload {
  userId: string;
  isTyping: boolean;
}

export interface UseTypingChannel {
  remoteTypingUserIds: string[];
  notifyTyping: () => void;
}

export function useTypingChannel(
  conversationId: string | null | undefined,
  currentUserId: string | null | undefined,
): UseTypingChannel {
  const [remoteTypingUserIds, setRemoteTypingUserIds] = useState<string[]>([]);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const lastSentRef = useRef<number>(0);
  const stopTimersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  useEffect(() => {
    if (!conversationId || !currentUserId) {
      setRemoteTypingUserIds([]);
      return;
    }

    const channel = supabase.channel(`messaging:typing:${conversationId}`, {
      config: { broadcast: { self: false } },
    });

    channel.on("broadcast", { event: TYPING_EVENT }, ({ payload }) => {
      const typed = payload as TypingPayload;
      if (!typed || !typed.userId || typed.userId === currentUserId) return;

      if (typed.isTyping) {
        setRemoteTypingUserIds((prev) =>
          prev.includes(typed.userId) ? prev : [...prev, typed.userId],
        );
        const existing = stopTimersRef.current.get(typed.userId);
        if (existing) clearTimeout(existing);
        const timer = setTimeout(() => {
          setRemoteTypingUserIds((prev) => prev.filter((id) => id !== typed.userId));
          stopTimersRef.current.delete(typed.userId);
        }, STOPPED_AFTER_MS);
        stopTimersRef.current.set(typed.userId, timer);
      } else {
        setRemoteTypingUserIds((prev) => prev.filter((id) => id !== typed.userId));
        const existing = stopTimersRef.current.get(typed.userId);
        if (existing) {
          clearTimeout(existing);
          stopTimersRef.current.delete(typed.userId);
        }
      }
    });

    channel.subscribe();
    channelRef.current = channel;

    return () => {
      stopTimersRef.current.forEach((t) => clearTimeout(t));
      stopTimersRef.current.clear();
      supabase.removeChannel(channel);
      channelRef.current = null;
      setRemoteTypingUserIds([]);
    };
  }, [conversationId, currentUserId]);

  const notifyTyping = () => {
    if (!channelRef.current || !currentUserId) return;
    const now = Date.now();
    if (now - lastSentRef.current < 1500) return;
    lastSentRef.current = now;
    channelRef.current.send({
      type: "broadcast",
      event: TYPING_EVENT,
      payload: { userId: currentUserId, isTyping: true } satisfies TypingPayload,
    });
  };

  return { remoteTypingUserIds, notifyTyping };
}
