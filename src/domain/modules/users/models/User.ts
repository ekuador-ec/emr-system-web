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
 * Effective presence status that the rest of the system consumes.
 * Calculated server-side based on `manual_status`, `activity_signal`
 * and `last_seen` (see migration 53_presence_status_extended.sql).
 */
export type PresenceStatus = "online" | "away" | "busy" | "offline";

/**
 * Manual preference explicitly chosen by the user. Persists across
 * sessions and devices via `presence_status.manual_status`.
 */
export type ManualPresenceStatus = "available" | "busy" | "invisible";

/**
 * Activity signal reported by the client based on tab visibility
 * and input idle time. Drives the transition online <-> away.
 */
export type PresenceActivitySignal = "active" | "idle";

/**
 * Presence entry combining profile and presence_status data.
 * Used in admin panels to show the effective presence status.
 */
export interface PresenceEntry {
  userId: string;
  presenceStatus: PresenceStatus;
  lastSeen: string | null;
}

/**
 * Full user data with presence info, as returned by get_all_users_admin RPC.
 */
export interface UserWithPresence extends UserProfile {
  presenceStatus: PresenceStatus;
  lastSeen: string | null;
}

/**
 * The current user's own presence snapshot, including the manual
 * preference (only readable for self).
 */
export interface MyPresenceSnapshot {
  userId: string;
  presenceStatus: PresenceStatus;
  manualStatus: ManualPresenceStatus;
  activitySignal: PresenceActivitySignal;
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
  presenceStatuses?: PresenceStatus[];
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

/**
 * Human-readable labels for the effective presence status.
 */
export const PRESENCE_STATUS_LABELS: Record<PresenceStatus, string> = {
  online: "Disponible",
  away: "Ausente",
  busy: "Ocupado",
  offline: "Desconectado",
};

/**
 * Human-readable labels for the manual presence preference.
 */
export const MANUAL_PRESENCE_LABELS: Record<ManualPresenceStatus, string> = {
  available: "Disponible",
  busy: "Ocupado",
  invisible: "Aparecer desconectado",
};
