import type { AuthRepository } from "@/domain/repositories/AuthRepository";
import type { UserProfile } from "@/domain/models/User";

export class LoginUser {
  private readonly authRepository: AuthRepository;

  constructor(authRepository: AuthRepository) {
    this.authRepository = authRepository;
  }

  async execute(email: string, password: string): Promise<UserProfile> {
    if (!email.trim()) {
      throw new Error("El correo electrónico es requerido");
    }
    if (!password) {
      throw new Error("La contraseña es requerida");
    }

    return this.authRepository.signIn(email.trim(), password);
  }
}
