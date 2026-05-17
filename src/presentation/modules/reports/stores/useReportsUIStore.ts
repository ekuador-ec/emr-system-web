import { create } from "zustand";
import type { ReportGranularity } from "@/domain/modules/reports/models/ReportRange";
import {
  computePresetRange,
  suggestGranularity,
  type DateRangePreset,
  type DateRangeValue,
} from "../utils/dateRange";

interface ReportsUIState {
  preset: DateRangePreset;
  range: DateRangeValue;
  granularity: ReportGranularity;

  setPreset: (preset: DateRangePreset) => void;
  setCustomRange: (range: DateRangeValue) => void;
  setGranularity: (granularity: ReportGranularity) => void;
  reset: () => void;
}

const DEFAULT_PRESET: DateRangePreset = "last30";

function initialState() {
  const range = computePresetRange(DEFAULT_PRESET);
  return {
    preset: DEFAULT_PRESET,
    range,
    granularity: suggestGranularity(range),
  };
}

export const useReportsUIStore = create<ReportsUIState>((set) => ({
  ...initialState(),

  setPreset: (preset) => {
    const range = computePresetRange(preset);
    set({ preset, range, granularity: suggestGranularity(range) });
  },
  setCustomRange: (range) => {
    set({ preset: "custom", range, granularity: suggestGranularity(range) });
  },
  setGranularity: (granularity) => set({ granularity }),
  reset: () => set(initialState()),
}));
