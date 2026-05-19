import { create } from "zustand";
import type { AiModelPreference } from "@/domain/modules/ai/models/Summary";
import type { AiConversationKind } from "@/domain/modules/ai/models/Conversation";

export interface AiAssistantTarget {
  kind: AiConversationKind;
  entityId: string | null;
  label: string;
}

interface AiAssistantState {
  isOpen: boolean;
  target: AiAssistantTarget | null;
  preference: AiModelPreference;
  activeConversationId: string | null;
  streamingDraft: string;
  isStreaming: boolean;
  open: (target: AiAssistantTarget) => void;
  close: () => void;
  setPreference: (preference: AiModelPreference) => void;
  setActiveConversation: (conversationId: string | null) => void;
  appendStreamingChunk: (chunk: string) => void;
  resetStreaming: () => void;
  setStreaming: (value: boolean) => void;
  reset: () => void;
}

const INITIAL_STATE = {
  isOpen: false,
  target: null,
  preference: "auto" as AiModelPreference,
  activeConversationId: null,
  streamingDraft: "",
  isStreaming: false,
};

export const useAiAssistantStore = create<AiAssistantState>((set) => ({
  ...INITIAL_STATE,
  open: (target) =>
    set((state) => ({
      isOpen: true,
      target,
      activeConversationId:
        state.target && state.target.entityId === target.entityId && state.target.kind === target.kind
          ? state.activeConversationId
          : null,
      streamingDraft: "",
      isStreaming: false,
    })),
  close: () => set({ isOpen: false, streamingDraft: "", isStreaming: false }),
  setPreference: (preference) => set({ preference }),
  setActiveConversation: (conversationId) =>
    set({ activeConversationId: conversationId, streamingDraft: "", isStreaming: false }),
  appendStreamingChunk: (chunk) =>
    set((state) => ({ streamingDraft: state.streamingDraft + chunk })),
  resetStreaming: () => set({ streamingDraft: "", isStreaming: false }),
  setStreaming: (value) => set({ isStreaming: value }),
  reset: () => set(INITIAL_STATE),
}));
