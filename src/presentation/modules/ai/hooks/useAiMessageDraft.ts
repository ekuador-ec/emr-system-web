import { useCallback, useEffect, useRef, useState } from "react";
import {
  clearAiChatDraft,
  loadAiChatDraft,
  saveAiChatDraft,
} from "@/presentation/modules/ai/utils/aiChatDraftCache";

const DEBOUNCE_MS = 500;

interface UseAiMessageDraftResult {
  draft: string;
  setDraft: (value: string) => void;
  clear: () => void;
  isHydrating: boolean;
}

export function useAiMessageDraft(
  conversationId: string | null | undefined,
): UseAiMessageDraftResult {
  const [draft, setDraftState] = useState("");
  const [isHydrating, setIsHydrating] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const activeIdRef = useRef<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    activeIdRef.current = conversationId ?? null;
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    if (!conversationId) {
      setDraftState("");
      return;
    }

    setIsHydrating(true);
    void loadAiChatDraft(conversationId).then((entry) => {
      if (cancelled || activeIdRef.current !== conversationId) return;
      setDraftState(entry?.payload.content ?? "");
      setIsHydrating(false);
    });

    return () => {
      cancelled = true;
    };
  }, [conversationId]);

  const setDraft = useCallback(
    (value: string) => {
      setDraftState(value);
      if (!conversationId) return;
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        void saveAiChatDraft(conversationId, value);
      }, DEBOUNCE_MS);
    },
    [conversationId],
  );

  const clear = useCallback(() => {
    setDraftState("");
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (conversationId) clearAiChatDraft(conversationId);
  }, [conversationId]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return { draft, setDraft, clear, isHydrating };
}
