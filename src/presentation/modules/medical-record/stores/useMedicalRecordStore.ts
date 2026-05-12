import { create } from 'zustand';
import type { MedicalRecordFilters } from '@/domain/modules/medical-record/models/MedicalRecord';

interface MedicalRecordStoreState {
  filters: MedicalRecordFilters;
  setFilters: (filters: Partial<MedicalRecordFilters>) => void;
  resetFilters: () => void;
  selectedMedicalRecordId: string | null;
  setSelectedMedicalRecordId: (id: string | null) => void;
  isConfigModalOpen: boolean;
  setIsConfigModalOpen: (isOpen: boolean) => void;
  hasSearched: boolean;
}

const INITIAL_FILTERS: MedicalRecordFilters = {
  page: 1,
  limit: 10,
  search: '',
};

export const useMedicalRecordStore = create<MedicalRecordStoreState>((set) => ({
  filters: { ...INITIAL_FILTERS },
  setFilters: (newFilters) =>
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
      hasSearched: true,
    })),
  resetFilters: () =>
    set({
      filters: { ...INITIAL_FILTERS },
      hasSearched: true,
    }),
  selectedMedicalRecordId: null,
  setSelectedMedicalRecordId: (id) => set({ selectedMedicalRecordId: id }),
  isConfigModalOpen: false,
  setIsConfigModalOpen: (isOpen) => set({ isConfigModalOpen: isOpen }),
  hasSearched: true,
}));
