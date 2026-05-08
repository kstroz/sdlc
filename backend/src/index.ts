import { buildEPrzegladyClientFromEnv, CompletionPayload, EPrzegladyClient } from './clients/eprzegladyClient';
import { ForwardingQueue } from './queue/forwardingQueue';
import { Alerter, EPrzegladyForwarder } from './workers/eprzegladyForwarder';

export interface StartWorkerOptions {
  client?: EPrzegladyClient;
  queue?: ForwardingQueue<CompletionPayload>;
  alerter?: Alerter;
}

export interface WorkerHandle {
  forwarder: EPrzegladyForwarder;
  queue: ForwardingQueue<CompletionPayload>;
}

const consoleAlerter: Alerter = {
  alert(reason: string) {
    // eslint-disable-next-line no-console
    console.error(`[ALERT] ${reason}`);
  },
};

export function startWorker(opts: StartWorkerOptions = {}): WorkerHandle {
  const client = opts.client ?? buildEPrzegladyClientFromEnv();
  const queue = opts.queue ?? new ForwardingQueue<CompletionPayload>();
  const alerter = opts.alerter ?? consoleAlerter;
  const forwarder = new EPrzegladyForwarder({ client, queue, alerter });
  return { forwarder, queue };
}

export { ForwardingQueue, EPrzegladyForwarder };
export type { CompletionPayload, EPrzegladyClient, Alerter };
