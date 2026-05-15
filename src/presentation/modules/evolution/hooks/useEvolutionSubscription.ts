import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/infrastructure/core/supabaseClient";
import { evolutionKeys } from "@/presentation/modules/evolution/hooks/useEvolutions";

export function useEvolutionSubscription() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel("medical_evolutions_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "medical_evolutions",
        },
        () => {
          queryClient.invalidateQueries({ queryKey: evolutionKeys.lists() });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);
}
