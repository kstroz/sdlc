import { Building, Task } from '@/src/types';

export interface BuildingGroup {
  building: Building;
  tasks: Task[];
}

export function groupByBuilding(tasks: Task[], buildings: Building[]): BuildingGroup[] {
  const buildingsById = new Map(buildings.map((b) => [b.id, b]));
  const tasksByBuilding = new Map<string, Task[]>();

  for (const task of tasks) {
    if (!buildingsById.has(task.buildingId)) continue;
    const bucket = tasksByBuilding.get(task.buildingId) ?? [];
    bucket.push(task);
    tasksByBuilding.set(task.buildingId, bucket);
  }

  const groups: BuildingGroup[] = [];
  for (const [buildingId, bucket] of tasksByBuilding) {
    const building = buildingsById.get(buildingId)!;
    groups.push({ building, tasks: bucket.slice().sort(compareByDueAt) });
  }

  groups.sort((a, b) => a.building.name.localeCompare(b.building.name));
  return groups;
}

function compareByDueAt(a: Task, b: Task): number {
  if (a.dueAt === null && b.dueAt === null) return 0;
  if (a.dueAt === null) return 1;
  if (b.dueAt === null) return -1;
  return a.dueAt.getTime() - b.dueAt.getTime();
}
