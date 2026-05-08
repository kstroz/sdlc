export type NetworkTypeValue = 'wifi' | 'cellular' | 'none';

export interface NetworkType {
  current(): Promise<NetworkTypeValue>;
}

// @react-native-community/netinfo not yet installed; stub returns 'wifi'
// until ADR adds the dependency.
export const systemNetworkType: NetworkType = {
  async current(): Promise<NetworkTypeValue> {
    return 'wifi';
  },
};

export function createFakeNetworkType(value: NetworkTypeValue): NetworkType {
  return {
    async current(): Promise<NetworkTypeValue> {
      return value;
    },
  };
}
