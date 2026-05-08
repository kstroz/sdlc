// Contract test for POST /auth/sign-in (API-01).
// Source of truth: .pipeline/04-architecture/api-contracts.md
//
// Asserts the mobile client emits a request that matches the declared shape.
// Mocks globalThis.fetch because the http client reads fetch from the global.

import { createHttpAuthClient } from '@/src/platform/http/authClient';
import { createFakeFetch } from './_fakeFetch';

describe('contract: POST /auth/sign-in', () => {
  const originalFetch = globalThis.fetch;

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it('sends POST /auth/sign-in with JSON Content-Type and { username, password } body', async () => {
    const fakeFetch = createFakeFetch({
      status: 200,
      body: {
        userId: '11111111-1111-1111-1111-111111111111',
        displayName: 'Anna Janitor',
        sessionToken: 'tok-abc',
        expiresAt: '2026-05-09T12:00:00.000Z',
      },
    });
    globalThis.fetch = fakeFetch as unknown as typeof fetch;

    const client = createHttpAuthClient({ baseUrl: 'https://api.example.com' });
    await client.signIn('anna', 'hunter2hunter');

    const call = fakeFetch.lastCall();
    expect(call.url).toBe('https://api.example.com/auth/sign-in');
    expect(call.method).toBe('POST');
    expect(call.headers['Content-Type']).toBe('application/json');
    expect(call.body).toEqual({ username: 'anna', password: 'hunter2hunter' });
  });

  it('returns ok with session unmarshalled from { userId, displayName, sessionToken, expiresAt } on 200', async () => {
    const expiresAt = '2026-05-09T12:00:00.000Z';
    const fakeFetch = createFakeFetch({
      status: 200,
      body: {
        userId: '22222222-2222-2222-2222-222222222222',
        displayName: 'Anna Janitor',
        sessionToken: 'tok-xyz',
        expiresAt,
      },
    });
    globalThis.fetch = fakeFetch as unknown as typeof fetch;

    const client = createHttpAuthClient({ baseUrl: 'https://api.example.com' });
    const result = await client.signIn('anna', 'hunter2hunter');

    expect(result.kind).toBe('ok');
    if (result.kind !== 'ok') return;
    expect(result.session.userId).toBe('22222222-2222-2222-2222-222222222222');
    expect(typeof result.session.token).toBe('string');
    expect(result.session.expiresAt).toBeInstanceOf(Date);
    expect(result.session.expiresAt.toISOString()).toBe(expiresAt);
  });
});
