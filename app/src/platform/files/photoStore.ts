export interface PhotoStore {
  save(uri: string, photoId: string): Promise<{ localPath: string }>;
  delete(localPath: string): Promise<void>;
}

export interface FileSystemAdapter {
  documentDirectory: string | null;
  getInfoAsync(uri: string): Promise<{ exists: boolean }>;
  makeDirectoryAsync(uri: string, options?: { intermediates?: boolean }): Promise<void>;
  copyAsync(options: { from: string; to: string }): Promise<void>;
  deleteAsync(uri: string, options?: { idempotent?: boolean }): Promise<void>;
}

export interface PhotoStoreConfig {
  fs: FileSystemAdapter;
  subdir?: string;
}

export function createPhotoStore(config: PhotoStoreConfig): PhotoStore {
  const subdir = config.subdir ?? 'photos';
  const fs = config.fs;

  return {
    async save(uri, photoId) {
      const root = fs.documentDirectory;
      if (root === null) {
        throw new Error('photoStore: documentDirectory is unavailable');
      }
      const dir = `${root}${subdir}/`;
      const dirInfo = await fs.getInfoAsync(dir);
      if (!dirInfo.exists) {
        await fs.makeDirectoryAsync(dir, { intermediates: true });
      }
      const localPath = `${dir}${photoId}.jpg`;
      await fs.copyAsync({ from: uri, to: localPath });
      return { localPath };
    },
    async delete(localPath) {
      await fs.deleteAsync(localPath, { idempotent: true });
    },
  };
}
