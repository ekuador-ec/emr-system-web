import type { UserRepository } from "@/domain/repositories/UserRepository";
import type {
  AccountStatus,
  InviteUserPayload,
  PresenceEntry,
  UserProfile,
  UserWithPresence,
} from "@/domain/models/User";
import { supabase } from "@/infrastructure/config/supabaseClient";
import { mapProfileRow, mapProfileWithPresenceRow } from "@/infrastructure/mappers/profileMapper";
import type { ProfileRow, ProfileWithPresenceRow } from "@/infrastructure/mappers/profileMapper";

export class SupabaseUserRepository implements UserRepository {
  async getAllUsers(): Promise<UserWithPresence[]> {
    const { data, error } = await supabase.rpc("get_all_users_admin");

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

  subscribeToPresence(callback: (entries: PresenceEntry[]) => void): () => void {
    const channel = supabase.channel("online-users", {
      config: { presence: { key: "user_id" } },
    });

    channel
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState();
        const entries: PresenceEntry[] = Object.entries(state).map(([userId, presences]) => ({
          userId,
          isOnline: true,
          lastSeen: (presences[0] as { last_seen?: string })?.last_seen ?? null,
        }));
        callback(entries);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }
}
