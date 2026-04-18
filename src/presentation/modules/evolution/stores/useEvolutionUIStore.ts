import { create } from 'zustand';

interface EvolutionUIState {
  activeTab: number;
  setActiveTab: (index: number) => void;
  nextTab: () => void;
  prevTab: () => void;
  reset: () => void;
  
  isConfirmCloseModalOpen: boolean;
  setConfirmCloseModalOpen: (isOpen: boolean) => void;
}

export const useEvolutionUIStore = create<EvolutionUIState>((set) => ({
  activeTab: 0,
  setActiveTab: (index) => set({ activeTab: index }),
  nextTab: () => set((state) => ({ activeTab: Math.min(state.activeTab + 1, 6) })), // Asumimos 7 pestañas max
  prevTab: () => set((state) => ({ activeTab: Math.max(state.activeTab - 1, 0) })),
  reset: () => set({ activeTab: 0, isConfirmCloseModalOpen: false }),
  
  isConfirmCloseModalOpen: false,
  setConfirmCloseModalOpen: (isOpen) => set({ isConfirmCloseModalOpen: isOpen }),
}));
