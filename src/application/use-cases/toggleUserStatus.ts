import type { UserRepository } from "@/domain/repositories/UserRepository";
import type { AccountStatus } from "@/domain/models/User";

export class ToggleUserStatus {
  private readonly userRepository: UserRepository;

  constructor(userRepository: UserRepository) {
    this.userRepository = userRepository;
  }

  async execute(userId: string, newStatus: AccountStatus): Promise<void> {
    if (!userId) {
      throw new Error("El ID del usuario es requerido");
    }

    return this.userRepository.toggleUserStatus(userId, newStatus);
  }
}
