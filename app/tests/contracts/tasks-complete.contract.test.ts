// Contract test for POST /tasks/{id}/complete (API-03).
// Source of truth: .pipeline/04-architecture/api-contracts.md
//
// Drives a complete_task OutboxAction through the sync client and asserts the
// outbound HTTP shape. Mocks globalThis.fetch because syncClient reads fetch
// from the global.

import { createSyncClient } from '@/src/platform/http/syncClient';
import type { OutboxActionRow } from '@/src/platform/db/schema';
import { createFakeFetch } from './_fakeFetch';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

describe('contract: POST /tasks/{id}/complete', () => {
  const originalFetch = globalThis.fetch;

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it('sends POST /tasks/{id}/complete with Idempotency-Key (uuid) and body { completedAt }', async () => {
    const fakeFetch = createFakeFetch({
      status: 200,
      body: {
        id: '99999999-9999-9999-9999-999999999999',
        status: 'done',
        completedAt: '2026-05-08T08:30:00.000Z',
        completedByUserId: '44444444-4444-4444-4444-444444444444',
      },
    });
    globalThis.fetch = fakeFetch as unknown as typeof fetch;

    const taskId = '99999999-9999-9999-9999-999999999999';
    const idempotencyKey = '55555555-5555-5555-5555-555555555555';
    const completedAt = '2026-05-08T08:30:00.000Z';

    const action: OutboxActionRow = {
      id: '66666666-6666-6666-6666-666666666666',
      actionType: 'complete_task',
      payload: {
        url: `/tasks/${taskId}/complete`,
        method: 'POST',
        idempotencyKey,
        body: { completedAt },
      },
      status: 'pending',
      attemptCount: 0,
      lastAttemptAt: null,
      lastError: null,
      createdAt: '2026-05-08T08:30:00.000Z',
    };

    const sync = createSyncClient({
      baseUrl: 'https://api.example.com',
      authToken: 'tok-abc',
    });
    await sync.send(action);

    const call = fakeFetch.lastCall();
    expect(call.method).toBe('POST');
    expect(call.url).toBe(`https://api.example.com/tasks/${taskId}/complete`);
    expect(call.headers['Content-Type']).toBe('application/json');
    expect(call.headers.Authorization).toBe('Bearer tok-abc');
    expect(call.headers['Idempotency-Key']).toBeDefined();
    expect(call.headers['Idempotency-Key']).toMatch(UUID_RE);

    expect(call.body).toEqual({ completedAt });
  });
});
