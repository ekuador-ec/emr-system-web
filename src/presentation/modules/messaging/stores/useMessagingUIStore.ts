import { create } from "zustand";

const MAX_BUBBLES = 5;
const SOUND_PREFERENCE_STORAGE_KEY = "messaging:sound-enabled";

function readSoundPreference(): boolean {
  if (typeof window === "undefined") return true;
  try {
    const raw = window.localStorage.getItem(SOUND_PREFERENCE_STORAGE_KEY);
    if (raw === null) return true;
    return raw === "true";
  } catch {
    return true;
  }
}

function writeSoundPreference(value: boolean): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(SOUND_PREFERENCE_STORAGE_KEY, String(value));
  } catch {
    /* localStorage may be unavailable in private mode; ignore. */
  }
}

interface BubbleState {
  conversationId: string;
  isMinimized: boolean;
}

export interface MessagingUIState {
  activeConversationId: string | null;
  bubbles: BubbleState[];
  isHubOpen: boolean;
  hubTab: "chats" | "users";
  isNewChatPickerOpen: boolean;
  isSoundEnabled: boolean;

  setActiveConversation: (conversationId: string | null) => void;
  setHubOpen: (open: boolean) => void;
  setHubTab: (tab: "chats" | "users") => void;
  setNewChatPickerOpen: (open: boolean) => void;
  setSoundEnabled: (enabled: boolean) => void;

  openBubble: (conversationId: string, options?: { minimized?: boolean }) => void;
  closeBubble: (conversationId: string) => void;
  toggleBubbleMinimized: (conversationId: string) => void;
  focusBubble: (conversationId: string) => void;

  reset: () => void;
}

const initialState = {
  activeConversationId: null as string | null,
  bubbles: [] as BubbleState[],
  isHubOpen: false,
  hubTab: "chats" as const,
  isNewChatPickerOpen: false,
  isSoundEnabled: readSoundPreference(),
};

function capStack(bubbles: BubbleState[]): BubbleState[] {
  if (bubbles.length <= MAX_BUBBLES) return bubbles;
  const expandedIndex = bubbles.findIndex((b) => !b.isMinimized);
  const expanded = expandedIndex >= 0 ? bubbles[expandedIndex] : null;
  const others = bubbles.filter((_, idx) => idx !== expandedIndex);
  const keepOthers = others.slice(-(MAX_BUBBLES - (expanded ? 1 : 0)));
  return expanded ? [...keepOthers, expanded] : keepOthers;
}

export const useMessagingUIStore = create<MessagingUIState>((set) => ({
  ...initialState,

  setActiveConversation: (conversationId) => set({ activeConversationId: conversationId }),
  setHubOpen: (open) => set({ isHubOpen: open }),
  setHubTab: (tab) => set({ hubTab: tab }),
  setNewChatPickerOpen: (open) => set({ isNewChatPickerOpen: open }),
  setSoundEnabled: (enabled) => {
    writeSoundPreference(enabled);
    set({ isSoundEnabled: enabled });
  },

  openBubble: (conversationId, options) =>
    set((state) => {
      if (!conversationId) return state;
      const minimized = options?.minimized ?? false;

      if (minimized) {
        const existing = state.bubbles.find((b) => b.conversationId === conversationId);
        if (existing) return state;
        const next: BubbleState = { conversationId, isMinimized: true };
        return { bubbles: capStack([next, ...state.bubbles]) };
      }

      const target = state.bubbles.find((b) => b.conversationId === conversationId);
      const others = state.bubbles.filter((b) => b.conversationId !== conversationId);
      const justDemoted: BubbleState[] = [];
      const restMinimized: BubbleState[] = [];
      for (const o of others) {
        if (!o.isMinimized) {
          justDemoted.push({ ...o, isMinimized: true });
        } else {
          restMinimized.push(o);
        }
      }
      const next: BubbleState = target
        ? { ...target, isMinimized: false }
        : { conversationId, isMinimized: false };
      return {
        bubbles: capStack([...justDemoted, ...restMinimized, next]),
      };
    }),

  closeBubble: (conversationId) =>
    set((state) => ({
      bubbles: state.bubbles.filter((b) => b.conversationId !== conversationId),
    })),

  toggleBubbleMinimized: (conversationId) =>
    set((state) => {
      const target = state.bubbles.find((b) => b.conversationId === conversationId);
      if (!target) return state;

      if (target.isMinimized) {
        const others = state.bubbles.filter((b) => b.conversationId !== conversationId);
        const justDemoted: BubbleState[] = [];
        const restMinimized: BubbleState[] = [];
        for (const o of others) {
          if (!o.isMinimized) {
            justDemoted.push({ ...o, isMinimized: true });
          } else {
            restMinimized.push(o);
          }
        }
        return {
          bubbles: capStack([
            ...justDemoted,
            ...restMinimized,
            { ...target, isMinimized: false },
          ]),
        };
      }

      const others = state.bubbles.filter((b) => b.conversationId !== conversationId);
      return {
        bubbles: capStack([{ ...target, isMinimized: true }, ...others]),
      };
    }),

  focusBubble: (conversationId) =>
    set((state) => {
      const target = state.bubbles.find((b) => b.conversationId === conversationId);
      if (!target) return state;
      const others = state.bubbles.filter((b) => b.conversationId !== conversationId);
      const justDemoted: BubbleState[] = [];
      const restMinimized: BubbleState[] = [];
      for (const o of others) {
        if (!o.isMinimized) {
          justDemoted.push({ ...o, isMinimized: true });
        } else {
          restMinimized.push(o);
        }
      }
      return {
        bubbles: capStack([
          ...justDemoted,
          ...restMinimized,
          { ...target, isMinimized: false },
        ]),
      };
    }),

  reset: () => set({ ...initialState, isSoundEnabled: readSoundPreference() }),
}));

export function isConversationOpenSomewhere(conversationId: string): boolean {
  const state = useMessagingUIStore.getState();
  if (state.activeConversationId === conversationId) return true;
  return state.bubbles.some((b) => b.conversationId === conversationId && !b.isMinimized);
}
