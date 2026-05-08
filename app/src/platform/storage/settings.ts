export interface Settings {
  get<K extends string>(key: K): Promise<unknown>;
  set<K extends string>(key: K, value: unknown): Promise<void>;
}

// In-memory placeholder for AsyncStorage; ADR amendment will swap the impl.
export function createInMemorySettings(initial?: Record<string, unknown>): Settings {
  const store = new Map<string, unknown>(
    initial ? Object.entries(initial) : undefined,
  );
  return {
    async get<K extends string>(key: K): Promise<unknown> {
      return store.has(key) ? store.get(key) : undefined;
    },
    async set<K extends string>(key: K, value: unknown): Promise<void> {
      store.set(key, value);
    },
  };
}

export const SETTING_WIFI_ONLY_FOR_MEDIA = 'wifiOnlyForMedia';
