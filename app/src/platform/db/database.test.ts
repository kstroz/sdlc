import { inMemoryDatabase } from './database';
import type { BuildingRow, TaskRow } from './schema';

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

function makeTask(id: string, buildingId: string, status: TaskRow['status'] = 'pending'): TaskRow {
  return {
    id,
    buildingId,
    assignedToUserId: 'u1',
    title: `task-${id}`,
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

describe('inMemoryDatabase', () => {
  it('upsert is idempotent: writing same row twice yields one row', async () => {
    const db = inMemoryDatabase();
    const b = makeBuilding('b1');
    await db.buildings.upsert(b);
    await db.buildings.upsert(b);
    const all = await db.buildings.findAll();
    expect(all).toHaveLength(1);
    expect(all[0]).toEqual(b);
  });

  it('upsert overwrites when id matches', async () => {
    const db = inMemoryDatabase();
    await db.buildings.upsert(makeBuilding('b1', 'Old'));
    await db.buildings.upsert(makeBuilding('b1', 'New'));
    const found = await db.buildings.findById('b1');
    expect(found?.name).toBe('New');
  });

  it('findById returns null for missing id', async () => {
    const db = inMemoryDatabase();
    expect(await db.tasks.findById('missing')).toBeNull();
  });

  it('findById returns the row when present', async () => {
    const db = inMemoryDatabase();
    const t = makeTask('t1', 'b1');
    await db.tasks.upsert(t);
    expect(await db.tasks.findById('t1')).toEqual(t);
  });

  it('findAll returns empty array when empty', async () => {
    const db = inMemoryDatabase();
    expect(await db.tasks.findAll()).toEqual([]);
  });

  it('findAll returns every upserted row', async () => {
    const db = inMemoryDatabase();
    await db.tasks.upsert(makeTask('t1', 'b1'));
    await db.tasks.upsert(makeTask('t2', 'b1'));
    const all = await db.tasks.findAll();
    expect(all.map((r) => r.id).sort()).toEqual(['t1', 't2']);
  });

  it('delete removes the row', async () => {
    const db = inMemoryDatabase();
    await db.tasks.upsert(makeTask('t1', 'b1'));
    await db.tasks.delete('t1');
    expect(await db.tasks.findById('t1')).toBeNull();
  });

  it('inTransaction commits when fn resolves', async () => {
    const db = inMemoryDatabase();
    const result = await db.inTransaction(async () => {
      await db.buildings.upsert(makeBuilding('b1'));
      await db.tasks.upsert(makeTask('t1', 'b1'));
      return 42;
    });
    expect(result).toBe(42);
    expect(await db.buildings.findById('b1')).not.toBeNull();
    expect(await db.tasks.findById('t1')).not.toBeNull();
  });

  it('inTransaction rolls back when fn throws', async () => {
    const db = inMemoryDatabase();
    await db.buildings.upsert(makeBuilding('b1', 'Initial'));

    await expect(
      db.inTransaction(async () => {
        await db.buildings.upsert(makeBuilding('b1', 'Mutated'));
        await db.tasks.upsert(makeTask('t1', 'b1'));
        throw new Error('boom');
      }),
    ).rejects.toThrow('boom');

    const after = await db.buildings.findById('b1');
    expect(after?.name).toBe('Initial');
    expect(await db.tasks.findById('t1')).toBeNull();
  });
});
