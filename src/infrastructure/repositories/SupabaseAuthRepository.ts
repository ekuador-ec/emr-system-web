import type { AuthRepository } from "@/domain/repositories/AuthRepository";
import type { UserProfile } from "@/domain/models/User";
import { supabase } from "@/infrastructure/config/supabaseClient";
import { mapProfileRow } from "@/infrastructure/mappers/profileMapper";
import type { ProfileRow } from "@/infrastructure/mappers/profileMapper";

export class SupabaseAuthRepository implements AuthRepository {
  async signIn(email: string, password: string): Promise<UserProfile> {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw new Error(error.message);
    }

    if (!data.user) {
      throw new Error("No se pudo autenticar al usuario");
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", data.user.id)
      .is("deleted_at", null)
      .single<ProfileRow>();

    if (profileError) {
      console.error("Error al obtener perfil:", profileError);
      throw new Error(
        "No se encontró el perfil de usuario. Verifica que el perfil exista en la tabla profiles.",
      );
    }

    if (!profile) {
      throw new Error("Perfil de usuario no encontrado");
    }

    if (profile.account_status !== "active") {
      await supabase.auth.signOut();
      throw new Error("Tu cuenta está desactivada. Contacta al administrador.");
    }

    return mapProfileRow(profile);
  }

  async signOut(): Promise<void> {
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw new Error(error.message);
    }
  }

  async getCurrentUser(): Promise<UserProfile | null> {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.user) {
      return null;
    }

    const { data: profile, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", session.user.id)
      .is("deleted_at", null)
      .single<ProfileRow>();

    if (error || !profile) {
      return null;
    }

    if (profile.account_status !== "active") {
      await supabase.auth.signOut();
      return null;
    }

    return mapProfileRow(profile);
  }

  onAuthStateChange(callback: (user: UserProfile | null) => void): () => void {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") {
        callback(null);
      }
    });

    return () => subscription.unsubscribe();
  }

  async sendPasswordResetEmail(email: string): Promise<void> {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/update-password`,
    });

    if (error) {
      throw new Error(error.message);
    }
  }

  async updatePassword(newPassword: string): Promise<void> {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      throw new Error(error.message);
    }
  }
}
