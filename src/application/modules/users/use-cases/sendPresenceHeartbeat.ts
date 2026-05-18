import type { UserRepository } from "@/domain/modules/users/repositories/UserRepository";
import type { PresenceActivitySignal } from "@/domain/modules/users/models/User";

export class SendPresenceHeartbeat {
  private readonly userRepository: UserRepository;

  constructor(userRepository: UserRepository) {
    this.userRepository = userRepository;
  }

  async execute(userId: string, activitySignal: PresenceActivitySignal): Promise<void> {
    if (!userId) {
      throw new Error("El ID del usuario es requerido");
    }

    try {
      await this.userRepository.sendPresenceHeartbeat(userId, activitySignal);
    } catch {
      // Los heartbeats son best-effort: no propagamos errores transitorios
      // para evitar inundar la UI con toasts. El reaper server-side cubre
      // los huecos cuando el cliente queda sin conexion.
    }
  }
}
