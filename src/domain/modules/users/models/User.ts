/**
 * User roles available in the EMR system.
 * Maps 1:1 to the PostgreSQL enum `public.user_role`.
 */
export type UserRole =
  | "admin"
  | "doctor"
  | "nurse"
  | "receptionist"
  | "lab_technician"
  | "pharmacist";

/**
 * Account status for user profiles.
 * Maps 1:1 to the PostgreSQL enum `public.account_status`.
 */
export type AccountStatus = "active" | "inactive" | "suspended";

/**
 * User profile as stored in the `profiles` table.
 */
export interface UserProfile {
  id: string;
  email: string;
  role: UserRole;
  accountStatus: AccountStatus;
  firstName: string;
  lastName: string;
  phone: string | null;
  avatarUrl: string | null;
  identificationNumber: string | null;
  medicalSpecialty: string | null;
  professionalCode: string | null;
  lastSignInAt: string | null;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * Presence entry combining profile and presence_status data.
 * Used in admin panels to show online/offline status.
 */
export interface PresenceEntry {
  userId: string;
  isOnline: boolean;
  lastSeen: string | null;
}

/**
 * Full user data with presence info, as returned by get_all_users_admin RPC.
 */
export interface UserWithPresence extends UserProfile {
  isOnline: boolean;
  lastSeen: string | null;
}

/**
 * Payload required to invite/create a new user.
 */
export interface InviteUserPayload {
  email: string;
  role: UserRole;
  firstName: string;
  lastName: string;
}

/**
 * Filters accepted by the admin user listing query.
 * Empty arrays are treated as "no filter" (returns all).
 */
export interface UserFilters {
  roles?: UserRole[];
  statuses?: AccountStatus[];
  online?: "online" | "offline" | null;
  searchTerm?: string | null;
  includeDeleted?: boolean;
}

/**
 * Human-readable labels for user roles (Spanish).
 */
export const USER_ROLE_LABELS: Record<UserRole, string> = {
  admin: "Administrador",
  doctor: "Médico",
  nurse: "Enfermero/a",
  receptionist: "Recepcionista",
  lab_technician: "Técnico Lab.",
  pharmacist: "Farmacéutico/a",
};

/**
 * Human-readable labels for account statuses (Spanish).
 */
export const ACCOUNT_STATUS_LABELS: Record<AccountStatus, string> = {
  active: "Activo",
  inactive: "Inactivo",
  suspended: "Suspendido",
};
