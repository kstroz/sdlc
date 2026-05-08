import { restoreSession } from './restoreSession';
import type { Session, SessionStore } from './signIn';
import type { Clock } from '../platform/clock';

function fixedClock(date: Date): Clock {
  return { now: () => date };
}

function storeWith(session: Session | null): SessionStore {
  return {
    async save() {
      // not used in these tests
    },
    async load() {
      return session;
    },
    async clear() {
      // not used in these tests
    },
  };
}

const baseSession: Session = {
  userId: 'u-1',
  username: 'marek',
  token: 'tok',
  expiresAt: new Date('2026-06-07T00:00:00Z'),
};

describe('restoreSession', () => {
  it('returns the session when it is still within its expiry window', async () => {
    const result = await restoreSession({
      sessionStore: storeWith(baseSession),
      clock: fixedClock(new Date('2026-05-08T00:00:00Z')),
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.value).toEqual(baseSession);
    }
  });

  it('returns expired when the clock has reached or passed the expiry', async () => {
    const result = await restoreSession({
      sessionStore: storeWith(baseSession),
      clock: fixedClock(new Date('2026-06-07T00:00:00Z')),
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe('expired');
    }
  });

  it('returns missing when no session is stored', async () => {
    const result = await restoreSession({
      sessionStore: storeWith(null),
      clock: fixedClock(new Date('2026-05-08T00:00:00Z')),
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe('missing');
    }
  });
});
