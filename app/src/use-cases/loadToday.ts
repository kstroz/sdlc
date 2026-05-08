import { groupByBuilding, BuildingGroup } from '@/src/domain/tasks/groupByBuilding';
import { Building, Task, Result, ok, err } from '@/src/types';

export interface TodayPayload {
  buildings: Building[];
  tasks: Task[];
}

export interface TaskCache {
  read(): Promise<TodayPayload | null>;
  write(payload: TodayPayload): Promise<void>;
}

export interface TasksClient {
  getTodayTasks(date: string): Promise<TodayPayload>;
}

export type LoadTodayError =
  | { kind: 'network_error'; message: string };

export interface LoadTodayDeps {
  today: string;
  cache: TaskCache;
  client: TasksClient;
}

export async function loadToday(
  deps: LoadTodayDeps,
): Promise<Result<BuildingGroup[], LoadTodayError>> {
  const cached = await deps.cache.read();
  if (cached !== null) {
    return ok(groupByBuilding(cached.tasks, cached.buildings));
  }

  try {
    const fresh = await deps.client.getTodayTasks(deps.today);
    await deps.cache.write(fresh);
    return ok(groupByBuilding(fresh.tasks, fresh.buildings));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'unknown error';
    return err({ kind: 'network_error', message });
  }
}
