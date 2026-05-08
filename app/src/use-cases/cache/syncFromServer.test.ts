import { inMemoryDatabase } from '@/src/platform/db/database';
import type { BuildingRow, TaskRow } from '@/src/platform/db/schema';
import { syncFromServer, type TasksClient, type TodayPullResult } from './syncFromServer';

function makeBuilding(id: string, name = 'Alpha'): BuildingRow {
  return {
    id,
    name,
    streetAddress: '1 Main St',
    city: 'Metropolis',
    latitude: null,
    longitude: null,
  };
}

function makeTask(
  id: string,
  buildingId: string,
  status: TaskRow['status'] = 'pending',
  title = `task-${id}`,
): TaskRow {
  return {
    id,
    buildingId,
    assignedToUserId: 'u1',
    title,
    description: null,
    managerNotes: null,
    priority: 'normal',
    dueAt: null,
    status,
    blockReason: null,
    blockNote: null,
    completedAt: null,
    completedByUserId: null,
  };
}

function stubClient(result: TodayPullResult): TasksClient {
  return { pullToday: async () => result };
}

describe('syncFromServer', () => {
  it('handles an empty server pull as a no-op', async () => {
    const db = inMemoryDatabase();
    const stats = await syncFromServer({
      db,
      client: stubClient({ buildings: [], tasks: [] }),
    });
    expect(stats).toEqual({ buildingsUpserted: 0, tasksUpserted: 0, tasksSkipped: 0 });
    expect(await db.buildings.findAll()).toEqual([]);
    expect(await db.tasks.findAll()).toEqual([]);
  });

  it('inserts new buildings and tasks on first sync', async () => {
    const db = inMemoryDatabase();
    const buildings = [makeBuilding('b1'), makeBuilding('b2', 'Beta')];
    const tasks = [makeTask('t1', 'b1'), makeTask('t2', 'b2')];

    const stats = await syncFromServer({
      db,
      client: stubClient({ buildings, tasks }),
    });

    expect(stats).toEqual({ buildingsUpserted: 2, tasksUpserted: 2, tasksSkipped: 0 });
    expect((await db.buildings.findAll()).map((b) => b.id).sort()).toEqual(['b1', 'b2']);
    expect((await db.tasks.findAll()).map((t) => t.id).sort()).toEqual(['t1', 't2']);
  });

  it('updates existing rows when server has newer data (mixed insert/update)', async () => {
    const db = inMemoryDatabase();
    await db.buildings.upsert(makeBuilding('b1', 'OldName'));
    await db.tasks.upsert(makeTask('t1', 'b1', 'pending', 'OldTitle'));

    const stats = await syncFromServer({
      db,
      client: stubClient({
        buildings: [makeBuilding('b1', 'NewName'), makeBuilding('b2', 'Beta')],
        tasks: [makeTask('t1', 'b1', 'pending', 'NewTitle'), makeTask('t2', 'b2')],
      }),
    });

    expect(stats.buildingsUpserted).toBe(2);
    expect(stats.tasksUpserted).toBe(2);
    expect(stats.tasksSkipped).toBe(0);
    expect((await db.buildings.findById('b1'))?.name).toBe('NewName');
    expect((await db.tasks.findById('t1'))?.title).toBe('NewTitle');
  });

  it('preserves locally-completed tasks across sync (schema-migration safe)', async () => {
    const db = inMemoryDatabase();
    const completedAt = new Date('2026-05-08T10:00:00Z');
    const localDone: TaskRow = {
      ...makeTask('t1', 'b1', 'done'),
      completedAt,
      completedByUserId: 'u1',
    };
    await db.buildings.upsert(makeBuilding('b1'));
    await db.tasks.upsert(localDone);

    const stats = await syncFromServer({
      db,
      client: stubClient({
        buildings: [makeBuilding('b1')],
        tasks: [makeTask('t1', 'b1', 'pending', 'StaleServerTitle')],
      }),
    });

    expect(stats.tasksSkipped).toBe(1);
    expect(stats.tasksUpserted).toBe(0);
    const after = await db.tasks.findById('t1');
    expect(after?.status).toBe('done');
    expect(after?.completedAt).toEqual(completedAt);
    expect(after?.title).toBe('task-t1');
  });
});
