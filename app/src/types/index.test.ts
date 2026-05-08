import type {
  Building,
  OutboxAction,
  Photo,
  Task,
  User,
  Result,
} from './index';
import { err, ok } from './index';

describe('types barrel', () => {
  it('lets us construct each entity with camelCase fields', () => {
    const user: User = {
      id: 'u1',
      username: 'marek',
      displayName: 'Marek',
      sessionToken: null,
      sessionExpiresAt: null,
    };
    const building: Building = {
      id: 'b1',
      name: 'Bldg',
      streetAddress: '1 Main',
      city: 'Warsaw',
      latitude: null,
      longitude: null,
    };
    const task: Task = {
      id: 't1',
      buildingId: building.id,
      assignedToUserId: user.id,
      title: 'Fix',
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
    const photo: Photo = {
      id: 'p1',
      taskId: task.id,
      localPath: null,
      remoteUrl: null,
      syncStatus: 'pending',
      capturedAt: new Date(0),
      syncedAt: null,
      localPathCleared: false,
      sizeBytes: 0,
    };
    const action: OutboxAction = {
      id: 'o1',
      actionType: 'complete_task',
      payload: { taskId: task.id },
      status: 'pending',
      attemptCount: 0,
      lastAttemptAt: null,
      lastError: null,
      createdAt: new Date(0),
    };
    expect([user.id, building.id, task.id, photo.id, action.id]).toHaveLength(5);
  });
});

describe('Result helpers', () => {
  it('ok narrows to success variant', () => {
    const r: Result<number, string> = ok(1);
    if (r.success) {
      expect(r.value).toBe(1);
    } else {
      throw new Error('expected success');
    }
  });

  it('err narrows to failure variant', () => {
    const r: Result<number, string> = err('x');
    if (!r.success) {
      expect(r.error).toBe('x');
    } else {
      throw new Error('expected failure');
    }
  });
});
