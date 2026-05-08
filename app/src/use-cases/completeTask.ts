import type { Task, Result } from '@/src/types';
import { ok, err } from '@/src/types';
import type { Clock } from '@/src/platform/clock';
import type { RandomId } from '@/src/platform/randomId';
import type { PhotoStore } from '@/src/platform/files/photoStore';
import { markComplete } from '@/src/domain/tasks/completion';
import type { CompletionError } from '@/src/domain/tasks/completion';

export interface PhotoDraft {
  sourceUri: string;
  sizeBytes: number;
  capturedAt: Date;
}

export interface PersistedPhoto {
  id: string;
  taskId: string;
  localPath: string;
  capturedAt: Date;
  sizeBytes: number;
}

export interface PersistedOutboxAction {
  id: string;
  actionType: 'complete_task';
  payload: {
    idempotencyKey: string;
    taskId: string;
    completedAt: string;
    completedByUserId: string;
    photoIds: string[];
  };
  createdAt: Date;
}

export interface CompleteTaskTx {
  updateTask(task: Task): Promise<void>;
  insertPhoto(photo: PersistedPhoto): Promise<void>;
  enqueueOutbox(action: PersistedOutboxAction): Promise<void>;
}

export interface Database {
  withTransaction<T>(work: (tx: CompleteTaskTx) => Promise<T>): Promise<T>;
  getTaskById(taskId: string): Promise<Task | null>;
}

export type CompleteTaskError =
  | CompletionError
  | { kind: 'task_not_found'; taskId: string }
  | { kind: 'photo_store_failed'; cause: unknown };

export interface CompleteTaskInput {
  taskId: string;
  completedByUserId: string;
  photos: PhotoDraft[];
}

export interface CompleteTaskDeps {
  db: Database;
  photoStore: PhotoStore;
  clock: Clock;
  randomId: RandomId;
}

export async function completeTask(
  input: CompleteTaskInput,
  deps: CompleteTaskDeps,
): Promise<Result<{ task: Task; photoIds: string[] }, CompleteTaskError>> {
  const task = await deps.db.getTaskById(input.taskId);
  if (task === null) {
    return err({ kind: 'task_not_found', taskId: input.taskId });
  }

  const completedAt = deps.clock.now();
  const photoIds = input.photos.map(() => deps.randomId.generate());
  const completion = markComplete(task, completedAt, input.completedByUserId, photoIds);
  if (!completion.success) return err(completion.error);

  const savedOrError = await savePhotos(input, photoIds, deps.photoStore);
  if (!savedOrError.success) return err(savedOrError.error);

  const action = buildOutbox(input, completedAt, photoIds, deps.randomId);
  await commit(deps, { task: completion.value.task, saved: savedOrError.value, action });
  return ok({ task: completion.value.task, photoIds });
}

interface CommitArgs {
  task: Task;
  saved: PersistedPhoto[];
  action: PersistedOutboxAction;
}

async function savePhotos(
  input: CompleteTaskInput,
  photoIds: string[],
  store: PhotoStore,
): Promise<Result<PersistedPhoto[], CompleteTaskError>> {
  const saved: PersistedPhoto[] = [];
  try {
    for (let i = 0; i < input.photos.length; i++) {
      const d = input.photos[i];
      const { localPath } = await store.save(d.sourceUri, photoIds[i]);
      saved.push({
        id: photoIds[i],
        taskId: input.taskId,
        localPath,
        capturedAt: d.capturedAt,
        sizeBytes: d.sizeBytes,
      });
    }
    return ok(saved);
  } catch (cause) {
    await rollbackPhotos(store, saved);
    return err({ kind: 'photo_store_failed', cause });
  }
}

function buildOutbox(
  input: CompleteTaskInput,
  completedAt: Date,
  photoIds: string[],
  randomId: RandomId,
): PersistedOutboxAction {
  return {
    id: randomId.generate(),
    actionType: 'complete_task',
    payload: {
      idempotencyKey: randomId.generate(),
      taskId: input.taskId,
      completedAt: completedAt.toISOString(),
      completedByUserId: input.completedByUserId,
      photoIds,
    },
    createdAt: completedAt,
  };
}

async function commit(deps: CompleteTaskDeps, args: CommitArgs): Promise<void> {
  try {
    await deps.db.withTransaction(async (tx) => {
      await tx.updateTask(args.task);
      for (const photo of args.saved) await tx.insertPhoto(photo);
      await tx.enqueueOutbox(args.action);
    });
  } catch (cause) {
    await rollbackPhotos(deps.photoStore, args.saved);
    throw cause;
  }
}

async function rollbackPhotos(store: PhotoStore, saved: PersistedPhoto[]): Promise<void> {
  for (const photo of saved) {
    try {
      await store.delete(photo.localPath);
    } catch {
      // best-effort cleanup; surface the original error
    }
  }
}
