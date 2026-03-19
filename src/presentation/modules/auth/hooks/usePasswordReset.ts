import { useMutation } from "@tanstack/react-query";
import { SendPasswordResetEmailUseCase } from "@/application/modules/auth/use-cases/sendPasswordResetEmail";
import { SupabaseAuthRepository } from "@/infrastructure/modules/auth/repositories/SupabaseAuthRepository";

export function usePasswordReset() {
  const repository = new SupabaseAuthRepository();
  const sendPasswordResetEmailUseCase = new SendPasswordResetEmailUseCase(repository);

  return useMutation({
    mutationFn: (email: string) => sendPasswordResetEmailUseCase.execute(email),
  });
}
