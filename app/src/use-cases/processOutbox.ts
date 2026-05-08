import type { Collection } from '@/src/platform/db/database';
import type { OutboxActionRow } from '@/src/platform/db/schema';
import type { Clock } from '@/src/platform/clock';

const MAX_ATTEMPTS = 5;

export interface SyncSendResult {
  ok: boolean;
  status: number;
}

export interface SyncClient {
  send(action: OutboxActionRow): Promise<SyncSendResult>;
}

export interface ProcessOutboxDeps {
  outbox: Collection<OutboxActionRow>;
  syncClient: SyncClient;
  clock: Clock;
}

export interface ProcessOutboxResult {
  succeeded: number;
  retried: number;
  permanentlyFailed: number;
}

function isProcessable(row: OutboxActionRow): boolean {
  return row.status === 'pending' || row.status === 'in_flight';
}

function fifoCompare(a: OutboxActionRow, b: OutboxActionRow): number {
  return a.createdAt.getTime() - b.createdAt.getTime();
}

async function readQueue(
  outbox: Collection<OutboxActionRow>,
): Promise<OutboxActionRow[]> {
  const all = await outbox.findAll();
  return all.filter(isProcessable).sort(fifoCompare);
}

async function handleSuccess(
  outbox: Collection<OutboxActionRow>,
  row: OutboxActionRow,
): Promise<void> {
  await outbox.delete(row.id);
}

async function handleFailure(
  outbox: Collection<OutboxActionRow>,
  row: OutboxActionRow,
  now: Date,
  errorMessage: string,
): Promise<'retried' | 'permanently_failed'> {
  const nextAttempt = row.attemptCount + 1;
  if (nextAttempt >= MAX_ATTEMPTS) {
    await outbox.upsert({
      ...row,
      status: 'failed',
      attemptCount: nextAttempt,
      lastAttemptAt: now,
      lastError: errorMessage,
    });
    return 'permanently_failed';
  }
  await outbox.upsert({
    ...row,
    status: 'pending',
    attemptCount: nextAttempt,
    lastAttemptAt: now,
    lastError: errorMessage,
  });
  return 'retried';
}

type RowOutcome = 'succeeded' | 'retried' | 'permanentlyFailed';

async function processRow(
  deps: ProcessOutboxDeps,
  row: OutboxActionRow,
): Promise<RowOutcome> {
  const now = deps.clock.now();
  try {
    const result = await deps.syncClient.send(row);
    if (result.ok) {
      await handleSuccess(deps.outbox, row);
      return 'succeeded';
    }
    return await handleFailure(deps.outbox, row, now, `http_${result.status}`)
      === 'retried' ? 'retried' : 'permanentlyFailed';
  } catch (error) {
    const message = error instanceof Error ? error.message : 'send_threw';
    return await handleFailure(deps.outbox, row, now, message) === 'retried'
      ? 'retried'
      : 'permanentlyFailed';
  }
}

export async function processOutbox(
  deps: ProcessOutboxDeps,
): Promise<ProcessOutboxResult> {
  const queue = await readQueue(deps.outbox);
  const tally = { succeeded: 0, retried: 0, permanentlyFailed: 0 };
  for (const row of queue) {
    const outcome = await processRow(deps, row);
    tally[outcome] += 1;
  }
  return tally;
}
