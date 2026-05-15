import { create } from 'zustand';

interface ReadOnlyEvolutionTarget {
  patientId: string;
  evolutionId: string;
}

interface EvolutionUIState {
  activeTab: number;
  setActiveTab: (index: number) => void;
  nextTab: () => void;
  prevTab: () => void;
  reset: () => void;

  isConfirmCloseModalOpen: boolean;
  setConfirmCloseModalOpen: (isOpen: boolean) => void;

  readOnlyTarget: ReadOnlyEvolutionTarget | null;
  openReadOnlyEvolution: (target: ReadOnlyEvolutionTarget) => void;
  closeReadOnlyEvolution: () => void;
}

export const useEvolutionUIStore = create<EvolutionUIState>((set) => ({
  activeTab: 0,
  setActiveTab: (index) => set({ activeTab: index }),
  nextTab: () => set((state) => ({ activeTab: Math.min(state.activeTab + 1, 6) })), // Asumimos 7 pestañas max
  prevTab: () => set((state) => ({ activeTab: Math.max(state.activeTab - 1, 0) })),
  reset: () =>
    set({ activeTab: 0, isConfirmCloseModalOpen: false, readOnlyTarget: null }),

  isConfirmCloseModalOpen: false,
  setConfirmCloseModalOpen: (isOpen) => set({ isConfirmCloseModalOpen: isOpen }),

  readOnlyTarget: null,
  openReadOnlyEvolution: (target) => set({ readOnlyTarget: target }),
  closeReadOnlyEvolution: () => set({ readOnlyTarget: null }),
}));
