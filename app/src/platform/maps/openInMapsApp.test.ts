import { buildMapsUrl, createMapsOpener } from './openInMapsApp';

describe('buildMapsUrl', () => {
  it('builds an iOS Apple Maps URL with encoded address', () => {
    expect(buildMapsUrl('123 Main St, Springfield', 'ios')).toBe(
      'http://maps.apple.com/?q=123%20Main%20St%2C%20Springfield',
    );
  });

  it('builds an Android geo URL with encoded address', () => {
    expect(buildMapsUrl('123 Main St, Springfield', 'android')).toBe(
      'geo:0,0?q=123%20Main%20St%2C%20Springfield',
    );
  });
});

describe('createMapsOpener', () => {
  it('opens an iOS URL via Linking on iOS', async () => {
    const calls: string[] = [];
    const linking = {
      openURL: async (url: string) => {
        calls.push(url);
      },
    };
    const opener = createMapsOpener(linking, { OS: 'ios' });
    await opener.open('456 Oak Ave');
    expect(calls).toEqual(['http://maps.apple.com/?q=456%20Oak%20Ave']);
  });

  it('opens a geo: URL via Linking on Android', async () => {
    const calls: string[] = [];
    const linking = {
      openURL: async (url: string) => {
        calls.push(url);
      },
    };
    const opener = createMapsOpener(linking, { OS: 'android' });
    await opener.open('456 Oak Ave');
    expect(calls).toEqual(['geo:0,0?q=456%20Oak%20Ave']);
  });
});
