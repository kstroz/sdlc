import type { Task } from '@/src/types';
import { fixedClock } from '@/src/platform/__mocks__/clock';
import { sequenceRandomId } from '@/src/platform/__mocks__/randomId';
import type { PhotoStore } from '@/src/platform/files/photoStore';
import {
  completeTask,
  type CompleteTaskTx,
  type Database,
  type PersistedOutboxAction,
  type PersistedPhoto,
} from './completeTask';

function makeTask(overrides: Partial<Task> = {}): Task {
  return {
    id: 't1',
    buildingId: 'b1',
    assignedToUserId: 'u1',
    title: 'Fix lock',
    description: null,
    managerNotes: null,
    priority: 'normal',
    dueAt: null,
    status: 'pending',
    blockReason: null,
    blockNote: null,
    completedAt: null,
    completedByUserId: null,
    ...overrides,
  };
}

interface FakeRecorder {
  updatedTasks: Task[];
  insertedPhotos: PersistedPhoto[];
  outbox: PersistedOutboxAction[];
  txCount: number;
  txCommitted: number;
}

function makeFakeDb(task: Task | null, opts: { failOnUpdate?: boolean } = {}): {
  db: Database;
  recorder: FakeRecorder;
} {
  const recorder: FakeRecorder = {
    updatedTasks: [],
    insertedPhotos: [],
    outbox: [],
    txCount: 0,
    txCommitted: 0,
  };
  const db: Database = {
    async getTaskById() {
      return task;
    },
    async withTransaction(work) {
      recorder.txCount += 1;
      const stagedTasks: Task[] = [];
      const stagedPhotos: PersistedPhoto[] = [];
      const stagedOutbox: PersistedOutboxAction[] = [];
      const tx: CompleteTaskTx = {
        async updateTask(t) {
          if (opts.failOnUpdate) throw new Error('db update failed');
          stagedTasks.push(t);
        },
        async insertPhoto(p) {
          stagedPhotos.push(p);
        },
        async enqueueOutbox(a) {
          stagedOutbox.push(a);
        },
      };
      const result = await work(tx);
      recorder.updatedTasks.push(...stagedTasks);
      recorder.insertedPhotos.push(...stagedPhotos);
      recorder.outbox.push(...stagedOutbox);
      recorder.txCommitted += 1;
      return result;
    },
  };
  return { db, recorder };
}

function makePhotoStore(opts: { failOnSave?: boolean } = {}): {
  store: PhotoStore;
  saved: { uri: string; id: string; localPath: string }[];
  deleted: string[];
} {
  const saved: { uri: string; id: string; localPath: string }[] = [];
  const deleted: string[] = [];
  const store: PhotoStore = {
    async save(uri, id) {
      if (opts.failOnSave) throw new Error('disk full');
      const localPath = `file:///doc/photos/${id}.jpg`;
      saved.push({ uri, id, localPath });
      return { localPath };
    },
    async delete(localPath) {
      deleted.push(localPath);
    },
  };
  return { store, saved, deleted };
}

