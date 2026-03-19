import type { UserRepository } from "@/domain/modules/users/repositories/UserRepository";
import type { InviteUserPayload, UserProfile } from "@/domain/modules/users/models/User";

export class InviteUser {
  private readonly userRepository: UserRepository;

  constructor(userRepository: UserRepository) {
    this.userRepository = userRepository;
  }

  async execute(payload: InviteUserPayload): Promise<UserProfile> {
    if (!payload.email.trim()) {
      throw new Error("El correo electrónico es requerido");
    }
    if (!payload.firstName.trim()) {
      throw new Error("El nombre es requerido");
    }
    if (!payload.lastName.trim()) {
      throw new Error("El apellido es requerido");
    }
    if (!payload.role) {
      throw new Error("El rol es requerido");
    }

    return this.userRepository.inviteUser({
      ...payload,
      email: payload.email.trim(),
      firstName: payload.firstName.trim(),
      lastName: payload.lastName.trim(),
    });
  }
}
