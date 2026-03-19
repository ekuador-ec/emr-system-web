import { useMutation, useQueryClient } from "@tanstack/react-query";
import { UpdateUserProfileUseCase } from "@/application/modules/users/use-cases/updateUserProfile";
import type { UpdateUserProfilePayload } from "@/application/modules/users/use-cases/updateUserProfile";
import { SupabaseUserRepository } from "@/infrastructure/modules/users/repositories/SupabaseUserRepository";
import { SupabaseStorageRepository } from "@/infrastructure/modules/shared/repositories/SupabaseStorageRepository";
import type { UserProfile } from "@/domain/modules/users/models/User";

import { AUTH_QUERY_KEY } from "@/presentation/modules/auth/hooks/useAuth";

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
