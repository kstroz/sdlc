// Contract test for GET /tasks/today (API-02).
// Source of truth: .pipeline/04-architecture/api-contracts.md
//
// Mocks globalThis.fetch because tasksClient reads fetch from the global.

import { createTasksClient } from '@/src/platform/http/tasksClient';
import { createFakeFetch } from './_fakeFetch';

const SAMPLE_BUILDING = {
  id: '11111111-1111-1111-1111-111111111111',
  name: 'Mokotów 12',
  streetAddress: 'Mokotowska 12',
  city: 'Warsaw',
  latitude: 52.21,
  longitude: 21.01,
};

const SAMPLE_TASK = {
  id: '33333333-3333-3333-3333-333333333333',
  buildingId: SAMPLE_BUILDING.id,
  assignedToUserId: '44444444-4444-4444-4444-444444444444',
  title: 'Replace bulb',
  description: null,
  managerNotes: null,
  priority: 'normal',
  dueAt: null,
  status: 'pending',
  blockReason: null,
  blockNote: null,
  completedAt: null,
  completedByUserId: null,
};

describe('contract: GET /tasks/today', () => {
  const originalFetch = globalThis.fetch;

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it('sends GET /tasks/today with optional ?date=YYYY-MM-DD and Authorization: Bearer <token>', async () => {
    const fakeFetch = createFakeFetch({
      status: 200,
      body: { buildings: [SAMPLE_BUILDING], tasks: [SAMPLE_TASK] },
    });
    globalThis.fetch = fakeFetch as unknown as typeof fetch;

    const client = createTasksClient({
      baseUrl: 'https://api.example.com',
      authToken: 'tok-abc',
    });
    await client.getTodayTasks('2026-05-08');

    const call = fakeFetch.lastCall();
    expect(call.method).toBe('GET');
    expect(call.url).toMatch(/^https:\/\/api\.example\.com\/tasks\/today(\?date=2026-05-08)?$/);
    expect(call.url).toContain('date=2026-05-08');
    expect(call.headers.Authorization).toBe('Bearer tok-abc');
    expect(call.body).toBeUndefined();
  });

  it('unmarshalls response into typed Building and Task arrays', async () => {
    const fakeFetch = createFakeFetch({
      status: 200,
      body: { buildings: [SAMPLE_BUILDING], tasks: [SAMPLE_TASK] },
    });
    globalThis.fetch = fakeFetch as unknown as typeof fetch;

    const client = createTasksClient({
      baseUrl: 'https://api.example.com',
      authToken: 'tok-abc',
    });
    const payload = await client.getTodayTasks('2026-05-08');

    expect(Array.isArray(payload.buildings)).toBe(true);
    expect(Array.isArray(payload.tasks)).toBe(true);

    expect(payload.buildings[0]).toMatchObject({
      id: SAMPLE_BUILDING.id,
      name: SAMPLE_BUILDING.name,
      streetAddress: SAMPLE_BUILDING.streetAddress,
      city: SAMPLE_BUILDING.city,
      latitude: SAMPLE_BUILDING.latitude,
      longitude: SAMPLE_BUILDING.longitude,
    });

    const task = payload.tasks[0];
    expect(task.id).toBe(SAMPLE_TASK.id);
    expect(task.title).toBe(SAMPLE_TASK.title);
    expect(task.priority).toBe('normal');
    expect(task.status).toBe('pending');
    // dueAt unmarshalls to Date | null per the typed Task contract.
    expect(task.dueAt).toBeNull();
    expect(task.completedAt).toBeNull();
  });
});
