import type { AuthRepository } from "@/domain/modules/auth/repositories/AuthRepository";

export class UpdatePasswordUseCase {
  repository: AuthRepository;

  constructor(repository: AuthRepository) {
    this.repository = repository;
  }

  async execute(newPassword: string): Promise<void> {
    if (!newPassword || newPassword.length < 6) {
      throw new Error("La contraseña debe tener al menos 6 caracteres");
    }

    await this.repository.updatePassword(newPassword);
  }
}
