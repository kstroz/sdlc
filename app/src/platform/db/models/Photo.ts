import type { PhotoRow } from '../schema';

export type Photo = PhotoRow;
export type { PhotoSyncStatus } from '../schema';

export function newPhotoRow(
  id: string,
  taskId: string,
  localPath: string,
  capturedAt: Date,
  sizeBytes: number,
): Photo {
  return {
    id,
    taskId,
    localPath,
    remoteUrl: null,
    syncStatus: 'pending',
    capturedAt: new Date(capturedAt.getTime()),
    syncedAt: null,
    localPathCleared: false,
    sizeBytes,
  };
}
