import { ForwardingQueue, QueueItem, Clock } from './forwardingQueue';

class FakeClock implements Clock {
  constructor(public t: number = 0) {}
  now() {
    return this.t;
  }
  advance(ms: number) {
    this.t += ms;
  }
}

describe('ForwardingQueue', () => {
  it('processes items in FIFO order', async () => {
    const clock = new FakeClock(0);
    const q = new ForwardingQueue<{ tag: string }>({ clock });
    q.enqueue({ tag: 'a' });
    q.enqueue({ tag: 'b' });
    q.enqueue({ tag: 'c' });

    const seen: string[] = [];
    await q.process(async (item: QueueItem<{ tag: string }>) => {
      seen.push(item.payload.tag);
      return { kind: 'ack' };
    });

    expect(seen).toEqual(['a', 'b', 'c']);
    expect(q.size()).toBe(0);
  });

  it('removes acked items from the queue', async () => {
    const clock = new FakeClock(0);
    const q = new ForwardingQueue<{ tag: string }>({ clock });
    q.enqueue({ tag: 'a' });
    await q.process(async () => ({ kind: 'ack' }));
    expect(q.size()).toBe(0);
  });

  it('keeps nacked items and applies exponential backoff', async () => {
    const clock = new FakeClock(0);
    const q = new ForwardingQueue<{ tag: string }>({
      clock,
      baseBackoffMs: 1000,
      maxBackoffMs: 60_000,
    });
    q.enqueue({ tag: 'a' });

    // First attempt: nack -> backoff = 1000ms
    await q.process(async () => ({ kind: 'nack' }));
    expect(q.size()).toBe(1);

    // Not yet ready
    await q.process(async () => {
      throw new Error('should not be called before backoff elapses');
    });

    // Advance past first backoff
    clock.advance(1000);
    let calls = 0;
    await q.process(async () => {
      calls += 1;
      return { kind: 'nack' };
    });
    expect(calls).toBe(1);

    // After 2nd nack, backoff doubled to 2000ms
    clock.advance(1999);
    await q.process(async () => {
      throw new Error('should not be called yet');
    });
    clock.advance(1);
    calls = 0;
    await q.process(async () => {
      calls += 1;
      return { kind: 'nack' };
    });
    expect(calls).toBe(1);
  });

  it('caps backoff at maxBackoffMs', () => {
    const q = new ForwardingQueue({
      baseBackoffMs: 60_000,
      maxBackoffMs: 3 * 60 * 60 * 1000,
    });
    // attempt 100 should saturate
    expect(q.computeBackoff(100)).toBe(3 * 60 * 60 * 1000);
    // attempt 1 = base
    expect(q.computeBackoff(1)).toBe(60_000);
    // attempt 2 = 2x base
    expect(q.computeBackoff(2)).toBe(120_000);
  });
});
