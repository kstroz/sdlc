// Test helper: a Jest mock fetch that captures call arguments and replies with
// a configurable canned response. Contract tests use this to assert the SHAPE
// of outbound HTTP requests against the spec in
// .pipeline/04-architecture/api-contracts.md.

export interface CapturedCall {
  url: string;
  method: string;
  headers: Record<string, string>;
  body: unknown;
}

export interface FakeFetchResponse {
  status: number;
  body?: unknown;
}

export interface FakeFetch extends jest.Mock {
  // Returns the most recent call's parsed shape, or throws if no call was made.
  lastCall(): CapturedCall;
}

const DEFAULT_RESPONSE: FakeFetchResponse = { status: 200, body: {} };

export function createFakeFetch(response: FakeFetchResponse = DEFAULT_RESPONSE): FakeFetch {
  const mock = jest.fn(async (input: unknown, init?: unknown) => {
    return makeResponse(response);
  }) as FakeFetch;

  mock.lastCall = (): CapturedCall => {
    const calls = mock.mock.calls;
    if (calls.length === 0) {
      throw new Error('fake fetch was not called');
    }
    const [input, init] = calls[calls.length - 1] as [unknown, unknown];
    return parseCall(input, init);
  };

  return mock;
}

function parseCall(input: unknown, init: unknown): CapturedCall {
  const url = extractUrl(input);
  const initObj = (init ?? {}) as Record<string, unknown>;
  const method = typeof initObj.method === 'string' ? initObj.method.toUpperCase() : 'GET';
  const headers = normalizeHeaders(initObj.headers);
  const body = parseBody(initObj.body);
  return { url, method, headers, body };
}

function extractUrl(input: unknown): string {
  if (typeof input === 'string') return input;
  if (input instanceof URL) return input.toString();
  if (input && typeof input === 'object' && 'url' in (input as Record<string, unknown>)) {
    const u = (input as { url: unknown }).url;
    if (typeof u === 'string') return u;
  }
  return String(input);
}

function normalizeHeaders(input: unknown): Record<string, string> {
  const out: Record<string, string> = {};
  if (!input) return out;
  if (Array.isArray(input)) {
    for (const entry of input) {
      if (Array.isArray(entry) && entry.length === 2) {
        out[String(entry[0])] = String(entry[1]);
      }
    }
    return out;
  }
  if (typeof (input as { forEach?: unknown }).forEach === 'function') {
    (input as { forEach: (cb: (v: string, k: string) => void) => void }).forEach((v, k) => {
      out[k] = v;
    });
    return out;
  }
  if (typeof input === 'object') {
    for (const [k, v] of Object.entries(input as Record<string, unknown>)) {
      out[k] = String(v);
    }
  }
  return out;
}

function parseBody(body: unknown): unknown {
  if (body === undefined || body === null) return undefined;
  if (typeof body === 'string') {
    try {
      return JSON.parse(body);
    } catch {
      return body;
    }
  }
  return body;
}

function makeResponse(response: FakeFetchResponse): Response {
  const status = response.status;
  const bodyText = response.body === undefined ? '' : JSON.stringify(response.body);
  // jest-expo provides a Response global; fall back to a minimal shim if missing.
  if (typeof Response !== 'undefined') {
    return new Response(bodyText, {
      status,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  return {
    ok: status >= 200 && status < 300,
    status,
    headers: new Map(),
    json: async () => (response.body === undefined ? null : response.body),
    text: async () => bodyText,
  } as unknown as Response;
}
