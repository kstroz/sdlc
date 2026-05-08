import type { Building, Task } from '@/src/types';
import {
  loadTaskDetail,
  type BuildingCache,
  type TaskCache,
} from './loadTaskDetail';

const sampleTask: Task = {
  id: 'task-1',
  buildingId: 'b-1',
  assignedToUserId: 'u-1',
  title: 'Fix sink',
  description: 'Leaking trap',
  managerNotes: 'Bring wrench',
  priority: 'normal',
  dueAt: null,
  status: 'pending',
  blockReason: null,
  blockNote: null,
  completedAt: null,
  completedByUserId: null,
};

const sampleBuilding: Building = {
  id: 'b-1',
  name: 'Maple Court',
  streetAddress: '123 Maple St',
  city: 'Springfield',
  latitude: null,
  longitude: null,
};

function makeTaskCache(map: Record<string, Task>): TaskCache {
  return {
    getById: async (id) => map[id] ?? null,
  };
}

function makeBuildingCache(map: Record<string, Building>): BuildingCache {
  return {
    getById: async (id) => map[id] ?? null,
  };
}

describe('loadTaskDetail', () => {
  it('returns task and building on cache hit', async () => {
    const result = await loadTaskDetail('task-1', {
      taskCache: makeTaskCache({ 'task-1': sampleTask }),
      buildingCache: makeBuildingCache({ 'b-1': sampleBuilding }),
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.value.task.id).toBe('task-1');
      expect(result.value.building.id).toBe('b-1');
    }
  });

  it('errors when task is missing from cache', async () => {
    const result = await loadTaskDetail('missing', {
      taskCache: makeTaskCache({}),
      buildingCache: makeBuildingCache({ 'b-1': sampleBuilding }),
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.kind).toBe('task_not_found');
    }
  });

  it('errors when building is missing from cache', async () => {
    const result = await loadTaskDetail('task-1', {
      taskCache: makeTaskCache({ 'task-1': sampleTask }),
      buildingCache: makeBuildingCache({}),
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.kind).toBe('building_not_found');
      if (result.error.kind === 'building_not_found') {
        expect(result.error.buildingId).toBe('b-1');
      }
    }
  });
});
