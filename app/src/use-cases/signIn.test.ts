import { signIn } from './signIn';
import type { AuthClient, AuthResult, Session, SessionStore } from './signIn';

function makeStore(): SessionStore & { saved: Session | null } {
  const store = {
    saved: null as Session | null,
    async save(session: Session) {
      store.saved = session;
    },
    async load() {
      return store.saved;
    },
    async clear() {
      store.saved = null;
    },
  };
  return store;
}

function makeClient(result: AuthResult): AuthClient {
  return {
    async signIn() {
      return result;
    },
  };
}

const validSession: Session = {
  userId: 'u-1',
  username: 'marek',
  token: 'tok-abc',
  expiresAt: new Date('2026-06-07T00:00:00Z'),
};

describe('signIn', () => {
  it('returns the session and persists it on a successful auth', async () => {
    const store = makeStore();
    const client = makeClient({ kind: 'ok', session: validSession });

    const result = await signIn('marek', 'hunter22', {
      authClient: client,
      sessionStore: store,
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.value).toEqual(validSession);
    }
    expect(store.saved).toEqual(validSession);
  });

  it('returns invalid_credentials when the auth client signals 401', async () => {
    const store = makeStore();
    const client = makeClient({ kind: 'invalid_credentials' });

    const result = await signIn('marek', 'hunter22', {
      authClient: client,
      sessionStore: store,
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe('invalid_credentials');
    }
    expect(store.saved).toBeNull();
  });

  it('returns network_error when the auth client signals a network failure', async () => {
    const store = makeStore();
    const client = makeClient({ kind: 'network_error' });

    const result = await signIn('marek', 'hunter22', {
      authClient: client,
      sessionStore: store,
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe('network_error');
    }
    expect(store.saved).toBeNull();
  });

  it('returns validation_failed for an empty username and never calls the client', async () => {
    const store = makeStore();
    let called = false;
    const client: AuthClient = {
      async signIn() {
        called = true;
        return { kind: 'ok', session: validSession };
      },
    };

    const result = await signIn('', 'hunter22', {
      authClient: client,
      sessionStore: store,
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe('validation_failed');
    }
    expect(called).toBe(false);
    expect(store.saved).toBeNull();
  });

  it('returns validation_failed for a too-short password', async () => {
    const store = makeStore();
    const client = makeClient({ kind: 'ok', session: validSession });

    const result = await signIn('marek', 'short', {
      authClient: client,
      sessionStore: store,
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe('validation_failed');
    }
  });
});
