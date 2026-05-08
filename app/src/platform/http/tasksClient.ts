import { TasksClient, TodayPayload } from '@/src/use-cases/loadToday';
import { Building, Task } from '@/src/types';

interface RawBuilding {
  id: string;
  name: string;
  streetAddress: string;
  city: string;
  latitude: number | null;
  longitude: number | null;
}

interface RawTask {
  id: string;
  buildingId: string;
  assignedToUserId: string;
  title: string;
  description: string | null;
  managerNotes: string | null;
  priority: 'normal' | 'urgent';
  dueAt: string | null;
  status: 'pending' | 'done' | 'blocked';
  blockReason: 'needs_parts' | 'tenant_absent' | 'needs_specialist' | null;
  blockNote: string | null;
  completedAt: string | null;
  completedByUserId: string | null;
}

interface RawPayload {
  buildings: RawBuilding[];
  tasks: RawTask[];
}

export interface HttpTasksClientConfig {
  baseUrl: string;
  authToken: string | null;
}

export function createTasksClient(config: HttpTasksClientConfig): TasksClient {
  return {
    async getTodayTasks(date: string): Promise<TodayPayload> {
      const url = `${config.baseUrl}/tasks/today?date=${encodeURIComponent(date)}`;
      const headers: Record<string, string> = { Accept: 'application/json' };
      if (config.authToken !== null) {
        headers.Authorization = `Bearer ${config.authToken}`;
      }
      const res = await fetch(url, { method: 'GET', headers });
      if (!res.ok) {
        throw new Error(`tasks/today failed: ${res.status}`);
      }
      const raw: RawPayload = await res.json();
      return {
        buildings: raw.buildings.map(toBuilding),
        tasks: raw.tasks.map(toTask),
      };
    },
  };
}

function toBuilding(raw: RawBuilding): Building {
  return {
    id: raw.id,
    name: raw.name,
    streetAddress: raw.streetAddress,
    city: raw.city,
    latitude: raw.latitude,
    longitude: raw.longitude,
  };
}

function toTask(raw: RawTask): Task {
  return {
    id: raw.id,
    buildingId: raw.buildingId,
    assignedToUserId: raw.assignedToUserId,
    title: raw.title,
    description: raw.description,
    managerNotes: raw.managerNotes,
    priority: raw.priority,
    dueAt: raw.dueAt === null ? null : new Date(raw.dueAt),
    status: raw.status,
    blockReason: raw.blockReason,
    blockNote: raw.blockNote,
    completedAt: raw.completedAt === null ? null : new Date(raw.completedAt),
    completedByUserId: raw.completedByUserId,
  };
}
