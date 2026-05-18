import { useMutation, useQueryClient } from "@tanstack/react-query";
import { SupabaseUserRepository } from "@/infrastructure/modules/users/repositories/SupabaseUserRepository";
import { SetManualPresence } from "@/application/modules/users/use-cases/setManualPresence";
import type { ManualPresenceStatus } from "@/domain/modules/users/models/User";
import {
  deriveEffectivePresence,
  usePresenceStore,
} from "@/presentation/modules/users/stores/usePresenceStore";
import { ADMIN_USERS_QUERY_KEY } from "@/presentation/modules/users/hooks/useAdminUsers";
import { MESSAGING_QUERY_KEY } from "@/presentation/modules/messaging/hooks/useConversations";

const userRepository = new SupabaseUserRepository();
const setManualPresenceUseCase = new SetManualPresence(userRepository);

export function useSetManualPresence(userId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (manualStatus: ManualPresenceStatus) => {
      if (!userId) {
        throw new Error("Sesion no iniciada");
      }
      const previous = usePresenceStore.getState().manualStatus;
      usePresenceStore.setState({
        manualStatus,
        effectiveStatus: deriveEffectivePresence(
          manualStatus,
          usePresenceStore.getState().activitySignal,
        ),
      });
      try {
        await setManualPresenceUseCase.execute(userId, manualStatus);
      } catch (error) {
        usePresenceStore.setState({
          manualStatus: previous,
          effectiveStatus: deriveEffectivePresence(
            previous,
            usePresenceStore.getState().activitySignal,
          ),
        });
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_USERS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: MESSAGING_QUERY_KEY });
    },
  });
}
