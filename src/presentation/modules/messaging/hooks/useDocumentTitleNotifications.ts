import { useEffect, useRef } from "react";
import { useUnreadMessagesTotal } from "@/presentation/modules/messaging/hooks/useUnreadMessagesTotal";

/**
 * useDocumentTitleNotifications — prepends an unread message count
 * to `document.title` so the user can spot pending messages from the
 * OS tab bar, similar to WhatsApp Web.
 *
 * Format: `(3) EMR | Gestion de Historias Clinicas`.
 *
 * When the unread total drops to zero the original title is restored
 * (also on unmount and logout, since the hook is mounted in AppLayout
 * and unmounts together with the authenticated shell).
 */
export function useDocumentTitleNotifications(
  userId: string | undefined | null,
): void {
  const total = useUnreadMessagesTotal(userId);
  const originalTitleRef = useRef<string | null>(null);

  useEffect(() => {
    if (typeof document === "undefined") return;
    if (originalTitleRef.current === null) {
      originalTitleRef.current = document.title.replace(/^\(\d+\)\s*/, "");
    }
    const base = originalTitleRef.current;
    if (total > 0) {
      const counter = total > 99 ? "99+" : String(total);
      document.title = `(${counter}) ${base}`;
    } else {
      document.title = base;
    }
  }, [total]);

  useEffect(() => {
    return () => {
      if (typeof document === "undefined") return;
      if (originalTitleRef.current !== null) {
        document.title = originalTitleRef.current;
      }
    };
  }, []);
}
