import type { UserRepository } from "@/domain/modules/users/repositories/UserRepository";
import type { ManualPresenceStatus } from "@/domain/modules/users/models/User";

const VALID_STATUSES: ManualPresenceStatus[] = ["available", "busy", "invisible"];

export class SetManualPresence {
  private readonly userRepository: UserRepository;

  constructor(userRepository: UserRepository) {
    this.userRepository = userRepository;
  }

  async execute(userId: string, manualStatus: ManualPresenceStatus): Promise<void> {
    if (!userId) {
      throw new Error("El ID del usuario es requerido");
    }

    if (!VALID_STATUSES.includes(manualStatus)) {
      throw new Error("Estado manual de presencia invalido");
    }

    try {
      await this.userRepository.setManualPresence(userId, manualStatus);
    } catch {
      throw new Error("No se pudo actualizar tu estado. Intenta de nuevo.");
    }
  }
}
