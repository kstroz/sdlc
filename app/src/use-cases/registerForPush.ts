import type { PushClient } from '../platform/push/pushClient';

export interface DeviceRegistrationPayload {
  platform: 'ios' | 'android';
  pushToken: string;
  appVersion: string;
}

export interface DevicesClient {
  register(payload: DeviceRegistrationPayload): Promise<void>;
}

export type RegisterForPushOutcome =
  | { kind: 'registered'; token: string }
  | { kind: 'permission_denied' }
  | { kind: 'unsupported' }
  | { kind: 'backend_error'; message: string };

export interface RegisterForPushDeps {
  pushClient: PushClient;
  devicesClient: DevicesClient;
  platform: 'ios' | 'android';
  appVersion: string;
}

export async function registerForPush(
  deps: RegisterForPushDeps,
): Promise<RegisterForPushOutcome> {
  const result = await deps.pushClient.register();
  if ('reason' in result) {
    if (result.reason === 'permission_denied') {
      return { kind: 'permission_denied' };
    }
    return { kind: 'unsupported' };
  }

  try {
    await deps.devicesClient.register({
      platform: deps.platform,
      pushToken: result.token,
      appVersion: deps.appVersion,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'unknown error';
    return { kind: 'backend_error', message };
  }

  return { kind: 'registered', token: result.token };
}
