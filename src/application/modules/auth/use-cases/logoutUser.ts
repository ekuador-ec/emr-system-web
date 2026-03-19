import type { AuthRepository } from "@/domain/modules/auth/repositories/AuthRepository";

export class LogoutUser {
  private readonly authRepository: AuthRepository;

  constructor(authRepository: AuthRepository) {
    this.authRepository = authRepository;
  }

  async execute(): Promise<void> {
    return this.authRepository.signOut();
  }
}
