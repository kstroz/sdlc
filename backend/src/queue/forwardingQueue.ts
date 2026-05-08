import { CompletionPayload } from '../clients/eprzegladyClient';

export interface QueueItem<T> {
  id: string;
  payload: T;
  attempts: number;
  nextAttemptAt: number; // epoch ms
}

export type Handler<T> = (item: QueueItem<T>) => Promise<HandlerResult>;

export type HandlerResult = { kind: 'ack' } | { kind: 'nack' };

export interface Clock {
  now(): number;
}

export const realClock: Clock = { now: () => Date.now() };

export interface ForwardingQueueOptions {
  clock?: Clock;
  baseBackoffMs?: number;
  maxBackoffMs?: number;
}

/**
 * In-memory FIFO queue with per-item exponential backoff on nack.
 * Process drains items whose `nextAttemptAt <= now()`.
 */
export class ForwardingQueue<T = CompletionPayload> {
  private items: QueueItem<T>[] = [];
  private nextId = 1;
  private readonly clock: Clock;
  private readonly baseBackoffMs: number;
  private readonly maxBackoffMs: number;

  constructor(opts: ForwardingQueueOptions = {}) {
    this.clock = opts.clock ?? realClock;
    this.baseBackoffMs = opts.baseBackoffMs ?? 60_000;
    this.maxBackoffMs = opts.maxBackoffMs ?? 3 * 60 * 60 * 1000;
  }

  enqueue(payload: T): QueueItem<T> {
    const item: QueueItem<T> = {
      id: String(this.nextId++),
      payload,
      attempts: 0,
      nextAttemptAt: this.clock.now(),
    };
    this.items.push(item);
    return item;
  }

  size(): number {
    return this.items.length;
  }

  /** Drain all currently-ready items in FIFO order through the handler. */
  async process(handler: Handler<T>): Promise<void> {
    // Snapshot ready items in FIFO order to avoid reprocessing nacked items in the same pass.
    const now = this.clock.now();
    const ready = this.items.filter((i) => i.nextAttemptAt <= now);
    for (const item of ready) {
      item.attempts += 1;
      const result = await handler(item);
      if (result.kind === 'ack') {
        this.items = this.items.filter((i) => i.id !== item.id);
      } else {
        const backoff = this.computeBackoff(item.attempts);
        item.nextAttemptAt = this.clock.now() + backoff;
      }
    }
  }

  computeBackoff(attempts: number): number {
    const exp = Math.pow(2, Math.max(0, attempts - 1));
    return Math.min(this.baseBackoffMs * exp, this.maxBackoffMs);
  }
}
