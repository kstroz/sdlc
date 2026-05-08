export interface PushPayload {
  taskId?: string;
  [key: string]: unknown;
}

export type RegisterResult =
  | { token: string }
  | { reason: 'permission_denied' | 'unsupported' };

export interface PushClient {
  register(): Promise<RegisterResult>;
  onNotificationTap(cb: (payload: PushPayload) => void): () => void;
}

// Concrete adapter is intentionally a stub: expo-notifications is not yet
// installed (see T-009 / ADR amendment pending). Returns 'unsupported' so
// callers exercise the in-app fallback path.
export function createExpoPushClient(): PushClient {
  return {
    async register() {
      return { reason: 'unsupported' };
    },
    onNotificationTap() {
      return () => {
        // no-op until expo-notifications is wired
      };
    },
  };
}
