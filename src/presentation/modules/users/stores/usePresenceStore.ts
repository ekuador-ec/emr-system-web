import { create } from "zustand";
import type {
  ManualPresenceStatus,
  PresenceActivitySignal,
  PresenceStatus,
} from "@/domain/modules/users/models/User";

interface PresenceStoreState {
  manualStatus: ManualPresenceStatus;
  activitySignal: PresenceActivitySignal;
  effectiveStatus: PresenceStatus;
  isHydrated: boolean;
  setManualStatus: (status: ManualPresenceStatus) => void;
  setActivitySignal: (signal: PresenceActivitySignal) => void;
  setEffectiveStatus: (status: PresenceStatus) => void;
  hydrate: (snapshot: {
    manualStatus: ManualPresenceStatus;
    activitySignal: PresenceActivitySignal;
    effectiveStatus: PresenceStatus;
  }) => void;
  reset: () => void;
}

const INITIAL_STATE = {
  manualStatus: "available" as ManualPresenceStatus,
  activitySignal: "active" as PresenceActivitySignal,
  effectiveStatus: "online" as PresenceStatus,
  isHydrated: false,
};

export const usePresenceStore = create<PresenceStoreState>((set) => ({
  ...INITIAL_STATE,
  setManualStatus: (status) => set({ manualStatus: status }),
  setActivitySignal: (signal) => set({ activitySignal: signal }),
  setEffectiveStatus: (status) => set({ effectiveStatus: status }),
  hydrate: (snapshot) =>
    set({
      manualStatus: snapshot.manualStatus,
      activitySignal: snapshot.activitySignal,
      effectiveStatus: snapshot.effectiveStatus,
      isHydrated: true,
    }),
  reset: () => set({ ...INITIAL_STATE }),
}));

/**
 * Derives the effective presence status that other users should see,
 * given the current manual preference and activity signal.
 *
 * Mirrors the SQL helper `public.effective_presence_status` so the UI
 * can show the right color optimistically while a roundtrip is in flight.
 */
export function deriveEffectivePresence(
  manualStatus: ManualPresenceStatus,
  activitySignal: PresenceActivitySignal,
): PresenceStatus {
  if (manualStatus === "invisible") return "offline";
  if (manualStatus === "busy") return "busy";
  if (activitySignal === "idle") return "away";
  return "online";
}
