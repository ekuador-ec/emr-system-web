import type { AuthRepository } from "@/domain/repositories/AuthRepository";

export class SendPasswordResetEmailUseCase {
  repository: AuthRepository;

  constructor(repository: AuthRepository) {
    this.repository = repository;
  }

  async execute(email: string): Promise<void> {
    if (!email) {
      throw new Error("El correo electrónico es requerido");
    }

    await this.repository.sendPasswordResetEmail(email);
  }
}
