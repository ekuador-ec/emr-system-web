import { create } from 'zustand';

interface PatientFiltersState {
  search: string;
  isActive?: boolean;
  page: number;
  limit: number;
}

interface PatientState {
  isCreateModalOpen: boolean;
  isQuickSearchModalOpen: boolean;
  editingPatientId: string | null;
  selectedPatientId: string | null;
  patientFilters: PatientFiltersState;
  hasSearched: boolean; // Flag to indicate if the user has explicitly hit search
  setCreateModalOpen: (isOpen: boolean) => void;
  setQuickSearchModalOpen: (isOpen: boolean) => void;
  setEditingPatientId: (id: string | null) => void;
  setSelectedPatientId: (id: string | null) => void;
  setPatientFilters: (filters: Partial<PatientFiltersState>) => void;
  setHasSearched: (hasSearched: boolean) => void;
  resetPatientFilters: () => void;
}

export const usePatientStore = create<PatientState>((set) => ({
  isCreateModalOpen: false,
  editingPatientId: null,
  selectedPatientId: null,
  patientFilters: {
    search: '',
    page: 1,
    limit: 10,
  },
  hasSearched: false,
  isQuickSearchModalOpen: false,
  setCreateModalOpen: (isOpen) => set({ isCreateModalOpen: isOpen, editingPatientId: isOpen ? null : null }), // Reset editing ID on regular open/close
  setQuickSearchModalOpen: (isOpen) => set({ isQuickSearchModalOpen: isOpen }),
  setEditingPatientId: (id) => set({ editingPatientId: id, isCreateModalOpen: !!id }),
  setSelectedPatientId: (id) => set({ selectedPatientId: id }),
  setPatientFilters: (filters) =>
    set((state) => ({
      patientFilters: { ...state.patientFilters, ...filters },
    })),
  setHasSearched: (hasSearched) => set({ hasSearched }),
  resetPatientFilters: () =>
    set({
      patientFilters: { search: '', page: 1, limit: 10 },
      hasSearched: false,
    }),
}));
