import type { PushClient, PushPayload, RegisterResult } from './pushClient';
import { createExpoPushClient } from './pushClient';

function makeFakePushClient(result: RegisterResult): PushClient & {
  emit: (payload: PushPayload) => void;
  listenerCount: () => number;
} {
  const listeners = new Set<(p: PushPayload) => void>();
  return {
    async register() {
      return result;
    },
    onNotificationTap(cb) {
      listeners.add(cb);
      return () => {
        listeners.delete(cb);
      };
    },
    emit(payload) {
      for (const cb of listeners) {
        cb(payload);
      }
    },
    listenerCount() {
      return listeners.size;
    },
  };
}

describe('PushClient interface (fake)', () => {
  it('returns a token from register on success', async () => {
    const fake = makeFakePushClient({ token: 'tok-1' });
    const result = await fake.register();
    expect(result).toEqual({ token: 'tok-1' });
  });

  it('returns permission_denied when the OS denies', async () => {
    const fake = makeFakePushClient({ reason: 'permission_denied' });
    const result = await fake.register();
    expect(result).toEqual({ reason: 'permission_denied' });
  });

  it('returns unsupported when push is unavailable', async () => {
    const fake = makeFakePushClient({ reason: 'unsupported' });
    const result = await fake.register();
    expect(result).toEqual({ reason: 'unsupported' });
  });

  it('delivers tapped payloads to subscribers and unsubscribes cleanly', () => {
    const fake = makeFakePushClient({ token: 'tok-2' });
    const received: PushPayload[] = [];
    const unsubscribe = fake.onNotificationTap((p) => received.push(p));

    fake.emit({ taskId: 'task-1' });
    fake.emit({ taskId: 'task-2' });
    expect(received).toEqual([{ taskId: 'task-1' }, { taskId: 'task-2' }]);

    unsubscribe();
    fake.emit({ taskId: 'task-3' });
    expect(received).toHaveLength(2);
    expect(fake.listenerCount()).toBe(0);
  });
});

describe('createExpoPushClient (stub)', () => {
  it('reports unsupported until expo-notifications is wired in', async () => {
    const client = createExpoPushClient();
    const result = await client.register();
    expect(result).toEqual({ reason: 'unsupported' });
  });

  it('returns a no-op subscription that can be invoked safely', () => {
    const client = createExpoPushClient();
    const unsubscribe = client.onNotificationTap(() => {
      throw new Error('should not fire from the stub');
    });
    expect(() => unsubscribe()).not.toThrow();
  });
});
