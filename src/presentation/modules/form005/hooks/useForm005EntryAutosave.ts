import { useCallback, useEffect, useRef, useState } from "react";
import type { UseFormReturn } from "react-hook-form";
import { useAddForm005Entry, useUpdateForm005Entry } from "./useForm005";
import { clearDraft, saveDraft } from "@/infrastructure/core/draftCache";
import type { Form005EntryFormValues } from "../schemas/form005.schema";

export type Form005AutosaveStatus = "idle" | "dirty" | "saving" | "saved" | "error";

export interface UseForm005EntryAutosaveResult {
  status: Form005AutosaveStatus;
  lastSavedAt: Date | null;
  flush: () => Promise<void>;
}

interface Options {
  documentId: string | undefined;
  entryId: string | null;
  methods: UseFormReturn<Form005EntryFormValues>;
  enabled: boolean;
  onEntryCreated: (id: string) => void;
  debounceMs?: number;
  localCacheDebounceMs?: number;
}

const DEFAULT_DEBOUNCE_MS = 5000;
const DEFAULT_LOCAL_CACHE_DEBOUNCE_MS = 800;

export function draftKeyFor(documentId: string, entryId: string | null): string {
  return `f005:${documentId}:${entryId ?? "new"}`;
}

export function useForm005EntryAutosave({
  documentId,
  entryId,
  methods,
  enabled,
  onEntryCreated,
  debounceMs = DEFAULT_DEBOUNCE_MS,
  localCacheDebounceMs = DEFAULT_LOCAL_CACHE_DEBOUNCE_MS,
}: Options): UseForm005EntryAutosaveResult {
  const addEntry = useAddForm005Entry();
  const updateEntry = useUpdateForm005Entry();
  const [status, setStatus] = useState<Form005AutosaveStatus>("idle");
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);

  const lastSnapshotRef = useRef<string>("");
  const entryIdRef = useRef<string | null>(entryId);
  const serverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const localTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inFlightRef = useRef(false);

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

  // Sync when the workspace switches the active attention (edit another / start new).
  useEffect(() => {
    if (entryId === entryIdRef.current) return;
    entryIdRef.current = entryId;
    lastSnapshotRef.current = JSON.stringify(methods.getValues());
    setStatus("idle");
    setLastSavedAt(null);
  }, [entryId, methods]);

  const performAutosave = useCallback(async () => {
    if (!documentId || !enabled) return;
    if (inFlightRef.current) return;

    const data = methods.getValues();
    const snapshot = JSON.stringify(data);
    if (snapshot === lastSnapshotRef.current) {
      setStatus((prev) => (prev === "dirty" || prev === "saving" ? "saved" : prev));
      return;
    }

    // The evolution note is the minimum content required to persist an entry.
    if (!data.evolutionNote || !data.evolutionNote.trim()) {
      setStatus("dirty");
      return;
    }

    inFlightRef.current = true;
    setStatus("saving");

    try {
      if (entryIdRef.current) {
        await updateEntry.mutateAsync({
          documentId,
          entryId: entryIdRef.current,
          payload: data as never,
        });
      } else {
        const result = await addEntry.mutateAsync({ documentId, payload: data as never });
        entryIdRef.current = result.entryId;
        onEntryCreated(result.entryId);
        clearDraft(draftKeyFor(documentId, null));
      }
      lastSnapshotRef.current = snapshot;
      setLastSavedAt(new Date());
      setStatus("saved");
      clearDraft(draftKeyFor(documentId, entryIdRef.current));
    } catch (error) {
      console.error("Form 005 autosave failed", error);
      setStatus("error");
    } finally {
      inFlightRef.current = false;
    }
  }, [documentId, enabled, methods, addEntry, updateEntry, onEntryCreated]);

  useEffect(() => {
    if (!documentId || !enabled) {
      cancelServerTimer();
      cancelLocalTimer();
      return;
    }

    lastSnapshotRef.current = JSON.stringify(methods.getValues());

    const subscription = methods.watch(() => {
      const currentSnapshot = JSON.stringify(methods.getValues());
      if (currentSnapshot === lastSnapshotRef.current) return;

      setStatus("dirty");

      cancelLocalTimer();
      localTimerRef.current = setTimeout(() => {
        void saveDraft(draftKeyFor(documentId, entryIdRef.current), methods.getValues());
      }, localCacheDebounceMs);

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
    documentId,
    enabled,
    methods,
    debounceMs,
    localCacheDebounceMs,
    performAutosave,
    cancelServerTimer,
    cancelLocalTimer,
  ]);

  useEffect(() => {
    if (!documentId || !enabled) return undefined;

    const flushIfPending = () => {
      if (serverTimerRef.current || inFlightRef.current) {
        void performAutosave();
      }
    };
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") flushIfPending();
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", flushIfPending);
    window.addEventListener("pagehide", flushIfPending);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", flushIfPending);
      window.removeEventListener("pagehide", flushIfPending);
    };
  }, [documentId, enabled, performAutosave]);

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
