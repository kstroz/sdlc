import type { Clock } from '@/src/platform/clock';
import type { RandomId } from '@/src/platform/randomId';

export interface IdempotencyKeyDeps {
  randomId: RandomId;
  clock: Clock;
}

const HEX = '0123456789abcdef';

function pad(s: string, n: number): string {
  if (s.length >= n) {
    return s.slice(0, n);
  }
  return s + HEX.repeat(n - s.length);
}

function toHex(input: string): string {
  let out = '';
  for (let i = 0; i < input.length; i += 1) {
    const code = input.charCodeAt(i);
    out += HEX[(code >> 4) & 0xf] + HEX[code & 0xf];
  }
  return out;
}

export function generateIdempotencyKey(deps: IdempotencyKeyDeps): string {
  const seed = deps.randomId.generate() + deps.clock.now().getTime().toString(36);
  const hex = toHex(seed);
  const a = pad(hex.slice(0, 8), 8);
  const b = pad(hex.slice(8, 12), 4);
  const c = '4' + pad(hex.slice(13, 16), 3);
  const d = '8' + pad(hex.slice(17, 20), 3);
  const e = pad(hex.slice(20, 32), 12);
  return `${a}-${b}-${c}-${d}-${e}`;
}
