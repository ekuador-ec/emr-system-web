import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/infrastructure/core/supabaseClient";
import { ADMIN_USERS_QUERY_KEY } from "@/presentation/modules/users/hooks/useAdminUsers";
import { MESSAGING_QUERY_KEY } from "@/presentation/modules/messaging/hooks/useConversations";

export function usePresenceSubscription(enabled = true) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!enabled) return;

    const channel = supabase
      .channel("presence-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "presence_status",
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ADMIN_USERS_QUERY_KEY });
          queryClient.invalidateQueries({ queryKey: MESSAGING_QUERY_KEY });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient, enabled]);
}
