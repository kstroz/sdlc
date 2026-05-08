// Contract test for POST /tasks/{id}/block (API-04).
// Source of truth: .pipeline/04-architecture/api-contracts.md
//
// Drives a block_task OutboxAction through the sync client and asserts the
// outbound HTTP shape. Mocks globalThis.fetch because syncClient reads fetch
// from the global.

import { createSyncClient } from '@/src/platform/http/syncClient';
import type { OutboxActionRow } from '@/src/platform/db/schema';
import { createFakeFetch } from './_fakeFetch';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

describe('contract: POST /tasks/{id}/block', () => {
  const originalFetch = globalThis.fetch;

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it('sends POST /tasks/{id}/block with Idempotency-Key (uuid) and body { reason, note?, blockedAt }', async () => {
    const fakeFetch = createFakeFetch({
      status: 200,
      body: {
        id: '88888888-8888-8888-8888-888888888888',
        status: 'blocked',
        blockReason: 'needs_parts',
      },
    });
    globalThis.fetch = fakeFetch as unknown as typeof fetch;

    const taskId = '88888888-8888-8888-8888-888888888888';
    const idempotencyKey = '77777777-7777-7777-7777-777777777777';
    const blockedAt = '2026-05-08T09:15:00.000Z';

    const action: OutboxActionRow = {
      id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
      actionType: 'block_task',
      payload: {
        url: `/tasks/${taskId}/block`,
        method: 'POST',
        idempotencyKey,
        body: {
          reason: 'needs_parts',
          note: 'Awaiting replacement gasket',
          blockedAt,
        },
      },
      status: 'pending',
      attemptCount: 0,
      lastAttemptAt: null,
      lastError: null,
      createdAt: new Date('2026-05-08T09:15:00.000Z'),
    };

    const sync = createSyncClient({
      baseUrl: 'https://api.example.com',
      authToken: 'tok-abc',
    });
    await sync.send(action);

    const call = fakeFetch.lastCall();
    expect(call.method).toBe('POST');
    expect(call.url).toBe(`https://api.example.com/tasks/${taskId}/block`);
    expect(call.headers['Content-Type']).toBe('application/json');
    expect(call.headers.Authorization).toBe('Bearer tok-abc');
    expect(call.headers['Idempotency-Key']).toBeDefined();
    expect(call.headers['Idempotency-Key']).toMatch(UUID_RE);

    const body = call.body as Record<string, unknown>;
    expect(body.reason).toBe('needs_parts');
    expect(['needs_parts', 'tenant_absent', 'needs_specialist']).toContain(body.reason);
    expect(body.blockedAt).toBe(blockedAt);
    // note is optional in the contract; when present, it must be a string.
    if (body.note !== undefined) {
      expect(typeof body.note).toBe('string');
    }
  });
});
