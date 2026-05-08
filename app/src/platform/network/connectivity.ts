export type ConnectivityListener = (online: boolean) => void;

export interface Connectivity {
  isOnline(): Promise<boolean>;
  onChange(cb: ConnectivityListener): () => void;
}

// Stub adapter; the @react-native-community/netinfo dependency is not yet
// installed, so the concrete implementation always reports online and never
// emits change events. Swap-in via the Connectivity interface when NetInfo
// is added under a separate task and ADR amendment.
export function createStubConnectivity(): Connectivity {
  return {
    async isOnline() {
      return true;
    },
    onChange() {
      return () => undefined;
    },
  };
}

export interface FakeConnectivityHandle extends Connectivity {
  emit(online: boolean): void;
  setOnline(online: boolean): void;
  listenerCount(): number;
}

export function createFakeConnectivity(initialOnline: boolean): FakeConnectivityHandle {
  let online = initialOnline;
  const listeners = new Set<ConnectivityListener>();
  return {
    async isOnline() {
      return online;
    },
    onChange(cb) {
      listeners.add(cb);
      return () => {
        listeners.delete(cb);
      };
    },
    emit(value) {
      online = value;
      listeners.forEach((l) => l(value));
    },
    setOnline(value) {
      online = value;
    },
    listenerCount() {
      return listeners.size;
    },
  };
}
