import type { UserProfile } from "@/domain/models/User";

/**
 * Repository interface for authentication operations.
 * Handles sign-in, sign-out, session management, and auth state changes.
 */
export interface AuthRepository {

  signIn(email: string, password: string): Promise<UserProfile>;

  signOut(): Promise<void>;

  getCurrentUser(): Promise<UserProfile | null>;

  /**
   * Subscribe to auth state changes (login/logout).
   * @returns An unsubscribe function.
   */
  onAuthStateChange(callback: (user: UserProfile | null) => void): () => void;
}
