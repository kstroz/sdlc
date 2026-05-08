import type { TaskRow } from '@/src/platform/db/schema';
import { inMemoryDatabase, type Database } from '@/src/platform/db/database';
import { fixedClock } from '@/src/platform/__mocks__/clock';
import { fixedRandomId } from '@/src/platform/__mocks__/randomId';
import { blockTaskUseCase } from './blockTask';

const FIXED_NOW = new Date('2026-05-08T10:00:00Z');

function seedTask(db: Database, overrides: Partial<TaskRow> = {}): TaskRow {
  const row: TaskRow = {
    id: 'task-1',
    buildingId: 'b-1',
    assignedToUserId: 'u-1',
    title: 'Fix sink',
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
  return row;
}

describe('blockTaskUseCase', () => {
  it('updates the task and enqueues outbox action in one transaction', async () => {
    const db = inMemoryDatabase();
    const seeded = seedTask(db);
    await db.tasks.upsert(seeded);

    const result = await blockTaskUseCase(
      { taskId: 'task-1', reason: 'needs_parts', note: 'awaiting valve' },
      {
        db,
        clock: fixedClock(FIXED_NOW),
        randomId: fixedRandomId('outbox-1'),
      },
    );

    expect(result.success).toBe(true);
    const stored = await db.tasks.findById('task-1');
    expect(stored?.status).toBe('blocked');
    expect(stored?.blockReason).toBe('needs_parts');
    expect(stored?.blockNote).toBe('awaiting valve');

    const outbox = await db.outboxActions.findById('outbox-1');
    expect(outbox).not.toBeNull();
    expect(outbox?.actionType).toBe('block_task');
    expect(outbox?.status).toBe('pending');
  });

  it('returns task_not_found when task does not exist', async () => {
    const db = inMemoryDatabase();
    const result = await blockTaskUseCase(
      { taskId: 'missing', reason: 'needs_parts' },
      {
        db,
        clock: fixedClock(FIXED_NOW),
        randomId: fixedRandomId('outbox-1'),
      },
    );
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.kind).toBe('task_not_found');
    }
  });

  it('returns domain error when task already blocked and persists nothing', async () => {
    const db = inMemoryDatabase();
    const seeded = seedTask(db, { status: 'blocked', blockReason: 'needs_parts' });
    await db.tasks.upsert(seeded);

    const result = await blockTaskUseCase(
      { taskId: 'task-1', reason: 'tenant_absent' },
      {
        db,
        clock: fixedClock(FIXED_NOW),
        randomId: fixedRandomId('outbox-1'),
      },
    );
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.kind).toBe('domain');
    }
    const outbox = await db.outboxActions.findById('outbox-1');
    expect(outbox).toBeNull();
  });

  it('rolls back task update when outbox enqueue fails inside the transaction', async () => {
    const db = inMemoryDatabase();
    const seeded = seedTask(db);
    await db.tasks.upsert(seeded);

    const failing: Database = {
      ...db,
      outboxActions: {
        findById: db.outboxActions.findById,
        findAll: db.outboxActions.findAll,
        delete: db.outboxActions.delete,
        upsert: async () => {
          throw new Error('outbox boom');
        },
      },
    };

    const result = await blockTaskUseCase(
      { taskId: 'task-1', reason: 'needs_parts' },
      {
        db: failing,
        clock: fixedClock(FIXED_NOW),
        randomId: fixedRandomId('outbox-1'),
      },
    );
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.kind).toBe('persistence_failed');
    }
    const stored = await db.tasks.findById('task-1');
    expect(stored?.status).toBe('pending');
    expect(stored?.blockReason).toBeNull();
  });
});
