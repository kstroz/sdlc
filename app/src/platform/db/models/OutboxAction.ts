import type { OutboxActionRow, OutboxActionType } from '../schema';

export type OutboxAction = OutboxActionRow;
export type { OutboxActionType, OutboxStatus } from '../schema';

export interface CompleteTaskPayload {
  idempotencyKey: string;
  taskId: string;
  completedAt: string;
  completedByUserId: string;
  photoIds: string[];
}

export function newOutboxAction(
  id: string,
  actionType: OutboxActionType,
  payload: Record<string, unknown>,
  createdAt: Date,
): OutboxAction {
  return {
    id,
    actionType,
    payload,
    status: 'pending',
    attemptCount: 0,
    lastAttemptAt: null,
    lastError: null,
    createdAt: new Date(createdAt.getTime()),
  };
}
