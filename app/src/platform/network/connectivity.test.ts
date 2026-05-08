import { createFakeConnectivity, createStubConnectivity } from './connectivity';

describe('connectivity (fake)', () => {
  it('reports the current online state via isOnline', async () => {
    const c = createFakeConnectivity(false);
    expect(await c.isOnline()).toBe(false);
    c.setOnline(true);
    expect(await c.isOnline()).toBe(true);
  });

  it('notifies subscribers on change', async () => {
    const c = createFakeConnectivity(false);
    const events: boolean[] = [];
    c.onChange((v) => events.push(v));
    c.emit(true);
    c.emit(false);
    expect(events).toEqual([true, false]);
  });

  it('returns an unsubscribe function that detaches the listener', () => {
    const c = createFakeConnectivity(true);
    const events: boolean[] = [];
    const unsubscribe = c.onChange((v) => events.push(v));
    c.emit(false);
    unsubscribe();
    c.emit(true);
    expect(events).toEqual([false]);
    expect(c.listenerCount()).toBe(0);
  });
});

describe('connectivity (stub adapter)', () => {
  it('reports online and provides a no-op unsubscribe', async () => {
    const c = createStubConnectivity();
    expect(await c.isOnline()).toBe(true);
    const unsubscribe = c.onChange(() => undefined);
    expect(typeof unsubscribe).toBe('function');
    expect(() => unsubscribe()).not.toThrow();
  });
});
