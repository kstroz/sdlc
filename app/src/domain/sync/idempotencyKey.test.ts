import { generateIdempotencyKey } from './idempotencyKey';

const UUID_SHAPE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-8[0-9a-f]{3}-[0-9a-f]{12}$/;

function makeDeps(seed: number) {
  let counter = seed;
  return {
    randomId: {
      generate: () => {
        counter += 1;
        return `id-${counter.toString(36)}-${Math.sin(counter).toString(36)}`;
      },
    },
    clock: { now: () => new Date(1700000000000 + counter) },
  };
}

describe('generateIdempotencyKey', () => {
  it('returns a UUID-shaped string', () => {
    const key = generateIdempotencyKey(makeDeps(1));
    expect(key).toMatch(UUID_SHAPE);
  });

  it('produces unique keys across N invocations', () => {
    const deps = makeDeps(100);
    const keys = new Set<string>();
    for (let i = 0; i < 500; i += 1) {
      keys.add(generateIdempotencyKey(deps));
    }
    expect(keys.size).toBe(500);
  });

  it('produces stable shape across many invocations', () => {
    const deps = makeDeps(0);
    for (let i = 0; i < 50; i += 1) {
      expect(generateIdempotencyKey(deps)).toMatch(UUID_SHAPE);
    }
  });
});
