import type {
  AccountStatus,
  InviteUserPayload,
  ManualPresenceStatus,
  MyPresenceSnapshot,
  PresenceActivitySignal,
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
   * Pushes a heartbeat for the given user with the current activity signal.
   * Server keeps `manual_status` untouched. Used every 30/60 seconds.
   */
  sendPresenceHeartbeat(userId: string, activitySignal: PresenceActivitySignal): Promise<void>;

  /**
   * Persists the manual presence preference chosen by the user.
   * Available across sessions and devices.
   */
  setManualPresence(userId: string, manualStatus: ManualPresenceStatus): Promise<void>;

  /**
   * Reads the current user's own presence snapshot (manual preference
   * included). Returns null when the row has not been created yet.
   */
  getMyPresence(): Promise<MyPresenceSnapshot | null>;

  /**
   * Subscribe to presence updates.
   * @param callback Callback function that receives presence entries.
   * @returns Unsubscribe function.
   */
  subscribeToPresence(callback: (entries: PresenceEntry[]) => void): () => void;

}
