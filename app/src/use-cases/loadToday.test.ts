import { Building, Task } from '@/src/types';
import { loadToday, LoadTodayDeps } from './loadToday';

function makeBuilding(id: string, name: string): Building {
  return {
    id,
    name,
    streetAddress: '1 Main St',
    city: 'Metropolis',
    latitude: null,
    longitude: null,
  };
}

function makeTask(id: string, buildingId: string): Task {
  return {
    id,
    buildingId,
    assignedToUserId: 'u1',
    title: `task-${id}`,
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
}

function makeDeps(overrides: Partial<LoadTodayDeps> = {}): LoadTodayDeps {
  return {
    today: '2026-05-08',
    cache: {
      read: jest.fn().mockResolvedValue(null),
      write: jest.fn().mockResolvedValue(undefined),
    },
    client: {
      getTodayTasks: jest.fn().mockResolvedValue({ buildings: [], tasks: [] }),
    },
    ...overrides,
  };
}

describe('loadToday', () => {
  it('returns cached groups when cache has data (no network call)', async () => {
    const bA = makeBuilding('bA', 'Alpha');
    const tasks = [makeTask('t1', 'bA')];
    const deps = makeDeps({
      cache: {
        read: jest.fn().mockResolvedValue({ buildings: [bA], tasks }),
        write: jest.fn(),
      },
    });

    const result = await loadToday(deps);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.value).toHaveLength(1);
      expect(result.value[0].building.id).toBe('bA');
    }
    expect(deps.client.getTodayTasks).not.toHaveBeenCalled();
  });

  it('falls back to network and writes cache on cache miss', async () => {
    const bA = makeBuilding('bA', 'Alpha');
    const tasks = [makeTask('t1', 'bA')];
    const cacheWrite = jest.fn().mockResolvedValue(undefined);
    const deps = makeDeps({
      cache: {
        read: jest.fn().mockResolvedValue(null),
        write: cacheWrite,
      },
      client: {
        getTodayTasks: jest.fn().mockResolvedValue({ buildings: [bA], tasks }),
      },
    });

    const result = await loadToday(deps);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.value).toHaveLength(1);
    }
    expect(deps.client.getTodayTasks).toHaveBeenCalledWith('2026-05-08');
    expect(cacheWrite).toHaveBeenCalledWith({ buildings: [bA], tasks });
  });

  it('returns network_error when cache empty and network fails', async () => {
    const deps = makeDeps({
      client: {
        getTodayTasks: jest.fn().mockRejectedValue(new Error('boom')),
      },
    });

    const result = await loadToday(deps);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.kind).toBe('network_error');
    }
  });
});
