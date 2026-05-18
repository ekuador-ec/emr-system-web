import type { UserRepository } from "@/domain/modules/users/repositories/UserRepository";
import type { MyPresenceSnapshot } from "@/domain/modules/users/models/User";

export class GetMyPresence {
  private readonly userRepository: UserRepository;

  constructor(userRepository: UserRepository) {
    this.userRepository = userRepository;
  }

  async execute(): Promise<MyPresenceSnapshot | null> {
    try {
      return await this.userRepository.getMyPresence();
    } catch {
      return null;
    }
  }
}
