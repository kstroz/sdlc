import { computeBackoff } from './backoff';

describe('computeBackoff', () => {
  it('returns 0 for attempt 0', () => {
    expect(computeBackoff(0)).toBe(0);
  });

  it('returns 0 for negative attempts', () => {
    expect(computeBackoff(-1)).toBe(0);
  });

  it('returns 2000 for attempt 1', () => {
    expect(computeBackoff(1)).toBe(2000);
  });

  it('returns 4000 for attempt 2', () => {
    expect(computeBackoff(2)).toBe(4000);
  });

  it('returns 8000 for attempt 3', () => {
    expect(computeBackoff(3)).toBe(8000);
  });

  it('returns 16000 for attempt 4', () => {
    expect(computeBackoff(4)).toBe(16000);
  });

  it('returns 32000 for attempt 5', () => {
    expect(computeBackoff(5)).toBe(32000);
  });
});
