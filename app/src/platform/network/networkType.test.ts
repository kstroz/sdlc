import { createFakeNetworkType, systemNetworkType } from './networkType';

describe('networkType', () => {
  it('fake returns the configured wifi value', async () => {
    const fake = createFakeNetworkType('wifi');
    expect(await fake.current()).toBe('wifi');
  });

  it('fake returns the configured cellular value', async () => {
    const fake = createFakeNetworkType('cellular');
    expect(await fake.current()).toBe('cellular');
  });

  it('fake returns the configured none value', async () => {
    const fake = createFakeNetworkType('none');
    expect(await fake.current()).toBe('none');
  });

  it('system stub returns wifi until netinfo is wired in', async () => {
    expect(await systemNetworkType.current()).toBe('wifi');
  });
});
