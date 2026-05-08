import { registerForPush } from './registerForPush';
import type {
  DeviceRegistrationPayload,
  DevicesClient,
} from './registerForPush';
import type { PushClient, RegisterResult } from '../platform/push/pushClient';

function makePushClient(result: RegisterResult): PushClient {
  return {
    async register() {
      return result;
    },
    onNotificationTap() {
      return () => undefined;
    },
  };
}

function makeDevicesClient(opts: {
  fail?: Error;
  capture?: DeviceRegistrationPayload[];
}): DevicesClient {
  return {
    async register(payload) {
      if (opts.capture) {
        opts.capture.push(payload);
      }
      if (opts.fail) {
        throw opts.fail;
      }
    },
  };
}

describe('registerForPush', () => {
  it('registers the token with the backend on the happy path', async () => {
    const captured: DeviceRegistrationPayload[] = [];
    const outcome = await registerForPush({
      pushClient: makePushClient({ token: 'tok-xyz' }),
      devicesClient: makeDevicesClient({ capture: captured }),
      platform: 'ios',
      appVersion: '1.0.0',
    });

    expect(outcome).toEqual({ kind: 'registered', token: 'tok-xyz' });
    expect(captured).toEqual([
      { platform: 'ios', pushToken: 'tok-xyz', appVersion: '1.0.0' },
    ]);
  });

  it('returns permission_denied gracefully and does not call the backend', async () => {
    const captured: DeviceRegistrationPayload[] = [];
    const outcome = await registerForPush({
      pushClient: makePushClient({ reason: 'permission_denied' }),
      devicesClient: makeDevicesClient({ capture: captured }),
      platform: 'android',
      appVersion: '1.0.0',
    });

    expect(outcome).toEqual({ kind: 'permission_denied' });
    expect(captured).toEqual([]);
  });

  it('returns unsupported when the platform has no push support', async () => {
    const captured: DeviceRegistrationPayload[] = [];
    const outcome = await registerForPush({
      pushClient: makePushClient({ reason: 'unsupported' }),
      devicesClient: makeDevicesClient({ capture: captured }),
      platform: 'ios',
      appVersion: '1.0.0',
    });

    expect(outcome).toEqual({ kind: 'unsupported' });
    expect(captured).toEqual([]);
  });

  it('returns backend_error when the devices endpoint rejects', async () => {
    const outcome = await registerForPush({
      pushClient: makePushClient({ token: 'tok-1' }),
      devicesClient: makeDevicesClient({ fail: new Error('devices/register failed: 503') }),
      platform: 'android',
      appVersion: '1.2.3',
    });

    expect(outcome.kind).toBe('backend_error');
    if (outcome.kind === 'backend_error') {
      expect(outcome.message).toBe('devices/register failed: 503');
    }
  });
});
