import { useEffect, useRef } from "react";
import { supabase } from "@/infrastructure/core/supabaseClient";

const HEARTBEAT_INTERVAL_MS = 30_000; // 30 seconds

/**
 * usePresenceTracker — Global hook for tracking user presence.
 *
 * Must run for ALL authenticated users (placed in AppLayout).
 * - On mount: marks the user as online via `upsert_presence` RPC
 * - Every 30s: sends a heartbeat to keep `last_seen` fresh
 * - On unmount/logout: marks the user as offline
 * - On tab close: attempts to mark offline via `navigator.sendBeacon`
 *
 * This writes directly to the `presence_status` table in the database,
 * providing a server-side source of truth for the admin panel.
 */
export function usePresenceTracker(userId: string | undefined) {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const userIdRef = useRef(userId);

  userIdRef.current = userId;

  useEffect(() => {
    if (!userId) return;
    const markOnline = () => {
      supabase
        .rpc("upsert_presence", {
          p_user_id: userId,
          p_is_online: true,
        })
        .then(({ error }) => {
          if (error) console.error("Presence: error marking online", error);
        });
    };

    const markOffline = () => {
      supabase
        .rpc("upsert_presence", {
          p_user_id: userId,
          p_is_online: false,
        })
        .then(({ error }) => {
          if (error) console.error("Presence: error marking offline", error);
        });
    };

    const handleBeforeUnload = () => {
      const url = `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/rpc/upsert_presence`;

      const body = JSON.stringify({
        p_user_id: userIdRef.current,
        p_is_online: false,
      });

      navigator.sendBeacon(url, new Blob([body], { type: "application/json" }));

      markOffline();
    };
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        markOffline();
      } else {
        markOnline();
      }
    };

    markOnline();

    intervalRef.current = setInterval(markOnline, HEARTBEAT_INTERVAL_MS);

    window.addEventListener("beforeunload", handleBeforeUnload);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      window.removeEventListener("beforeunload", handleBeforeUnload);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      markOffline();
    };
  }, [userId]);
}
