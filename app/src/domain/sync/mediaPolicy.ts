import type { OutboxAction } from '@/src/types';

export type NetworkTypeValue = 'wifi' | 'cellular' | 'none';

export interface ShouldUploadMediaDeps {
  actionType: OutboxAction['actionType'];
  networkType: NetworkTypeValue;
  wifiOnlyForMedia: boolean;
}

export function shouldUploadMedia(deps: ShouldUploadMediaDeps): boolean {
  if (deps.networkType === 'none') {
    return false;
  }
  if (deps.actionType !== 'attach_photo') {
    return true;
  }
  if (deps.wifiOnlyForMedia && deps.networkType === 'cellular') {
    return false;
  }
  return true;
}
