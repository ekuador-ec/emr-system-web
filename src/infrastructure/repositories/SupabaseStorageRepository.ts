import type { StorageRepository } from "@/domain/repositories/StorageRepository";
import { supabase } from "@/infrastructure/config/supabaseClient";

const AVATAR_BUCKET = "avatars";

export class SupabaseStorageRepository implements StorageRepository {
  async uploadAvatar(file: File, path: string): Promise<string> {
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(AVATAR_BUCKET)
      .upload(path, file, {
        cacheControl: "3600",
        upsert: true,
      });

    if (uploadError) {
      throw new Error(`Error subiendo la imagen al storage: ${uploadError.message}`);
    }

    const { data } = supabase.storage.from(AVATAR_BUCKET).getPublicUrl(uploadData.path);

    if (!data || !data.publicUrl) {
      throw new Error("No se pudo obtener la URL pública del avatar.");
    }

    return data.publicUrl;
  }

  async deleteAvatar(path: string): Promise<void> {
    const decodedPath = decodeURIComponent(path);
    let relativePath = decodedPath;

    if (decodedPath.includes(`/storage/v1/object/public/${AVATAR_BUCKET}/`)) {
      relativePath = decodedPath.split(`/storage/v1/object/public/${AVATAR_BUCKET}/`)[1];
    } else if (decodedPath.includes(`/storage/v1/object/sign/${AVATAR_BUCKET}/`)) {
        relativePath = decodedPath.split(`/storage/v1/object/sign/${AVATAR_BUCKET}/`)[1];
    }

    if (!relativePath) {
      return;
    }

    const { error } = await supabase.storage.from(AVATAR_BUCKET).remove([relativePath]);

    if (error) {
       console.error(`Ocurrió un error (no fatal) al eliminar la imagen anterior: ${error.message}`);
    }
  }
}
