import type { UserRepository } from "@/domain/repositories/UserRepository";

export class SoftDeleteUser {
  private readonly userRepository: UserRepository;

  constructor(userRepository: UserRepository) {
    this.userRepository = userRepository;
  }

  async execute(userId: string): Promise<void> {
    if (!userId) {
      throw new Error("El ID del usuario es requerido");
    }

    return this.userRepository.softDeleteUser(userId);
  }
}
