import type { OutboxActionRow } from '@/src/platform/db/schema';
import { inMemoryDatabase } from '@/src/platform/db/database';
import { processOutbox, type SyncClient, type SyncSendResult } from './processOutbox';

function makeAction(
  id: string,
  createdAtMs: number,
  overrides: Partial<OutboxActionRow> = {},
): OutboxActionRow {
  return {
    id,
    actionType: 'complete_task',
    payload: { taskId: id },
    status: 'pending',
    attemptCount: 0,
    lastAttemptAt: null,
    lastError: null,
    createdAt: new Date(createdAtMs),
    ...overrides,
  };
}

const fixedClock = { now: () => new Date(2_000_000_000_000) };

function syncClientReturning(results: SyncSendResult[]): SyncClient & { calls: string[] } {
  const calls: string[] = [];
  let i = 0;
  return {
    calls,
    async send(action) {
      calls.push(action.id);
      const result = results[i] ?? { ok: true, status: 200 };
      i += 1;
      return result;
    },
  };
}

async function seed(db: ReturnType<typeof inMemoryDatabase>, rows: OutboxActionRow[]): Promise<void> {
  for (const r of rows) {
    await db.outboxActions.upsert(r);
  }
}

describe('processOutbox', () => {
  it('removes 3 successful items in FIFO order', async () => {
    const db = inMemoryDatabase();
    await seed(db, [
      makeAction('a', 3000),
      makeAction('b', 1000),
      makeAction('c', 2000),
    ]);
    const client = syncClientReturning([
      { ok: true, status: 200 },
      { ok: true, status: 200 },
      { ok: true, status: 200 },
    ]);

    const tally = await processOutbox({ outbox: db.outboxActions, syncClient: client, clock: fixedClock });

    expect(client.calls).toEqual(['b', 'c', 'a']);
    expect(tally.succeeded).toBe(3);
    expect(await db.outboxActions.findAll()).toEqual([]);
  });

  it('retries a failed action by incrementing attemptCount and keeping it pending', async () => {
    const db = inMemoryDatabase();
    await seed(db, [makeAction('x', 1000)]);
    const failOnce = syncClientReturning([{ ok: false, status: 500 }]);

    const tally1 = await processOutbox({ outbox: db.outboxActions, syncClient: failOnce, clock: fixedClock });

    expect(tally1.retried).toBe(1);
    const after1 = await db.outboxActions.findById('x');
    expect(after1?.status).toBe('pending');
    expect(after1?.attemptCount).toBe(1);
    expect(after1?.lastError).toBe('http_500');

    const succeed = syncClientReturning([{ ok: true, status: 200 }]);
    const tally2 = await processOutbox({ outbox: db.outboxActions, syncClient: succeed, clock: fixedClock });

    expect(tally2.succeeded).toBe(1);
    expect(await db.outboxActions.findById('x')).toBeNull();
  });

  it('marks permanently failed after 5 attempts', async () => {
    const db = inMemoryDatabase();
    await seed(db, [makeAction('p', 1000, { attemptCount: 4 })]);
    const client = syncClientReturning([{ ok: false, status: 500 }]);

    const tally = await processOutbox({ outbox: db.outboxActions, syncClient: client, clock: fixedClock });

    expect(tally.permanentlyFailed).toBe(1);
    const row = await db.outboxActions.findById('p');
    expect(row?.status).toBe('failed');
    expect(row?.attemptCount).toBe(5);
  });

  it('preserves FIFO order regardless of insertion order', async () => {
    const db = inMemoryDatabase();
    await seed(db, [
      makeAction('late', 5000),
      makeAction('mid', 3000),
      makeAction('early', 1000),
    ]);
    const client = syncClientReturning([
      { ok: true, status: 200 },
      { ok: true, status: 200 },
      { ok: true, status: 200 },
    ]);

    await processOutbox({ outbox: db.outboxActions, syncClient: client, clock: fixedClock });

    expect(client.calls).toEqual(['early', 'mid', 'late']);
  });

  it('treats thrown send errors as failures', async () => {
    const db = inMemoryDatabase();
    await seed(db, [makeAction('boom', 1000)]);
    const client: SyncClient = {
      send: async () => {
        throw new Error('network down');
      },
    };

    const tally = await processOutbox({ outbox: db.outboxActions, syncClient: client, clock: fixedClock });

    expect(tally.retried).toBe(1);
    const row = await db.outboxActions.findById('boom');
    expect(row?.attemptCount).toBe(1);
    expect(row?.lastError).toBe('network down');
  });

  it('processes in_flight rows alongside pending rows', async () => {
    const db = inMemoryDatabase();
    await seed(db, [
      makeAction('in', 1000, { status: 'in_flight' }),
      makeAction('pen', 2000, { status: 'pending' }),
    ]);
    const client = syncClientReturning([
      { ok: true, status: 200 },
      { ok: true, status: 200 },
    ]);

    await processOutbox({ outbox: db.outboxActions, syncClient: client, clock: fixedClock });

    expect(client.calls).toEqual(['in', 'pen']);
    expect(await db.outboxActions.findAll()).toEqual([]);
  });
});
