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
const INACTIVE_TO_IDLE_MS = 180_000;
const INPUT_IDLE_THRESHOLD_MS = 5 * 60_000;
const INTERACTION_THROTTLE_MS = 1_000;
const INTERACTION_EVENTS = [
  "mousemove",
  "keydown",
  "wheel",
  "touchstart",
  "scroll",
] as const;

const userRepository = new SupabaseUserRepository();
const sendHeartbeat = new SendPresenceHeartbeat(userRepository);
const getMyPresence = new GetMyPresence(userRepository);

function computeIsWindowActive(): boolean {
  if (typeof document === "undefined") return true;
  if (document.visibilityState !== "visible") return false;
  if (typeof document.hasFocus === "function" && !document.hasFocus()) return false;
  return true;
}

/**
 * usePresenceTracker — Global hook for tracking user presence.
 *
 * Runs for ALL authenticated users (mounted in AppLayout). It uses
 * two independent triggers for the away signal and takes whichever
 * fires first:
 *
 *  1. Window inactivity (visibility OR focus). The tab is hidden or
 *     the browser window lost OS focus for 3 minutes uninterrupted.
 *     Covers tab switching, alt-tab, minimised browsers and screen
 *     locks.
 *  2. Input inactivity. The window is currently active but no
 *     mousemove, keydown, wheel, touchstart or scroll event has
 *     fired for 5 minutes. Covers the user walking away from a
 *     workstation without minimising the EMR.
 *
 * Heartbeats use an adaptive cadence: 30s when the window is active,
 * 60s otherwise. The cleanup sends a final heartbeat flagged as idle
 * so the server-side pg_cron reaper does not need to wait the full
 * 4-minute offline window after a logout or unmount.
 *
 * The client never marks itself offline: that decision belongs to
 * `public.reap_stale_presence`, which is the ultimate safety net for
 * abrupt browser closures.
 */
export function usePresenceTracker(userId: string | undefined) {
  const queryClient = useQueryClient();
  const userIdRef = useRef(userId);
  userIdRef.current = userId;

  const activitySignalRef = useRef<PresenceActivitySignal>("active");
  const inactiveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputIdleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const heartbeatIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastInteractionFlushRef = useRef<number>(0);
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

    const transitionToActive = () => {
      if (activitySignalRef.current === "active") return;
      void pushHeartbeat("active");
    };

    const transitionToIdle = () => {
      if (activitySignalRef.current === "idle") return;
      void pushHeartbeat("idle");
    };

    const clearInactiveTimer = () => {
      if (inactiveTimerRef.current) {
        clearTimeout(inactiveTimerRef.current);
        inactiveTimerRef.current = null;
      }
    };

    const clearInputIdleTimer = () => {
      if (inputIdleTimerRef.current) {
        clearTimeout(inputIdleTimerRef.current);
        inputIdleTimerRef.current = null;
      }
    };

    const armInactiveTimer = () => {
      if (inactiveTimerRef.current) return;
      inactiveTimerRef.current = setTimeout(() => {
        inactiveTimerRef.current = null;
        transitionToIdle();
      }, INACTIVE_TO_IDLE_MS);
    };

    const armInputIdleTimer = () => {
      clearInputIdleTimer();
      inputIdleTimerRef.current = setTimeout(() => {
        inputIdleTimerRef.current = null;
        transitionToIdle();
      }, INPUT_IDLE_THRESHOLD_MS);
    };

    const scheduleHeartbeat = (isActive: boolean) => {
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current);
      }
      const intervalMs = isActive ? FOCUSED_HEARTBEAT_MS : HIDDEN_HEARTBEAT_MS;
      heartbeatIntervalRef.current = setInterval(() => {
        void pushHeartbeat(activitySignalRef.current);
      }, intervalMs);
    };

    const applyWindowState = () => {
      const isActive = computeIsWindowActive();
      scheduleHeartbeat(isActive);

      if (isActive) {
        clearInactiveTimer();
        armInputIdleTimer();
        transitionToActive();
      } else {
        clearInputIdleTimer();
        armInactiveTimer();
      }
    };

    const handleInteraction = () => {
      const now = Date.now();
      if (now - lastInteractionFlushRef.current < INTERACTION_THROTTLE_MS) return;
      lastInteractionFlushRef.current = now;

      if (!computeIsWindowActive()) return;

      armInputIdleTimer();
      transitionToActive();
    };

    const handlePageHide = () => {
      const currentUserId = userIdRef.current;
      if (!currentUserId) return;
      void sendHeartbeat.execute(currentUserId, "idle");
    };

    const bootstrap = async () => {
      const snapshot = await getMyPresence.execute();
      if (cancelled) return;

      const isActive = computeIsWindowActive();
      const initialActivity: PresenceActivitySignal = isActive ? "active" : "idle";

      if (snapshot) {
        activitySignalRef.current = initialActivity;
        hydratePresence({
          manualStatus: snapshot.manualStatus,
          activitySignal: initialActivity,
          effectiveStatus: deriveEffectivePresence(snapshot.manualStatus, initialActivity),
        });
      } else {
        hydratePresence({
          manualStatus: "available",
          activitySignal: initialActivity,
          effectiveStatus: deriveEffectivePresence("available", initialActivity),
        });
      }

      void pushHeartbeat(initialActivity);
    };

    void bootstrap();
    applyWindowState();

    document.addEventListener("visibilitychange", applyWindowState);
    window.addEventListener("focus", applyWindowState);
    window.addEventListener("blur", applyWindowState);
    window.addEventListener("pagehide", handlePageHide);
    INTERACTION_EVENTS.forEach((event) => {
      window.addEventListener(event, handleInteraction, { passive: true });
    });

    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", applyWindowState);
      window.removeEventListener("focus", applyWindowState);
      window.removeEventListener("blur", applyWindowState);
      window.removeEventListener("pagehide", handlePageHide);
      INTERACTION_EVENTS.forEach((event) => {
        window.removeEventListener(event, handleInteraction);
      });
      clearInactiveTimer();
      clearInputIdleTimer();
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
