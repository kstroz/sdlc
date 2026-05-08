import type { PushPayload } from '../platform/push/pushClient';

export type Navigation =
  | { screen: 'TaskDetail'; params: { taskId: string } }
  | { screen: 'Today' };

export function handlePushTap(payload: PushPayload | null | undefined): Navigation {
  if (payload === null || payload === undefined) {
    return { screen: 'Today' };
  }
  const taskId = payload.taskId;
  if (typeof taskId === 'string' && taskId.length > 0) {
    return { screen: 'TaskDetail', params: { taskId } };
  }
  return { screen: 'Today' };
}
