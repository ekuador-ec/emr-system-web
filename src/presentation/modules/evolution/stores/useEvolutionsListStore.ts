import { create } from "zustand";

interface EvolutionsListState {
  activeTab: number;
  searchInput: string;
  draftStartDate: string;
  draftEndDate: string;
  appliedSearch: string;
  appliedStartDate: string;
  appliedEndDate: string;
  advancedPage: number;

  setActiveTab: (tab: number) => void;
  setSearchInput: (value: string) => void;
  setDraftStartDate: (value: string) => void;
  setDraftEndDate: (value: string) => void;
  applyFilters: (search: string, startDate: string, endDate: string) => void;
  setAdvancedPage: (page: number) => void;
  clearAdvancedFilters: () => void;
}

export const useEvolutionsListStore = create<EvolutionsListState>((set) => ({
  activeTab: 0,
  searchInput: "",
  draftStartDate: "",
  draftEndDate: "",
  appliedSearch: "",
  appliedStartDate: "",
  appliedEndDate: "",
  advancedPage: 1,

  setActiveTab: (tab) => set({ activeTab: tab }),
  setSearchInput: (value) => set({ searchInput: value }),
  setDraftStartDate: (value) => set({ draftStartDate: value }),
  setDraftEndDate: (value) => set({ draftEndDate: value }),
  applyFilters: (search, startDate, endDate) =>
    set({ appliedSearch: search, appliedStartDate: startDate, appliedEndDate: endDate, advancedPage: 1 }),
  setAdvancedPage: (page) => set({ advancedPage: page }),
  clearAdvancedFilters: () =>
    set({
      searchInput: "",
      draftStartDate: "",
      draftEndDate: "",
      appliedSearch: "",
      appliedStartDate: "",
      appliedEndDate: "",
      advancedPage: 1,
    }),
}));
