import type { OutboxActionRow } from '@/src/platform/db/schema';
import type { SyncClient, SyncSendResult } from '@/src/use-cases/processOutbox';

export interface SyncClientConfig {
  baseUrl: string;
  authToken: string | null;
}

interface ActionRequest {
  url: string;
  method: string;
  body: unknown;
  idempotencyKey: string;
}

function readString(payload: Record<string, unknown>, key: string): string | null {
  const v = payload[key];
  return typeof v === 'string' ? v : null;
}

function buildRequest(action: OutboxActionRow, baseUrl: string): ActionRequest {
  const payload = (action.payload ?? {}) as Record<string, unknown>;
  const path = readString(payload, 'url') ?? defaultPath(action.actionType);
  const method = readString(payload, 'method') ?? 'POST';
  const body = 'body' in payload ? payload.body : payload;
  const idempotencyKey = readString(payload, 'idempotencyKey') ?? action.id;
  return { url: `${baseUrl}${path}`, method, body, idempotencyKey };
}

function defaultPath(actionType: OutboxActionRow['actionType']): string {
  switch (actionType) {
    case 'complete_task':
      return '/tasks/complete';
    case 'block_task':
      return '/tasks/block';
    case 'attach_photo':
      return '/photos';
  }
}

function buildHeaders(token: string | null, idempotencyKey: string): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Idempotency-Key': idempotencyKey,
  };
  if (token !== null) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
}

export function createSyncClient(config: SyncClientConfig): SyncClient {
  return {
    async send(action: OutboxActionRow): Promise<SyncSendResult> {
      const req = buildRequest(action, config.baseUrl);
      const res = await fetch(req.url, {
        method: req.method,
        headers: buildHeaders(config.authToken, req.idempotencyKey),
        body: JSON.stringify(req.body),
      });
      return { ok: res.ok, status: res.status };
    },
  };
}
