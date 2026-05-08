import type { Task, Result } from '@/src/types';
import { ok, err } from '@/src/types';

export type CompletionError =
  | { kind: 'already_done'; taskId: string }
  | { kind: 'not_pending'; taskId: string; status: Task['status'] };

export interface CompletionResult {
  task: Task;
  photoIds: string[];
}

export function markComplete(
  task: Task,
  completedAt: Date,
  completedByUserId: string,
  photoIds: string[],
): Result<CompletionResult, CompletionError> {
  if (task.status === 'done') {
    return err({ kind: 'already_done', taskId: task.id });
  }
  if (task.status !== 'pending') {
    return err({ kind: 'not_pending', taskId: task.id, status: task.status });
  }
  const completed: Task = {
    ...task,
    status: 'done',
    completedAt: new Date(completedAt.getTime()),
    completedByUserId,
  };
  return ok({ task: completed, photoIds: photoIds.slice() });
}
