import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/infrastructure/config/supabaseClient";
import { ADMIN_USERS_QUERY_KEY } from "@/presentation/hooks/useAdminUsers";

export function usePresenceSubscription() {
  const queryClient = useQueryClient();

  useEffect(() => {
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
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);
}
