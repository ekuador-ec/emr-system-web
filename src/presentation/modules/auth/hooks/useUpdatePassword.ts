import { useMutation } from "@tanstack/react-query";
import { UpdatePasswordUseCase } from "@/application/modules/auth/use-cases/updatePasswordUseCase";
import { SupabaseAuthRepository } from "@/infrastructure/modules/auth/repositories/SupabaseAuthRepository";

export function useUpdatePassword() {
  const repository = new SupabaseAuthRepository();
  const updatePasswordUseCase = new UpdatePasswordUseCase(repository);

  return useMutation({
    mutationFn: (newPassword: string) => updatePasswordUseCase.execute(newPassword),
  });
}
