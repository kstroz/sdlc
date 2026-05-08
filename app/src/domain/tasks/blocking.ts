import type { Task } from '@/src/types';
import { ok, err, type Result } from '@/src/types';

export type BlockReason = 'needs_parts' | 'tenant_absent' | 'needs_specialist';

export const BLOCK_REASONS: readonly BlockReason[] = [
  'needs_parts',
  'tenant_absent',
  'needs_specialist',
];

export const MAX_BLOCK_NOTE_LENGTH = 500;

export type BlockTaskError =
  | { kind: 'invalid_status'; status: Task['status'] }
  | { kind: 'invalid_reason'; reason: string }
  | { kind: 'note_too_long'; length: number };

export function blockTask(
  task: Task,
  reason: BlockReason,
  note: string | undefined,
  blockedAt: Date,
): Result<Task, BlockTaskError> {
  if (task.status !== 'pending') {
    return err({ kind: 'invalid_status', status: task.status });
  }
  if (!BLOCK_REASONS.includes(reason)) {
    return err({ kind: 'invalid_reason', reason: String(reason) });
  }
  if (note !== undefined && note.length > MAX_BLOCK_NOTE_LENGTH) {
    return err({ kind: 'note_too_long', length: note.length });
  }
  void blockedAt;
  return ok({
    ...task,
    status: 'blocked',
    blockReason: reason,
    blockNote: note ?? null,
  });
}
