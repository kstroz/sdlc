import { HttpEPrzegladyClient, translateToWire, CompletionPayload } from './eprzegladyClient';

describe('translateToWire', () => {
  it('maps internal Task model fields to ePrzeglądy wire shape', () => {
    const payload: CompletionPayload = {
      taskId: 'task-123',
      technicianId: 'tech-7',
      completedAt: '2026-05-08T12:34:56Z',
    };
    expect(translateToWire(payload)).toEqual({
      inspectionId: 'task-123',
      completedAt: '2026-05-08T12:34:56Z',
      technicianId: 'tech-7',
    });
  });
});

describe('HttpEPrzegladyClient.sendCompletion', () => {
  const payload: CompletionPayload = {
    taskId: 'task-1',
    technicianId: 'tech-1',
    completedAt: '2026-05-08T00:00:00Z',
  };

  function makeFakeHttp(impl: (url: string, body: unknown, config: { headers: Record<string, string> }) => Promise<{ status: number }> | { status: number } | never) {
    const calls: Array<{ url: string; body: unknown; headers: Record<string, string> }> = [];
    const fake = {
      post: jest.fn(async (url: string, body: unknown, config: { headers: Record<string, string> }) => {
        calls.push({ url, body, headers: config.headers });
        return impl(url, body, config);
      }),
    };
    return { fake, calls };
  }

  it('sends translated payload and includes Bearer auth header', async () => {
    const { fake, calls } = makeFakeHttp(() => ({ status: 202 }));
    const client = new HttpEPrzegladyClient({
      baseUrl: 'https://eprzeglady.example/api',
      authToken: 'secret-token',
      http: fake as never,
    });
    const result = await client.sendCompletion(payload);

    expect(result).toEqual({ ok: true, status: 202 });
    expect(calls).toHaveLength(1);
    expect(calls[0].url).toBe('/inspections/completions');
    expect(calls[0].body).toEqual({
      inspectionId: 'task-1',
      technicianId: 'tech-1',
      completedAt: '2026-05-08T00:00:00Z',
    });
    expect(calls[0].headers.Authorization).toBe('Bearer secret-token');
  });

  it('returns ok=false when ePrzeglądy returns 5xx', async () => {
    const { fake } = makeFakeHttp(() => {
      const err: { response: { status: number }; message: string } = {
        response: { status: 503 },
        message: 'Service Unavailable',
      };
      throw err;
    });
    const client = new HttpEPrzegladyClient({
      baseUrl: 'https://eprzeglady.example/api',
      authToken: 'secret-token',
      http: fake as never,
    });
    const result = await client.sendCompletion(payload);
    expect(result.ok).toBe(false);
    expect(result.status).toBe(503);
  });
});
