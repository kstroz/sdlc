import type { Task, OutboxAction } from '@/src/types';
import { ok, err, type Result } from '@/src/types';
import {
  blockTask as blockTaskDomain,
  type BlockReason,
  type BlockTaskError,
} from '@/src/domain/tasks/blocking';
import type { Database } from '@/src/platform/db/database';
import type { Clock } from '@/src/platform/clock';
import type { RandomId } from '@/src/platform/randomId';

export interface BlockTaskInput {
  taskId: string;
  reason: BlockReason;
  note?: string;
}

export type BlockTaskUseCaseError =
  | { kind: 'task_not_found'; taskId: string }
  | { kind: 'domain'; error: BlockTaskError }
  | { kind: 'persistence_failed'; cause: unknown };

export interface BlockTaskDeps {
  db: Database;
  clock: Clock;
  randomId: RandomId;
}

export async function blockTaskUseCase(
  input: BlockTaskInput,
  deps: BlockTaskDeps,
): Promise<Result<{ task: Task; outboxAction: OutboxAction }, BlockTaskUseCaseError>> {
  const existing = await deps.db.tasks.findById(input.taskId);
  if (existing === null) {
    return err({ kind: 'task_not_found', taskId: input.taskId });
  }
  const blockedAt = deps.clock.now();
  const domainResult = blockTaskDomain(existing, input.reason, input.note, blockedAt);
  if (!domainResult.success) {
    return err({ kind: 'domain', error: domainResult.error });
  }
  const updated = domainResult.value;
  const outboxAction: OutboxAction = {
    id: deps.randomId.generate(),
    actionType: 'block_task',
    payload: {
      taskId: updated.id,
      reason: updated.blockReason,
      note: updated.blockNote,
      blockedAt: blockedAt.toISOString(),
    },
    status: 'pending',
    attemptCount: 0,
    lastAttemptAt: null,
    lastError: null,
    createdAt: blockedAt,
  };

  try {
    await deps.db.inTransaction(async () => {
      await deps.db.tasks.upsert(updated);
      await deps.db.outboxActions.upsert(outboxAction);
    });
  } catch (cause) {
    return err({ kind: 'persistence_failed', cause });
  }
  return ok({ task: updated, outboxAction });
}
