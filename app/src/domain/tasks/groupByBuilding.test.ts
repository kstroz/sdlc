import { Building, Task } from '@/src/types';
import { groupByBuilding } from './groupByBuilding';

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

function makeTask(id: string, buildingId: string, dueAt: Date | null): Task {
  return {
    id,
    buildingId,
    assignedToUserId: 'u1',
    title: `task-${id}`,
    description: null,
    managerNotes: null,
    priority: 'normal',
    dueAt,
    status: 'pending',
    blockReason: null,
    blockNote: null,
    completedAt: null,
    completedByUserId: null,
  };
}

describe('groupByBuilding', () => {
  it('returns [] when given no tasks and no buildings', () => {
    expect(groupByBuilding([], [])).toEqual([]);
  });

  it('returns [] when buildings exist but no tasks', () => {
    const b1 = makeBuilding('b1', 'Alpha');
    expect(groupByBuilding([], [b1])).toEqual([]);
  });

  it('groups 5 tasks across 2 buildings into 2 sorted groups', () => {
    const bA = makeBuilding('bA', 'Beta');
    const bB = makeBuilding('bB', 'Alpha');
    const t1 = makeTask('t1', 'bA', new Date('2026-05-08T10:00:00Z'));
    const t2 = makeTask('t2', 'bA', new Date('2026-05-08T08:00:00Z'));
    const t3 = makeTask('t3', 'bB', new Date('2026-05-08T09:00:00Z'));
    const t4 = makeTask('t4', 'bB', null);
    const t5 = makeTask('t5', 'bB', new Date('2026-05-08T07:00:00Z'));

    const groups = groupByBuilding([t1, t2, t3, t4, t5], [bA, bB]);

    expect(groups).toHaveLength(2);
    expect(groups[0].building.id).toBe('bB');
    expect(groups[1].building.id).toBe('bA');
    expect(groups[0].tasks.map((t) => t.id)).toEqual(['t5', 't3', 't4']);
    expect(groups[1].tasks.map((t) => t.id)).toEqual(['t2', 't1']);
  });

  it('drops tasks whose buildingId is not in the buildings list', () => {
    const bA = makeBuilding('bA', 'Alpha');
    const orphan = makeTask('t1', 'unknown', new Date('2026-05-08T10:00:00Z'));
    const kept = makeTask('t2', 'bA', new Date('2026-05-08T11:00:00Z'));

    const groups = groupByBuilding([orphan, kept], [bA]);

    expect(groups).toHaveLength(1);
    expect(groups[0].tasks.map((t) => t.id)).toEqual(['t2']);
  });

  it('omits buildings that have no tasks', () => {
    const bA = makeBuilding('bA', 'Alpha');
    const bB = makeBuilding('bB', 'Beta');
    const t1 = makeTask('t1', 'bA', null);

    const groups = groupByBuilding([t1], [bA, bB]);

    expect(groups).toHaveLength(1);
    expect(groups[0].building.id).toBe('bA');
  });

  it('places tasks with undefined dueAt after dated tasks', () => {
    const bA = makeBuilding('bA', 'Alpha');
    const t1 = makeTask('t1', 'bA', null);
    const t2 = makeTask('t2', 'bA', new Date('2026-05-08T12:00:00Z'));
    const t3 = makeTask('t3', 'bA', null);
    const t4 = makeTask('t4', 'bA', new Date('2026-05-08T09:00:00Z'));

    const groups = groupByBuilding([t1, t2, t3, t4], [bA]);

    expect(groups[0].tasks.map((t) => t.id)).toEqual(['t4', 't2', 't1', 't3']);
  });
});
