import { useEffect, useRef, useState } from "react";
import {
  clearMessageDraft,
  loadMessageDraft,
  saveMessageDraft,
} from "@/presentation/modules/messaging/utils/messageDraftCache";

const SAVE_DEBOUNCE_MS = 500;

export interface UseMessageDraftResult {
  draft: string;
  setDraft: (value: string) => void;
  clearDraft: () => void;
}

export function useMessageDraft(conversationId: string | null | undefined): UseMessageDraftResult {
  const [draft, setDraftState] = useState<string>("");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastConversationRef = useRef<string | null>(null);

  useEffect(() => {
    if (!conversationId) {
      setDraftState("");
      lastConversationRef.current = null;
      return;
    }

    lastConversationRef.current = conversationId;
    let cancelled = false;

    loadMessageDraft(conversationId).then((stored) => {
      if (cancelled || lastConversationRef.current !== conversationId) return;
      setDraftState(stored);
    });

    return () => {
      cancelled = true;
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
        debounceRef.current = null;
      }
    };
  }, [conversationId]);

  const setDraft = (value: string) => {
    setDraftState(value);
    if (!conversationId) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const snapshotId = conversationId;
    const snapshotValue = value;
    debounceRef.current = setTimeout(() => {
      saveMessageDraft(snapshotId, snapshotValue);
    }, SAVE_DEBOUNCE_MS);
  };

  const clearDraft = () => {
    setDraftState("");
    if (!conversationId) return;
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }
    clearMessageDraft(conversationId);
  };

  return { draft, setDraft, clearDraft };
}
