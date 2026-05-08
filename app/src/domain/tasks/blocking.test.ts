import type { Task } from '@/src/types';
import { blockTask, BLOCK_REASONS, type BlockReason } from './blocking';

const basePending: Task = {
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
};

const blockedAt = new Date('2026-05-08T10:00:00Z');

describe('blockTask', () => {
  it.each(BLOCK_REASONS)('accepts valid reason %s', (reason) => {
    const result = blockTask(basePending, reason, undefined, blockedAt);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.value.status).toBe('blocked');
      expect(result.value.blockReason).toBe(reason);
      expect(result.value.blockNote).toBeNull();
    }
  });

  it('stores the optional note when provided', () => {
    const result = blockTask(basePending, 'needs_parts', 'awaiting valve', blockedAt);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.value.blockNote).toBe('awaiting valve');
    }
  });

  it('rejects an unknown reason', () => {
    const result = blockTask(
      basePending,
      'lazy_friday' as unknown as BlockReason,
      undefined,
      blockedAt,
    );
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.kind).toBe('invalid_reason');
    }
  });

  it('rejects a note longer than 500 chars', () => {
    const note = 'x'.repeat(501);
    const result = blockTask(basePending, 'needs_parts', note, blockedAt);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.kind).toBe('note_too_long');
    }
  });

  it('accepts a note of exactly 500 chars', () => {
    const note = 'x'.repeat(500);
    const result = blockTask(basePending, 'needs_parts', note, blockedAt);
    expect(result.success).toBe(true);
  });

  it('rejects an already-blocked task', () => {
    const blocked: Task = {
      ...basePending,
      status: 'blocked',
      blockReason: 'needs_parts',
    };
    const result = blockTask(blocked, 'tenant_absent', undefined, blockedAt);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.kind).toBe('invalid_status');
    }
  });

  it('rejects a done task', () => {
    const done: Task = { ...basePending, status: 'done' };
    const result = blockTask(done, 'needs_parts', undefined, blockedAt);
    expect(result.success).toBe(false);
  });

  it('does not mutate the original task', () => {
    const before = { ...basePending };
    blockTask(basePending, 'needs_parts', 'note', blockedAt);
    expect(basePending).toEqual(before);
  });
});
