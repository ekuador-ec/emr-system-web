import type {
  AccountStatus,
  InviteUserPayload,
  PresenceEntry,
  UserFilters,
  UserProfile,
  UserWithPresence,
} from "@/domain/modules/users/models/User";

/**
 * Repository interface for user management operations (admin-facing).
 * Handles CRUD, invite, status toggle, soft-delete, and presence.
 */
export interface UserRepository {

  getAllUsers(): Promise<UserWithPresence[]>;

  getFilteredUsers(filters: UserFilters): Promise<UserWithPresence[]>;

  getUserById(id: string): Promise<UserProfile>;

  inviteUser(payload: InviteUserPayload): Promise<UserProfile>;

  toggleUserStatus(userId: string, status: AccountStatus): Promise<void>;

  softDeleteUser(userId: string): Promise<void>;

  restoreDeletedUser(userId: string): Promise<void>;

  updateProfile(userId: string, data: Partial<UserProfile>): Promise<UserProfile>;

  /**
   * Subscribe to presence updates.
   * @param callback Callback function that receives presence entries.
   * @returns Unsubscribe function.
   */
  subscribeToPresence(callback: (entries: PresenceEntry[]) => void): () => void;

}
