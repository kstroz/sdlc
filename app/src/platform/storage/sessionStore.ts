import type { Session, SessionStore } from '../../use-cases/signIn';

export type { SessionStore } from '../../use-cases/signIn';

const KEY = 'session';

export function createInMemorySessionStore(): SessionStore {
  const map = new Map<string, Session>();
  return {
    async save(session: Session): Promise<void> {
      map.set(KEY, session);
    },
    async load(): Promise<Session | null> {
      return map.get(KEY) ?? null;
    },
    async clear(): Promise<void> {
      map.delete(KEY);
    },
  };
}
