import type { AuthClient, AuthResult } from '../../use-cases/signIn';

export type { AuthClient } from '../../use-cases/signIn';

interface SignInResponseBody {
  userId: string;
  username: string;
  token: string;
  expiresAt: string;
}

export interface HttpAuthClientConfig {
  baseUrl: string;
}

export function createHttpAuthClient(config: HttpAuthClientConfig): AuthClient {
  return {
    async signIn(username: string, password: string): Promise<AuthResult> {
      let response: Response;
      try {
        response = await fetch(`${config.baseUrl}/auth/sign-in`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password }),
        });
      } catch {
        return { kind: 'network_error' };
      }

      if (response.status === 401) {
        return { kind: 'invalid_credentials' };
      }
      if (!response.ok) {
        return { kind: 'network_error' };
      }

      const body = (await response.json()) as SignInResponseBody;
      return {
        kind: 'ok',
        session: {
          userId: body.userId,
          username: body.username,
          token: body.token,
          expiresAt: new Date(body.expiresAt),
        },
      };
    },
  };
}
