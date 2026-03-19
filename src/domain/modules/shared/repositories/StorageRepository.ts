export interface StorageRepository {
  /**
   * Subir una imagen de avatar al bucket de "avatars" de Supabase
   * @param file Archivo a subir
   * @param path Ruta del archivo donde subirlo (ej: `userAuthId/filename.png`)
   * @returns La URL pública final del archivo
   */
  uploadAvatar(file: File, path: string): Promise<string>;

  /**
   * Eliminar la imagen del avatar antiguo del bucket de "avatars"
   * @param path Referencia/ruta del archivo antiguo (ej: `userAuthId/filename.png`)
   */
  deleteAvatar(path: string): Promise<void>;
}
