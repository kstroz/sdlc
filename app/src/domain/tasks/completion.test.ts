import type { Task } from '@/src/types';
import { markComplete } from './completion';

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

describe('markComplete', () => {
  const completedAt = new Date('2026-05-08T12:00:00Z');

  it('returns a done task with timestamp and user when input is pending', () => {
    const task = makeTask({ status: 'pending' });
    const result = markComplete(task, completedAt, 'u9', ['p1', 'p2']);

    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.value.task.status).toBe('done');
    expect(result.value.task.completedAt).toEqual(completedAt);
    expect(result.value.task.completedByUserId).toBe('u9');
    expect(result.value.photoIds).toEqual(['p1', 'p2']);
  });

  it('does not mutate the input task', () => {
    const task = makeTask({ status: 'pending' });
    markComplete(task, completedAt, 'u9', []);
    expect(task.status).toBe('pending');
    expect(task.completedAt).toBeNull();
    expect(task.completedByUserId).toBeNull();
  });

  it('clones the photoIds array', () => {
    const task = makeTask({ status: 'pending' });
    const photoIds = ['p1'];
    const result = markComplete(task, completedAt, 'u9', photoIds);
    if (!result.success) throw new Error('expected success');
    photoIds.push('p2');
    expect(result.value.photoIds).toEqual(['p1']);
  });

  it('clones the completedAt date', () => {
    const task = makeTask({ status: 'pending' });
    const ts = new Date('2026-05-08T12:00:00Z');
    const result = markComplete(task, ts, 'u9', []);
    if (!result.success) throw new Error('expected success');
    ts.setFullYear(2000);
    expect(result.value.task.completedAt?.getUTCFullYear()).toBe(2026);
  });

  it('rejects a task already in done status', () => {
    const task = makeTask({
      status: 'done',
      completedAt: new Date('2026-05-07T10:00:00Z'),
      completedByUserId: 'u1',
    });
    const result = markComplete(task, completedAt, 'u9', []);

    expect(result.success).toBe(false);
    if (result.success) return;
    expect(result.error.kind).toBe('already_done');
    if (result.error.kind === 'already_done') {
      expect(result.error.taskId).toBe('t1');
    }
  });

  it('rejects a blocked task', () => {
    const task = makeTask({ status: 'blocked', blockReason: 'needs_parts' });
    const result = markComplete(task, completedAt, 'u9', []);

    expect(result.success).toBe(false);
    if (result.success) return;
    expect(result.error.kind).toBe('not_pending');
    if (result.error.kind === 'not_pending') {
      expect(result.error.status).toBe('blocked');
    }
  });

  it('accepts an empty photoIds array', () => {
    const task = makeTask({ status: 'pending' });
    const result = markComplete(task, completedAt, 'u9', []);
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.value.photoIds).toEqual([]);
  });
});
