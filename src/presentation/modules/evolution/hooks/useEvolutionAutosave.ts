import { useCallback, useEffect, useRef, useState } from "react";
import type { UseFormReturn } from "react-hook-form";
import { useUpdateEvolution } from "@/presentation/modules/evolution/hooks/useEvolutions";
import {
  clearDraft as clearLocalDraft,
  saveDraft as saveLocalDraft,
} from "@/infrastructure/core/draftCache";
import type { UpdateEvolutionDraftFormValues } from "@/presentation/modules/evolution/schemas/evolution.schema";

export type EvolutionAutosaveStatus = "idle" | "saving" | "saved" | "error";

export interface UseEvolutionAutosaveResult {
  status: EvolutionAutosaveStatus;
  lastSavedAt: Date | null;
  flush: () => Promise<void>;
}

interface UseEvolutionAutosaveOptions {
  evolutionId: string | undefined;
  methods: UseFormReturn<UpdateEvolutionDraftFormValues>;
  enabled: boolean;
  debounceMs?: number;
}

const DEFAULT_DEBOUNCE_MS = 6000;

export function useEvolutionAutosave({
  evolutionId,
  methods,
  enabled,
  debounceMs = DEFAULT_DEBOUNCE_MS,
}: UseEvolutionAutosaveOptions): UseEvolutionAutosaveResult {
  const updateEvolution = useUpdateEvolution();
  const [status, setStatus] = useState<EvolutionAutosaveStatus>("idle");
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);

  const lastSnapshotRef = useRef<string>("");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inFlightRef = useRef<boolean>(false);

  const cancelPendingTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const performAutosave = useCallback(async () => {
    if (!evolutionId || !enabled) return;
    if (inFlightRef.current) return;

    const data = methods.getValues();
    const snapshot = JSON.stringify(data);
    if (snapshot === lastSnapshotRef.current) return;

    inFlightRef.current = true;
    setStatus("saving");

    try {
      await updateEvolution.mutateAsync({
        id: evolutionId,
        payload: data as never,
      });
      lastSnapshotRef.current = snapshot;
      setLastSavedAt(new Date());
      setStatus("saved");
      clearLocalDraft(evolutionId);
    } catch {
      setStatus("error");
      await saveLocalDraft(evolutionId, data);
    } finally {
      inFlightRef.current = false;
    }
  }, [enabled, evolutionId, methods, updateEvolution]);

  // Subscribe to form changes and debounce the save.
  useEffect(() => {
    if (!evolutionId || !enabled) {
      cancelPendingTimer();
      return;
    }

    // Seed snapshot with the current values so the first autosave only
    // fires after a real edit.
    lastSnapshotRef.current = JSON.stringify(methods.getValues());

    const subscription = methods.watch(() => {
      cancelPendingTimer();
      timerRef.current = setTimeout(() => {
        void performAutosave();
      }, debounceMs);
    });

    return () => {
      subscription.unsubscribe();
      cancelPendingTimer();
    };
  }, [evolutionId, enabled, methods, debounceMs, performAutosave, cancelPendingTimer]);

  // Flush any pending autosave when the consumer unmounts.
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, []);

  const flush = useCallback(async () => {
    cancelPendingTimer();
    await performAutosave();
  }, [cancelPendingTimer, performAutosave]);

  return { status, lastSavedAt, flush };
}
