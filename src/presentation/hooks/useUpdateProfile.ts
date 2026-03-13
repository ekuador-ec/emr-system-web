import { useMutation, useQueryClient } from "@tanstack/react-query";
import { UpdateUserProfileUseCase } from "@/application/use-cases/updateUserProfile";
import type { UpdateUserProfilePayload } from "@/application/use-cases/updateUserProfile";
import { SupabaseUserRepository } from "@/infrastructure/repositories/SupabaseUserRepository";
import { SupabaseStorageRepository } from "@/infrastructure/repositories/SupabaseStorageRepository";
import type { UserProfile } from "@/domain/models/User";

import { AUTH_QUERY_KEY } from "@/presentation/hooks/useAuth";

const userRepository = new SupabaseUserRepository();
const storageRepository = new SupabaseStorageRepository();
const updateUserProfileUseCase = new UpdateUserProfileUseCase(userRepository, storageRepository);

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateUserProfilePayload) => {
      return updateUserProfileUseCase.execute(payload);
    },
    onSuccess: (updatedProfile: UserProfile) => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["userProfile", updatedProfile.id] });
      queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEY });
    },
  });
}
