import { CompletionPayload, EPrzegladyClient } from '../clients/eprzegladyClient';
import { ForwardingQueue, QueueItem } from '../queue/forwardingQueue';

export interface Alerter {
  alert(reason: string): void | Promise<void>;
}

export interface EPrzegladyForwarderOptions {
  client: EPrzegladyClient;
  queue: ForwardingQueue<CompletionPayload>;
  alerter: Alerter;
  /** Retry delays applied per attempt index (0-based). */
  backoffSchedule?: number[];
  /** Number of failed attempts after which we alert and give up. */
  maxAttempts?: number;
}

export const DEFAULT_BACKOFF_SCHEDULE_MS = [
  1 * 60 * 1000, // 1m
  5 * 60 * 1000, // 5m
  15 * 60 * 1000, // 15m
  60 * 60 * 1000, // 1h
  3 * 60 * 60 * 1000, // 3h
];

export class EPrzegladyForwarder {
  private readonly client: EPrzegladyClient;
  private readonly queue: ForwardingQueue<CompletionPayload>;
  private readonly alerter: Alerter;
  private readonly backoff: number[];
  private readonly maxAttempts: number;

  constructor(opts: EPrzegladyForwarderOptions) {
    this.client = opts.client;
    this.queue = opts.queue;
    this.alerter = opts.alerter;
    this.backoff = opts.backoffSchedule ?? DEFAULT_BACKOFF_SCHEDULE_MS;
    this.maxAttempts = opts.maxAttempts ?? 5;
  }

  /** Drain ready items once. */
  async tick(): Promise<void> {
    await this.queue.process(async (item) => this.handleItem(item));
  }

  private async handleItem(item: QueueItem<CompletionPayload>): Promise<{ kind: 'ack' } | { kind: 'nack' }> {
    const result = await this.client.sendCompletion(item.payload);
    if (result.ok) {
      return { kind: 'ack' };
    }
    if (item.attempts > this.maxAttempts) {
      await this.alerter.alert(
        `ePrzeglądy forwarding failed permanently for task ${item.payload.taskId} after ${item.attempts} attempts (last status ${result.status})`,
      );
      return { kind: 'ack' };
    }
    return { kind: 'nack' };
  }
}

/** Convenience entrypoint: enqueue then drain. */
export function enqueueCompletion(
  queue: ForwardingQueue<CompletionPayload>,
  payload: CompletionPayload,
): void {
  queue.enqueue(payload);
}
