import { create } from 'zustand';
import type { MedicalRecordFilters } from '@/domain/modules/medical-record/models/MedicalRecord';

interface MedicalRecordStoreState {
  filters: MedicalRecordFilters;
  setFilters: (filters: Partial<MedicalRecordFilters>) => void;
  selectedMedicalRecordId: string | null;
  setSelectedMedicalRecordId: (id: string | null) => void;
  isConfigModalOpen: boolean;
  setIsConfigModalOpen: (isOpen: boolean) => void;
  hasSearched: boolean;
}

export const useMedicalRecordStore = create<MedicalRecordStoreState>((set) => ({
  filters: {
    page: 1,
    limit: 10,
    search: '',
  },
  setFilters: (newFilters) => 
    set((state) => ({ 
      filters: { ...state.filters, ...newFilters },
      hasSearched: true 
    })),
  selectedMedicalRecordId: null,
  setSelectedMedicalRecordId: (id) => set({ selectedMedicalRecordId: id }),
  isConfigModalOpen: false,
  setIsConfigModalOpen: (isOpen) => set({ isConfigModalOpen: isOpen }),
  hasSearched: true,
}));
