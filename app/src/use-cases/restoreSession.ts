import type { Clock } from '../platform/clock';
import type { Result } from '../types';
import { ok, err } from '../types';
import type { Session, SessionStore } from './signIn';

export type RestoreSessionError = 'expired' | 'missing';

export interface RestoreSessionDeps {
  sessionStore: SessionStore;
  clock: Clock;
}

export async function restoreSession(
  deps: RestoreSessionDeps,
): Promise<Result<Session, RestoreSessionError>> {
  const session = await deps.sessionStore.load();
  if (session === null) {
    return err('missing');
  }
  if (session.expiresAt.getTime() <= deps.clock.now().getTime()) {
    return err('expired');
  }
  return ok(session);
}
