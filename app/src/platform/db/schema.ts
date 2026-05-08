export type TaskPriority = 'normal' | 'urgent';
export type TaskStatus = 'pending' | 'done' | 'blocked';
export type BlockReason = 'needs_parts' | 'tenant_absent' | 'needs_specialist';
export type PhotoSyncStatus = 'pending' | 'uploading' | 'synced' | 'failed';
export type OutboxActionType = 'complete_task' | 'attach_photo' | 'block_task';
export type OutboxStatus = 'pending' | 'in_flight' | 'succeeded' | 'failed';

export interface UserRow {
  id: string;
  username: string;
  displayName: string;
  sessionToken: string | null;
  sessionExpiresAt: Date | null;
}

export interface BuildingRow {
  id: string;
  name: string;
  streetAddress: string;
  city: string;
  latitude: number | null;
  longitude: number | null;
}

export interface TaskRow {
  id: string;
  buildingId: string;
  assignedToUserId: string;
  title: string;
  description: string | null;
  managerNotes: string | null;
  priority: TaskPriority;
  dueAt: Date | null;
  status: TaskStatus;
  blockReason: BlockReason | null;
  blockNote: string | null;
  completedAt: Date | null;
  completedByUserId: string | null;
}

export interface PhotoRow {
  id: string;
  taskId: string;
  localPath: string | null;
  remoteUrl: string | null;
  syncStatus: PhotoSyncStatus;
  capturedAt: Date;
  syncedAt: Date | null;
  localPathCleared: boolean;
  sizeBytes: number;
}

export interface OutboxActionRow {
  id: string;
  actionType: OutboxActionType;
  payload: unknown;
  status: OutboxStatus;
  attemptCount: number;
  lastAttemptAt: Date | null;
  lastError: string | null;
  createdAt: Date;
}
