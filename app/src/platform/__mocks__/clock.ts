import type { Clock } from '../clock';

export function fixedClock(value: Date | string): Clock {
  const fixed = typeof value === 'string' ? new Date(value) : value;
  return {
    now(): Date {
      return new Date(fixed.getTime());
    },
  };
}

export function sequenceClock(values: ReadonlyArray<Date | string>): Clock {
  let i = 0;
  return {
    now(): Date {
      const v = values[Math.min(i, values.length - 1)];
      i += 1;
      return typeof v === 'string' ? new Date(v) : new Date(v.getTime());
    },
  };
}
