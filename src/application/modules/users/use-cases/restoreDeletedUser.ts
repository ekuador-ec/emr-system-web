import type { UserRepository } from "@/domain/modules/users/repositories/UserRepository";

export class RestoreDeletedUser {
  private readonly userRepository: UserRepository;

  constructor(userRepository: UserRepository) {
    this.userRepository = userRepository;
  }

  async execute(userId: string): Promise<void> {
    return this.userRepository.restoreDeletedUser(userId);
  }
}
