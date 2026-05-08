import type { Database } from '@/src/platform/db/database';
import type { BuildingRow, TaskRow } from '@/src/platform/db/schema';

export interface TodayPullResult {
  buildings: BuildingRow[];
  tasks: TaskRow[];
}

export interface TasksClient {
  pullToday(): Promise<TodayPullResult>;
}

export interface SyncFromServerDeps {
  db: Database;
  client: TasksClient;
}

export interface SyncFromServerStats {
  buildingsUpserted: number;
  tasksUpserted: number;
  tasksSkipped: number;
}

export async function syncFromServer(
  deps: SyncFromServerDeps,
): Promise<SyncFromServerStats> {
  const { db, client } = deps;
  const pulled = await client.pullToday();

  return db.inTransaction(async () => {
    let buildingsUpserted = 0;
    for (const b of pulled.buildings) {
      await db.buildings.upsert(b);
      buildingsUpserted += 1;
    }

    let tasksUpserted = 0;
    let tasksSkipped = 0;
    for (const incoming of pulled.tasks) {
      const existing = await db.tasks.findById(incoming.id);
      if (existing && existing.status === 'done') {
        tasksSkipped += 1;
        continue;
      }
      await db.tasks.upsert(incoming);
      tasksUpserted += 1;
    }

    return { buildingsUpserted, tasksUpserted, tasksSkipped };
  });
}
