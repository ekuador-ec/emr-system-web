import type { UserRepository } from "@/domain/modules/users/repositories/UserRepository";
import type { StorageRepository } from "@/domain/modules/shared/repositories/StorageRepository";
import type { UserProfile } from "@/domain/modules/users/models/User";

export interface UpdateUserProfilePayload {
  userId: string;
  firstName?: string;
  lastName?: string;
  phone?: string | null;
  identificationNumber?: string | null;
  medicalSpecialty?: string | null;
  professionalCode?: string | null;
  avatarFile?: File;
  previousAvatarUrl?: string | null;
  removeAvatar?: boolean;
}

export class UpdateUserProfileUseCase {
  private readonly userRepository: UserRepository;
  private readonly storageRepository: StorageRepository;

  constructor(
    userRepository: UserRepository,
    storageRepository: StorageRepository
  ) {
    this.userRepository = userRepository;
    this.storageRepository = storageRepository;
  }

  async execute(payload: UpdateUserProfilePayload): Promise<UserProfile> {
    const {
      userId,
      avatarFile,
      previousAvatarUrl,
      removeAvatar,
      ...profileData
    } = payload;

    let newAvatarUrl: string | null = undefined as unknown as null;

    if (avatarFile) {
      const fileExt = avatarFile.name.split(".").pop();
      const fileName = `${userId}/${Date.now()}.${fileExt}`;
      
      newAvatarUrl = await this.storageRepository.uploadAvatar(avatarFile, fileName);

      if (previousAvatarUrl) {
         await this.storageRepository.deleteAvatar(previousAvatarUrl);
      }
    } else if (removeAvatar) {
       newAvatarUrl = null;
       if (previousAvatarUrl) {
          await this.storageRepository.deleteAvatar(previousAvatarUrl);
       }
    }

    const finalProfileData = {
      ...profileData,
      ...(newAvatarUrl !== undefined && { avatarUrl: newAvatarUrl }),
    };

    return await this.userRepository.updateProfile(userId, finalProfileData);
  }
}
