import { useEffect, useRef } from "react";
import { useUnreadMessagesTotal } from "@/presentation/modules/messaging/hooks/useUnreadMessagesTotal";

const DECORATED_TITLE_REGEX =
  /^\(\d+\+?\)\s*(?:Nuevos?\s+mensajes?\s*[·\-]\s*)?/i;

/**
 * useDocumentTitleNotifications — prepends an unread message count
 * and a localised label to `document.title` so the user can spot
 * pending messages from the OS tab bar, similar to WhatsApp Web.
 *
 * Format:
 *   - 1 unread:  `(1) Nuevo mensaje · EMR | Gestion...`
 *   - N unread:  `(3) Nuevos mensajes · EMR | Gestion...`
 *   - 0 unread:  the original title is restored
 *
 * The hook captures the original title once on mount (stripping any
 * stale decoration so the prefix never doubles up after a re-mount).
 * The cleanup also restores the title, which protects against logout
 * leaving the tab decorated.
 */
export function useDocumentTitleNotifications(
  userId: string | undefined | null,
): void {
  const total = useUnreadMessagesTotal(userId);
  const originalTitleRef = useRef<string | null>(null);

  useEffect(() => {
    if (typeof document === "undefined") return;
    if (originalTitleRef.current === null) {
      originalTitleRef.current = document.title.replace(DECORATED_TITLE_REGEX, "");
    }
    const base = originalTitleRef.current;
    if (total > 0) {
      const counter = total > 99 ? "99+" : String(total);
      const noun = total === 1 ? "Nuevo mensaje" : "Nuevos mensajes";
      document.title = `(${counter}) ${noun} · ${base}`;
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

