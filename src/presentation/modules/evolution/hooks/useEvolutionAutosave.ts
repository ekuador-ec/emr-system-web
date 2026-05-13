import { useCallback, useEffect, useRef, useState } from "react";
import type { UseFormReturn } from "react-hook-form";
import { useUpdateEvolution } from "@/presentation/modules/evolution/hooks/useEvolutions";
import {
  clearDraft as clearLocalDraft,
  saveDraft as saveLocalDraft,
} from "@/infrastructure/core/draftCache";
import type { UpdateEvolutionDraftFormValues } from "@/presentation/modules/evolution/schemas/evolution.schema";

export type EvolutionAutosaveStatus = "idle" | "dirty" | "saving" | "saved" | "error";

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
  localCacheDebounceMs?: number;
}

const DEFAULT_DEBOUNCE_MS = 6000;
const DEFAULT_LOCAL_CACHE_DEBOUNCE_MS = 800;

export function useEvolutionAutosave({
  evolutionId,
  methods,
  enabled,
  debounceMs = DEFAULT_DEBOUNCE_MS,
  localCacheDebounceMs = DEFAULT_LOCAL_CACHE_DEBOUNCE_MS,
}: UseEvolutionAutosaveOptions): UseEvolutionAutosaveResult {
  const updateEvolution = useUpdateEvolution();
  const [status, setStatus] = useState<EvolutionAutosaveStatus>("idle");
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);

  const lastSnapshotRef = useRef<string>("");
  const serverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const localTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inFlightRef = useRef<boolean>(false);

  const cancelServerTimer = useCallback(() => {
    if (serverTimerRef.current) {
      clearTimeout(serverTimerRef.current);
      serverTimerRef.current = null;
    }
  }, []);

  const cancelLocalTimer = useCallback(() => {
    if (localTimerRef.current) {
      clearTimeout(localTimerRef.current);
      localTimerRef.current = null;
    }
  }, []);

  const performAutosave = useCallback(async () => {
    if (!evolutionId || !enabled) return;
    if (inFlightRef.current) return;

    const data = methods.getValues();
    const snapshot = JSON.stringify(data);
    if (snapshot === lastSnapshotRef.current) {
      setStatus((prev) => (prev === "dirty" || prev === "saving" ? "saved" : prev));
      return;
    }

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
      // Always clear the local cache after a successful server save. If the
      // user kept typing during the request, the very next watch event will
      // refill the cache 800 ms later, so the recovery window stays minimal.
      clearLocalDraft(evolutionId);
    } catch (error) {
      console.error("Autosave failed", error);
      setStatus("error");
    } finally {
      inFlightRef.current = false;
    }
  }, [enabled, evolutionId, methods, updateEvolution]);

  // Subscribe to form changes, debounce both the server autosave and the
  // local cache write.
  useEffect(() => {
    if (!evolutionId || !enabled) {
      cancelServerTimer();
      cancelLocalTimer();
      return;
    }

    lastSnapshotRef.current = JSON.stringify(methods.getValues());

    const subscription = methods.watch(() => {
      // Skip phantom events that did not actually change the data (RHF can
      // emit them when arrays reshuffle, fields are registered, etc.).
      const currentSnapshot = JSON.stringify(methods.getValues());
      if (currentSnapshot === lastSnapshotRef.current) return;

      setStatus("dirty");

      // Eager local cache so even a hard refresh recovers the latest edits.
      cancelLocalTimer();
      localTimerRef.current = setTimeout(() => {
        void saveLocalDraft(evolutionId, methods.getValues());
      }, localCacheDebounceMs);

      // Slower server autosave: gives the user time to keep typing.
      cancelServerTimer();
      serverTimerRef.current = setTimeout(() => {
        void performAutosave();
      }, debounceMs);
    });

    return () => {
      subscription.unsubscribe();
      cancelServerTimer();
      cancelLocalTimer();
    };
  }, [
    evolutionId,
    enabled,
    methods,
    debounceMs,
    localCacheDebounceMs,
    performAutosave,
    cancelServerTimer,
    cancelLocalTimer,
  ]);

  // Flush any pending autosave when the user navigates away or hides the tab.
  useEffect(() => {
    if (!evolutionId || !enabled) return undefined;

    const flushIfPending = () => {
      if (serverTimerRef.current || inFlightRef.current) {
        void performAutosave();
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        flushIfPending();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", flushIfPending);
    window.addEventListener("pagehide", flushIfPending);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", flushIfPending);
      window.removeEventListener("pagehide", flushIfPending);
    };
  }, [evolutionId, enabled, performAutosave]);

  // Clean up timers on unmount.
  useEffect(() => {
    return () => {
      cancelServerTimer();
      cancelLocalTimer();
    };
  }, [cancelServerTimer, cancelLocalTimer]);

  const flush = useCallback(async () => {
    cancelServerTimer();
    cancelLocalTimer();
    await performAutosave();
  }, [cancelServerTimer, cancelLocalTimer, performAutosave]);

  return { status, lastSavedAt, flush };
}
