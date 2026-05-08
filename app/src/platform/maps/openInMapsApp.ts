import { Linking, Platform } from 'react-native';

export interface MapsOpener {
  open(address: string): Promise<void>;
}

export interface LinkingLike {
  openURL(url: string): Promise<unknown>;
}

export interface PlatformLike {
  OS: string;
}

export function buildMapsUrl(address: string, os: string): string {
  const encoded = encodeURIComponent(address);
  if (os === 'ios') {
    return `http://maps.apple.com/?q=${encoded}`;
  }
  return `geo:0,0?q=${encoded}`;
}

export function createMapsOpener(
  linking: LinkingLike,
  platform: PlatformLike,
): MapsOpener {
  return {
    async open(address: string): Promise<void> {
      const url = buildMapsUrl(address, platform.OS);
      await linking.openURL(url);
    },
  };
}

export const systemMapsOpener: MapsOpener = createMapsOpener(Linking, Platform);
