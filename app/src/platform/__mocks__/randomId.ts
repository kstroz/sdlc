import type { RandomId } from '../randomId';

export function fixedRandomId(value: string): RandomId {
  return {
    generate(): string {
      return value;
    },
  };
}

export function sequenceRandomId(values: ReadonlyArray<string>): RandomId {
  let i = 0;
  return {
    generate(): string {
      const v = values[Math.min(i, values.length - 1)];
      i += 1;
      return v;
    },
  };
}
