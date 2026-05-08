import type { Building, Task, Result } from '@/src/types';
import { ok, err } from '@/src/types';

export interface TaskCache {
  getById(taskId: string): Promise<Task | null>;
}

export interface BuildingCache {
  getById(buildingId: string): Promise<Building | null>;
}

export type LoadDetailError =
  | { kind: 'task_not_found'; taskId: string }
  | { kind: 'building_not_found'; buildingId: string };

export interface LoadTaskDetailDeps {
  taskCache: TaskCache;
  buildingCache: BuildingCache;
}

export async function loadTaskDetail(
  taskId: string,
  deps: LoadTaskDetailDeps,
): Promise<Result<{ task: Task; building: Building }, LoadDetailError>> {
  const task = await deps.taskCache.getById(taskId);
  if (task === null) {
    return err({ kind: 'task_not_found', taskId });
  }
  const building = await deps.buildingCache.getById(task.buildingId);
  if (building === null) {
    return err({ kind: 'building_not_found', buildingId: task.buildingId });
  }
  return ok({ task, building });
}
