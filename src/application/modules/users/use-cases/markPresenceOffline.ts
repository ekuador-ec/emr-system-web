import type { UserRepository } from "@/domain/modules/users/repositories/UserRepository";

export class MarkPresenceOffline {
  private readonly userRepository: UserRepository;

  constructor(userRepository: UserRepository) {
    this.userRepository = userRepository;
  }

  async execute(userId: string): Promise<void> {
    if (!userId) return;

    try {
      await this.userRepository.markPresenceOffline(userId);
    } catch {
      // Best-effort: el logout no debe bloquearse por un fallo de presencia.
      // El reaper server-side cubre el caso en menos de 4 minutos.
    }
  }
}
