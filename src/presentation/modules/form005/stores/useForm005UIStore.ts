import { create } from "zustand";

interface ReadOnlyForm005Target {
  patientId: string;
  documentId: string;
}

interface Form005UIState {
  activeTab: number;
  setActiveTab: (index: number) => void;
  reset: () => void;

  readOnlyTarget: ReadOnlyForm005Target | null;
  openReadOnlyForm005: (target: ReadOnlyForm005Target) => void;
  closeReadOnlyForm005: () => void;
}

export const useForm005UIStore = create<Form005UIState>((set) => ({
  activeTab: 0,
  setActiveTab: (index) => set({ activeTab: index }),
  reset: () => set({ activeTab: 0, readOnlyTarget: null }),

  readOnlyTarget: null,
  openReadOnlyForm005: (target) => set({ readOnlyTarget: target }),
  closeReadOnlyForm005: () => set({ readOnlyTarget: null }),
}));
