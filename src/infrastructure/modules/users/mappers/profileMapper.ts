/**
 * Maps a raw Supabase profiles row (snake_case) to the domain UserProfile (camelCase).
 */

import type { UserProfile, UserWithPresence } from "@/domain/modules/users/models/User";

export interface ProfileRow {
  id: string;
  email: string;
  role: string;
  account_status: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  avatar_url: string | null;
  identification_number: string | null;
  medical_specialty: string | null;
  professional_code: string | null;
  last_sign_in_at: string | null;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProfileWithPresenceRow extends ProfileRow {
  is_online: boolean;
  last_seen: string | null;
}

export function mapProfileRow(row: ProfileRow): UserProfile {
  return {
    id: row.id,
    email: row.email,
    role: row.role as UserProfile["role"],
    accountStatus: row.account_status as UserProfile["accountStatus"],
    firstName: row.first_name,
    lastName: row.last_name,
    phone: row.phone,
    avatarUrl: row.avatar_url,
    identificationNumber: row.identification_number,
    medicalSpecialty: row.medical_specialty,
    professionalCode: row.professional_code,
    lastSignInAt: row.last_sign_in_at,
    deletedAt: row.deleted_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapProfileWithPresenceRow(row: ProfileWithPresenceRow): UserWithPresence {
  return {
    ...mapProfileRow(row),
    isOnline: row.is_online,
    lastSeen: row.last_seen,
  };
}
