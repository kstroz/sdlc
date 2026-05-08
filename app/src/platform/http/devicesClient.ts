export interface DeviceRegistration {
  platform: 'ios' | 'android';
  pushToken: string;
  appVersion: string;
}

export interface DevicesClient {
  register(payload: DeviceRegistration): Promise<void>;
}

export interface HttpDevicesClientConfig {
  baseUrl: string;
  authToken: string | null;
}

export function createDevicesClient(config: HttpDevicesClientConfig): DevicesClient {
  return {
    async register(payload: DeviceRegistration): Promise<void> {
      const url = `${config.baseUrl}/devices`;
      const headers: Record<string, string> = {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      };
      if (config.authToken !== null) {
        headers.Authorization = `Bearer ${config.authToken}`;
      }
      const res = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        throw new Error(`devices/register failed: ${res.status}`);
      }
    },
  };
}
