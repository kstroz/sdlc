import type {
  BuildingRow,
  OutboxActionRow,
  PhotoRow,
  TaskRow,
  UserRow,
} from './schema';

export interface Collection<Row extends { id: string }> {
  findById(id: string): Promise<Row | null>;
  findAll(): Promise<Row[]>;
  upsert(row: Row): Promise<void>;
  delete(id: string): Promise<void>;
}

export interface Database {
  users: Collection<UserRow>;
  buildings: Collection<BuildingRow>;
  tasks: Collection<TaskRow>;
  photos: Collection<PhotoRow>;
  outboxActions: Collection<OutboxActionRow>;
  inTransaction<T>(fn: () => Promise<T>): Promise<T>;
}

interface Stores {
  users: Map<string, UserRow>;
  buildings: Map<string, BuildingRow>;
  tasks: Map<string, TaskRow>;
  photos: Map<string, PhotoRow>;
  outboxActions: Map<string, OutboxActionRow>;
}

function makeCollection<Row extends { id: string }>(
  store: Map<string, Row>,
): Collection<Row> {
  return {
    async findById(id) {
      return store.get(id) ?? null;
    },
    async findAll() {
      return Array.from(store.values());
    },
    async upsert(row) {
      store.set(row.id, row);
    },
    async delete(id) {
      store.delete(id);
    },
  };
}

function snapshot(stores: Stores): Stores {
  return {
    users: new Map(stores.users),
    buildings: new Map(stores.buildings),
    tasks: new Map(stores.tasks),
    photos: new Map(stores.photos),
    outboxActions: new Map(stores.outboxActions),
  };
}

function restore(target: Stores, source: Stores): void {
  target.users.clear();
  source.users.forEach((v, k) => target.users.set(k, v));
  target.buildings.clear();
  source.buildings.forEach((v, k) => target.buildings.set(k, v));
  target.tasks.clear();
  source.tasks.forEach((v, k) => target.tasks.set(k, v));
  target.photos.clear();
  source.photos.forEach((v, k) => target.photos.set(k, v));
  target.outboxActions.clear();
  source.outboxActions.forEach((v, k) => target.outboxActions.set(k, v));
}

export function inMemoryDatabase(): Database {
  const stores: Stores = {
    users: new Map(),
    buildings: new Map(),
    tasks: new Map(),
    photos: new Map(),
    outboxActions: new Map(),
  };

  return {
    users: makeCollection(stores.users),
    buildings: makeCollection(stores.buildings),
    tasks: makeCollection(stores.tasks),
    photos: makeCollection(stores.photos),
    outboxActions: makeCollection(stores.outboxActions),
    async inTransaction(fn) {
      const backup = snapshot(stores);
      try {
        return await fn();
      } catch (error) {
        restore(stores, backup);
        throw error;
      }
    },
  };
}
