import type { UserRepository } from "@/domain/modules/users/repositories/UserRepository";
import type {
  AccountStatus,
  InviteUserPayload,
  ManualPresenceStatus,
  MyPresenceSnapshot,
  PresenceActivitySignal,
  PresenceEntry,
  PresenceStatus,
  UserFilters,
  UserProfile,
  UserWithPresence,
} from "@/domain/modules/users/models/User";
import { supabase } from "@/infrastructure/core/supabaseClient";
import {
  mapProfileRow,
  mapProfileWithPresenceRow,
  toPresenceStatus,
} from "@/infrastructure/modules/users/mappers/profileMapper";
import type {
  ProfileRow,
  ProfileWithPresenceRow,
} from "@/infrastructure/modules/users/mappers/profileMapper";

interface MyPresenceRow {
  user_id: string;
  manual_status: string | null;
  activity_signal: string | null;
  last_seen: string | null;
  presence_status: string | null;
}

export class SupabaseUserRepository implements UserRepository {
  async getAllUsers(): Promise<UserWithPresence[]> {
    const { data, error } = await supabase.rpc("get_all_users_admin");

    if (error) {
      throw new Error(error.message);
    }

    return (data as ProfileWithPresenceRow[]).map(mapProfileWithPresenceRow);
  }

  async getFilteredUsers(filters: UserFilters): Promise<UserWithPresence[]> {
    const params: Record<string, unknown> = {};

    if (filters.roles?.length) {
      params.filter_roles = filters.roles;
    }
    if (filters.statuses?.length) {
      params.filter_statuses = filters.statuses;
    }
    if (filters.presenceStatuses?.length) {
      params.filter_presence = filters.presenceStatuses;
    }
    if (filters.searchTerm) {
      params.search_term = filters.searchTerm;
    }
    if (filters.includeDeleted) {
      params.include_deleted = true;
    }

    const { data, error } = await supabase.rpc(
      "get_filtered_users_admin",
      params,
    );

    if (error) {
      throw new Error(error.message);
    }

    return (data as ProfileWithPresenceRow[]).map(mapProfileWithPresenceRow);
  }

  async getUserById(id: string): Promise<UserProfile> {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", id)
      .single<ProfileRow>();

    if (error || !data) {
      throw new Error("Usuario no encontrado");
    }

    return mapProfileRow(data);
  }

  async inviteUser(payload: InviteUserPayload): Promise<UserProfile> {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      throw new Error("No autenticado");
    }

    const response = await supabase.functions.invoke("invite-user", {
      body: {
        email: payload.email,
        role: payload.role,
        first_name: payload.firstName,
        last_name: payload.lastName,
        redirect_to: `${window.location.origin}/update-password`,
      },
    });

    if (response.error) {
      throw new Error(response.error.message || "Error al invitar usuario");
    }

    const profileData = response.data as { user: ProfileRow };

    return mapProfileRow(profileData.user);
  }

  async toggleUserStatus(userId: string, status: AccountStatus): Promise<void> {
    const { data, error } = await supabase.rpc("toggle_user_status", {
      target_user_id: userId,
      new_status: status,
    });

    if (error) {
      throw new Error(error.message);
    }

    const result = data as { success: boolean; error?: string };

    if (!result.success) {
      throw new Error(result.error ?? "Error al cambiar estado del usuario");
    }
  }

  async softDeleteUser(userId: string): Promise<void> {
    const { data, error } = await supabase.rpc("soft_delete_user", {
      target_user_id: userId,
    });

    if (error) {
      throw new Error(error.message);
    }

    const result = data as { success: boolean; error?: string };

    if (!result.success) {
      throw new Error(result.error ?? "Error al eliminar usuario");
    }
  }

  async restoreDeletedUser(userId: string): Promise<void> {
    const { data, error } = await supabase.rpc("restore_deleted_user", {
      target_user_id: userId,
    });

    if (error) {
      throw new Error(error.message);
    }

    const result = data as { success: boolean; error?: string };

    if (!result.success) {
      throw new Error(result.error ?? "Error al restaurar usuario");
    }
  }

  async updateProfile(userId: string, profileData: Partial<UserProfile>): Promise<UserProfile> {  
    const updatePayload: Record<string, unknown> = {};
    if (profileData.firstName !== undefined) updatePayload.first_name = profileData.firstName;
    if (profileData.lastName !== undefined) updatePayload.last_name = profileData.lastName;
    if (profileData.phone !== undefined) updatePayload.phone = profileData.phone;
    if (profileData.avatarUrl !== undefined) updatePayload.avatar_url = profileData.avatarUrl;
    if (profileData.identificationNumber !== undefined)
      updatePayload.identification_number = profileData.identificationNumber;
    if (profileData.medicalSpecialty !== undefined)
      updatePayload.medical_specialty = profileData.medicalSpecialty;
    if (profileData.professionalCode !== undefined)
      updatePayload.professional_code = profileData.professionalCode;

    const { data, error } = await supabase
      .from("profiles")
      .update(updatePayload)
      .eq("id", userId)
      .select("*")
      .single<ProfileRow>();

    if (error || !data) {
      throw new Error(error?.message || "Error al actualizar perfil");
    }

    return mapProfileRow(data);
  }

  async sendPresenceHeartbeat(
    userId: string,
    activitySignal: PresenceActivitySignal,
  ): Promise<void> {
    const { error } = await supabase.rpc("upsert_presence_heartbeat", {
      p_user_id: userId,
      p_activity_signal: activitySignal,
    });

    if (error) {
      throw new Error(error.message);
    }
  }

  async setManualPresence(
    userId: string,
    manualStatus: ManualPresenceStatus,
  ): Promise<void> {
    const { error } = await supabase.rpc("set_manual_presence", {
      p_user_id: userId,
      p_manual_status: manualStatus,
    });

    if (error) {
      throw new Error(error.message);
    }
  }

  async getMyPresence(): Promise<MyPresenceSnapshot | null> {
    const { data, error } = await supabase.rpc("get_my_presence");

    if (error) {
      throw new Error(error.message);
    }

    const rows = (data as MyPresenceRow[] | null) ?? [];
    if (rows.length === 0) return null;

    const row = rows[0];
    const manualStatus = (row.manual_status ?? "available") as ManualPresenceStatus;
    const activitySignal = (row.activity_signal ?? "active") === "idle" ? "idle" : "active";

    return {
      userId: row.user_id,
      manualStatus,
      activitySignal,
      lastSeen: row.last_seen,
      presenceStatus: toPresenceStatus(row.presence_status, "online"),
    };
  }

  subscribeToPresence(callback: (entries: PresenceEntry[]) => void): () => void {
    const channel = supabase.channel("online-users", {
      config: { presence: { key: "user_id" } },
    });

    channel
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState();
        const entries: PresenceEntry[] = Object.entries(state).map(([userId, presences]) => {
          const meta = presences[0] as { last_seen?: string; presence_status?: string } | undefined;
          const presenceStatus = toPresenceStatus(
            meta?.presence_status ?? null,
            "online",
          ) as PresenceStatus;
          return {
            userId,
            presenceStatus,
            lastSeen: meta?.last_seen ?? null,
          };
        });
        callback(entries);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }
}
