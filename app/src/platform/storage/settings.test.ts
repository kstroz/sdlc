import {
  SETTING_WIFI_ONLY_FOR_MEDIA,
  createInMemorySettings,
} from './settings';

describe('createInMemorySettings', () => {
  it('returns undefined for unset keys', async () => {
    const settings = createInMemorySettings();
    expect(await settings.get('missing')).toBeUndefined();
  });

  it('round-trips a boolean value', async () => {
    const settings = createInMemorySettings();
    await settings.set(SETTING_WIFI_ONLY_FOR_MEDIA, true);
    expect(await settings.get(SETTING_WIFI_ONLY_FOR_MEDIA)).toBe(true);
  });

  it('overwrites an existing value', async () => {
    const settings = createInMemorySettings({ [SETTING_WIFI_ONLY_FOR_MEDIA]: true });
    await settings.set(SETTING_WIFI_ONLY_FOR_MEDIA, false);
    expect(await settings.get(SETTING_WIFI_ONLY_FOR_MEDIA)).toBe(false);
  });

  it('seeds initial values', async () => {
    const settings = createInMemorySettings({ foo: 'bar' });
    expect(await settings.get('foo')).toBe('bar');
  });
});
