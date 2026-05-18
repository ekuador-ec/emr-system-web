import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { SupabaseUserRepository } from "@/infrastructure/modules/users/repositories/SupabaseUserRepository";
import { SendPresenceHeartbeat } from "@/application/modules/users/use-cases/sendPresenceHeartbeat";
import { GetMyPresence } from "@/application/modules/users/use-cases/getMyPresence";
import type {
  ManualPresenceStatus,
  PresenceActivitySignal,
} from "@/domain/modules/users/models/User";
import {
  deriveEffectivePresence,
  usePresenceStore,
} from "@/presentation/modules/users/stores/usePresenceStore";
import { MESSAGING_QUERY_KEY } from "@/presentation/modules/messaging/hooks/useConversations";
import { ADMIN_USERS_QUERY_KEY } from "@/presentation/modules/users/hooks/useAdminUsers";

const FOCUSED_HEARTBEAT_MS = 30_000;
const HIDDEN_HEARTBEAT_MS = 60_000;
const HIDDEN_TO_IDLE_MS = 120_000;
const INPUT_IDLE_THRESHOLD_MS = 10 * 60_000;
const INTERACTION_THROTTLE_MS = 1_000;

const userRepository = new SupabaseUserRepository();
const sendHeartbeat = new SendPresenceHeartbeat(userRepository);
const getMyPresence = new GetMyPresence(userRepository);

/**
 * usePresenceTracker — Global hook for tracking user presence.
 *
 * Runs for ALL authenticated users (mounted in AppLayout).
 *
 * Responsibilities:
 *   - Heartbeat: every 30s when the tab is visible, 60s when hidden.
 *   - Idle detection: 10 minutes without input -> activity_signal = 'idle'.
 *   - Visibility: tab hidden for 2 minutes -> activity_signal = 'idle'.
 *   - On unmount/logout: marks the user offline via the legacy shim.
 *   - On pagehide: best-effort beacon flagged as idle so the server
 *     reaper can demote the user faster than the 5-minute fallback.
 *
 * The hook never sets the user offline by itself. The server-side
 * reaper (pg_cron `reap_stale_presence`) takes care of users who
 * closed the browser without logging out.
 */
export function usePresenceTracker(userId: string | undefined) {
  const queryClient = useQueryClient();
  const userIdRef = useRef(userId);
  userIdRef.current = userId;

  const lastInteractionRef = useRef<number>(Date.now());
  const lastInteractionFlushRef = useRef<number>(0);
  const activitySignalRef = useRef<PresenceActivitySignal>("active");
  const hiddenTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const heartbeatIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const manualStatusRef = useRef<ManualPresenceStatus>("available");

  const setManualStatus = usePresenceStore((state) => state.setManualStatus);
  const setActivitySignalInStore = usePresenceStore((state) => state.setActivitySignal);
  const setEffectiveStatusInStore = usePresenceStore((state) => state.setEffectiveStatus);
  const hydratePresence = usePresenceStore((state) => state.hydrate);
  const manualStatus = usePresenceStore((state) => state.manualStatus);

  manualStatusRef.current = manualStatus;

  useEffect(() => {
    if (!userId) return;

    let cancelled = false;

    const pushHeartbeat = async (signal: PresenceActivitySignal) => {
      const currentUserId = userIdRef.current;
      if (!currentUserId) return;
      activitySignalRef.current = signal;
      setActivitySignalInStore(signal);
      setEffectiveStatusInStore(deriveEffectivePresence(manualStatusRef.current, signal));
      await sendHeartbeat.execute(currentUserId, signal);
    };

    const setActivitySignal = (signal: PresenceActivitySignal) => {
      if (activitySignalRef.current === signal) return;
      void pushHeartbeat(signal);
    };

    const handleInteraction = () => {
      const now = Date.now();
      lastInteractionRef.current = now;
      if (activitySignalRef.current === "idle") {
        setActivitySignal("active");
        return;
      }
      if (now - lastInteractionFlushRef.current < INTERACTION_THROTTLE_MS) return;
      lastInteractionFlushRef.current = now;
    };

    const evaluateIdleByInactivity = () => {
      if (activitySignalRef.current === "idle") return;
      if (document.visibilityState === "hidden") return;
      if (Date.now() - lastInteractionRef.current >= INPUT_IDLE_THRESHOLD_MS) {
        setActivitySignal("idle");
      }
    };

    const scheduleHeartbeat = () => {
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current);
      }
      const intervalMs =
        document.visibilityState === "hidden"
          ? HIDDEN_HEARTBEAT_MS
          : FOCUSED_HEARTBEAT_MS;
      heartbeatIntervalRef.current = setInterval(() => {
        evaluateIdleByInactivity();
        void pushHeartbeat(activitySignalRef.current);
      }, intervalMs);
    };

    const clearHiddenTimer = () => {
      if (hiddenTimerRef.current) {
        clearTimeout(hiddenTimerRef.current);
        hiddenTimerRef.current = null;
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        hiddenTimerRef.current = setTimeout(() => {
          setActivitySignal("idle");
        }, HIDDEN_TO_IDLE_MS);
      } else {
        clearHiddenTimer();
        lastInteractionRef.current = Date.now();
        setActivitySignal("active");
      }
      scheduleHeartbeat();
    };

    const handlePageHide = () => {
      const currentUserId = userIdRef.current;
      if (!currentUserId) return;
      void sendHeartbeat.execute(currentUserId, "idle");
    };

    const bootstrap = async () => {
      const snapshot = await getMyPresence.execute();
      if (cancelled) return;

      if (snapshot) {
        const initialActivity: PresenceActivitySignal = "active";
        activitySignalRef.current = initialActivity;
        hydratePresence({
          manualStatus: snapshot.manualStatus,
          activitySignal: initialActivity,
          effectiveStatus: deriveEffectivePresence(snapshot.manualStatus, initialActivity),
        });
      } else {
        hydratePresence({
          manualStatus: "available",
          activitySignal: "active",
          effectiveStatus: "online",
        });
      }

      void pushHeartbeat("active");
    };

    void bootstrap();
    scheduleHeartbeat();

    const interactionEvents: Array<keyof WindowEventMap> = [
      "mousemove",
      "keydown",
      "wheel",
      "touchstart",
      "scroll",
    ];
    interactionEvents.forEach((event) => {
      window.addEventListener(event, handleInteraction, { passive: true });
    });
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("pagehide", handlePageHide);

    return () => {
      cancelled = true;
      interactionEvents.forEach((event) => {
        window.removeEventListener(event, handleInteraction);
      });
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("pagehide", handlePageHide);
      clearHiddenTimer();
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current);
        heartbeatIntervalRef.current = null;
      }
      const currentUserId = userIdRef.current;
      if (currentUserId) {
        void sendHeartbeat.execute(currentUserId, "idle");
      }
      queryClient.invalidateQueries({ queryKey: MESSAGING_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ADMIN_USERS_QUERY_KEY });
    };
  }, [
    userId,
    queryClient,
    setActivitySignalInStore,
    setEffectiveStatusInStore,
    setManualStatus,
    hydratePresence,
  ]);
}
