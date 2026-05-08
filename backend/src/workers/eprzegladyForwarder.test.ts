import { CompletionPayload, EPrzegladyClient } from '../clients/eprzegladyClient';
import { ForwardingQueue, Clock } from '../queue/forwardingQueue';
import { EPrzegladyForwarder, Alerter } from './eprzegladyForwarder';

class FakeClock implements Clock {
  constructor(public t: number = 0) {}
  now() {
    return this.t;
  }
  advance(ms: number) {
    this.t += ms;
  }
}

function makeAlerter(): Alerter & { calls: string[] } {
  const calls: string[] = [];
  return {
    calls,
    alert(reason: string) {
      calls.push(reason);
    },
  };
}

const samplePayload: CompletionPayload = {
  taskId: 'task-1',
  technicianId: 'tech-1',
  completedAt: '2026-05-08T00:00:00Z',
};

describe('EPrzegladyForwarder', () => {
  it('happy path: dispatches and acks on 2xx', async () => {
    const client: EPrzegladyClient = {
      sendCompletion: jest.fn(async () => ({ ok: true, status: 202 })),
    };
    const clock = new FakeClock(0);
    const queue = new ForwardingQueue<CompletionPayload>({ clock, baseBackoffMs: 1000 });
    const alerter = makeAlerter();
    const forwarder = new EPrzegladyForwarder({ client, queue, alerter });

    queue.enqueue(samplePayload);
    await forwarder.tick();

    expect(client.sendCompletion).toHaveBeenCalledTimes(1);
    expect(queue.size()).toBe(0);
    expect(alerter.calls).toHaveLength(0);
  });

  it('5xx: nacks with backoff and retries on next ready tick', async () => {
    let callCount = 0;
    const client: EPrzegladyClient = {
      sendCompletion: jest.fn(async () => {
        callCount += 1;
        if (callCount < 3) return { ok: false, status: 503 };
        return { ok: true, status: 202 };
      }),
    };
    const clock = new FakeClock(0);
    const queue = new ForwardingQueue<CompletionPayload>({ clock, baseBackoffMs: 1000, maxBackoffMs: 60_000 });
    const alerter = makeAlerter();
    const forwarder = new EPrzegladyForwarder({ client, queue, alerter });

    queue.enqueue(samplePayload);

    // tick 1: 503 -> nack, backoff 1000ms
    await forwarder.tick();
    expect(queue.size()).toBe(1);

    // not yet ready
    await forwarder.tick();
    expect(callCount).toBe(1);

    // advance & retry
    clock.advance(1000);
    await forwarder.tick();
    expect(callCount).toBe(2);

    // backoff doubled to 2000ms
    clock.advance(2000);
    await forwarder.tick();
    expect(callCount).toBe(3);
    expect(queue.size()).toBe(0);
    expect(alerter.calls).toHaveLength(0);
  });

  it('permanent failure: after maxAttempts (5), alerts and removes from queue', async () => {
    const client: EPrzegladyClient = {
      sendCompletion: jest.fn(async () => ({ ok: false, status: 500 })),
    };
    const clock = new FakeClock(0);
    const queue = new ForwardingQueue<CompletionPayload>({ clock, baseBackoffMs: 1, maxBackoffMs: 1 });
    const alerter = makeAlerter();
    const forwarder = new EPrzegladyForwarder({ client, queue, alerter, maxAttempts: 5 });

    queue.enqueue(samplePayload);

    // 5 failed ticks
    for (let i = 0; i < 5; i++) {
      await forwarder.tick();
      clock.advance(2);
    }
    expect(queue.size()).toBe(1);
    expect(alerter.calls).toHaveLength(0);

    // 6th tick: attempts becomes 6 (> 5), alert + drop
    await forwarder.tick();
    expect(queue.size()).toBe(0);
    expect(alerter.calls).toHaveLength(1);
    expect(alerter.calls[0]).toContain('task-1');
  });
});