describe('completeTask', () => {
  const completedAt = new Date('2026-05-08T12:00:00Z');
  const capturedAt = new Date('2026-05-08T11:55:00Z');

  it('happy path: updates task, inserts photo, enqueues outbox in one tx', async () => {
    const { db, recorder } = makeFakeDb(makeTask());
    const { store, saved } = makePhotoStore();
    const result = await completeTask(
      {
        taskId: 't1',
        completedByUserId: 'u9',
        photos: [{ sourceUri: 'file:///cam/1.jpg', sizeBytes: 1024, capturedAt }],
      },
      {
        db,
        photoStore: store,
        clock: fixedClock(completedAt),
        randomId: sequenceRandomId(['photo-1', 'outbox-1', 'idem-1']),
      },
    );

    expect(result.success).toBe(true);
    expect(recorder.txCount).toBe(1);
    expect(recorder.txCommitted).toBe(1);
    expect(recorder.updatedTasks).toHaveLength(1);
    expect(recorder.updatedTasks[0].status).toBe('done');
    expect(recorder.updatedTasks[0].completedAt).toEqual(completedAt);
    expect(recorder.updatedTasks[0].completedByUserId).toBe('u9');
    expect(recorder.insertedPhotos).toHaveLength(1);
    expect(recorder.insertedPhotos[0].id).toBe('photo-1');
    expect(recorder.insertedPhotos[0].localPath).toBe('file:///doc/photos/photo-1.jpg');
    expect(saved[0].uri).toBe('file:///cam/1.jpg');
    expect(recorder.outbox).toHaveLength(1);
    expect(recorder.outbox[0].actionType).toBe('complete_task');
    expect(recorder.outbox[0].payload.idempotencyKey).toBe('idem-1');
    expect(recorder.outbox[0].payload.photoIds).toEqual(['photo-1']);
    expect(recorder.outbox[0].payload.completedAt).toBe(completedAt.toISOString());
  });

  it('returns task_not_found when the task does not exist', async () => {
    const { db, recorder } = makeFakeDb(null);
    const { store } = makePhotoStore();
    const result = await completeTask(
      { taskId: 'tX', completedByUserId: 'u9', photos: [] },
      {
        db,
        photoStore: store,
        clock: fixedClock(completedAt),
        randomId: sequenceRandomId(['ignored']),
      },
    );

    expect(result.success).toBe(false);
    if (result.success) return;
    expect(result.error.kind).toBe('task_not_found');
    expect(recorder.txCount).toBe(0);
  });

  it('returns already_done error when the task is already done', async () => {
    const { db, recorder } = makeFakeDb(makeTask({ status: 'done' }));
    const { store, saved } = makePhotoStore();
    const result = await completeTask(
      { taskId: 't1', completedByUserId: 'u9', photos: [] },
      {
        db,
        photoStore: store,
        clock: fixedClock(completedAt),
        randomId: sequenceRandomId(['x']),
      },
    );
    expect(result.success).toBe(false);
    if (result.success) return;
    expect(result.error.kind).toBe('already_done');
    expect(saved).toHaveLength(0);
    expect(recorder.txCount).toBe(0);
  });

  it('photo store failure: rolls back DB (no commit) and returns photo_store_failed', async () => {
    const { db, recorder } = makeFakeDb(makeTask());
    const { store, deleted } = makePhotoStore({ failOnSave: true });
    const result = await completeTask(
      {
        taskId: 't1',
        completedByUserId: 'u9',
        photos: [{ sourceUri: 'file:///cam/1.jpg', sizeBytes: 100, capturedAt }],
      },
      {
        db,
        photoStore: store,
        clock: fixedClock(completedAt),
        randomId: sequenceRandomId(['p1', 'o1', 'i1']),
      },
    );

    expect(result.success).toBe(false);
    if (result.success) return;
    expect(result.error.kind).toBe('photo_store_failed');
    expect(recorder.txCount).toBe(0);
    expect(recorder.updatedTasks).toHaveLength(0);
    expect(recorder.insertedPhotos).toHaveLength(0);
    expect(deleted).toEqual([]);
  });

  it('rolls back saved photos when the DB transaction throws', async () => {
    const { db, recorder } = makeFakeDb(makeTask(), { failOnUpdate: true });
    const { store, saved, deleted } = makePhotoStore();

    await expect(
      completeTask(
        {
          taskId: 't1',
          completedByUserId: 'u9',
          photos: [
            { sourceUri: 'file:///cam/1.jpg', sizeBytes: 100, capturedAt },
            { sourceUri: 'file:///cam/2.jpg', sizeBytes: 200, capturedAt },
          ],
        },
        {
          db,
          photoStore: store,
          clock: fixedClock(completedAt),
          randomId: sequenceRandomId(['p1', 'p2', 'o1', 'i1']),
        },
      ),
    ).rejects.toThrow('db update failed');

    expect(saved).toHaveLength(2);
    expect(deleted).toEqual([
      'file:///doc/photos/p1.jpg',
      'file:///doc/photos/p2.jpg',
    ]);
    expect(recorder.txCommitted).toBe(0);
  });

  it('generates a fresh idempotency key per call', async () => {
    const make = async (ids: string[]) => {
      const { db, recorder } = makeFakeDb(makeTask());
      const { store } = makePhotoStore();
      await completeTask(
        { taskId: 't1', completedByUserId: 'u9', photos: [] },
        {
          db,
          photoStore: store,
          clock: fixedClock(completedAt),
          randomId: sequenceRandomId(ids),
        },
      );
      return recorder.outbox[0].payload.idempotencyKey;
    };

    const first = await make(['outbox-1', 'idem-A']);
    const second = await make(['outbox-2', 'idem-B']);
    expect(first).toBe('idem-A');
    expect(second).toBe('idem-B');
    expect(first).not.toBe(second);
  });

  it('persists multiple photos and includes all ids in the outbox payload', async () => {
    const { db, recorder } = makeFakeDb(makeTask());
    const { store } = makePhotoStore();
    const result = await completeTask(
      {
        taskId: 't1',
        completedByUserId: 'u9',
        photos: [
          { sourceUri: 'file:///cam/1.jpg', sizeBytes: 100, capturedAt },
          { sourceUri: 'file:///cam/2.jpg', sizeBytes: 200, capturedAt },
        ],
      },
      {
        db,
        photoStore: store,
        clock: fixedClock(completedAt),
        randomId: sequenceRandomId(['p1', 'p2', 'o1', 'i1']),
      },
    );

    expect(result.success).toBe(true);
    expect(recorder.insertedPhotos.map((p) => p.id)).toEqual(['p1', 'p2']);
    expect(recorder.outbox[0].payload.photoIds).toEqual(['p1', 'p2']);
  });
});
