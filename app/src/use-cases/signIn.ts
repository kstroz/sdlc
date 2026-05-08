import { validateUsername, validatePassword } from '../domain/auth/credentials';
import type { Result } from '../types';
import { ok, err } from '../types';

export interface Session {
  userId: string;
  username: string;
  token: string;
  expiresAt: Date;
}

export type AuthResult =
  | { kind: 'ok'; session: Session }
  | { kind: 'invalid_credentials' }
  | { kind: 'network_error' };

export interface AuthClient {
  signIn(username: string, password: string): Promise<AuthResult>;
}

export interface SessionStore {
  save(session: Session): Promise<void>;
  load(): Promise<Session | null>;
  clear(): Promise<void>;
}

export type SignInError =
  | 'invalid_credentials'
  | 'network_error'
  | 'validation_failed';

export interface SignInDeps {
  authClient: AuthClient;
  sessionStore: SessionStore;
}

export async function signIn(
  username: string,
  password: string,
  deps: SignInDeps,
): Promise<Result<Session, SignInError>> {
  const u = validateUsername(username);
  if (!u.success) {
    return err('validation_failed');
  }
  const p = validatePassword(password);
  if (!p.success) {
    return err('validation_failed');
  }

  const result = await deps.authClient.signIn(u.value, p.value);
  if (result.kind === 'invalid_credentials') {
    return err('invalid_credentials');
  }
  if (result.kind === 'network_error') {
    return err('network_error');
  }

  await deps.sessionStore.save(result.session);
  return ok(result.session);
}
