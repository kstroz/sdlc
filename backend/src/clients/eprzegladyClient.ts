import axios, { AxiosInstance } from 'axios';

export interface CompletionPayload {
  taskId: string;
  technicianId: string;
  completedAt: string; // ISO-8601
}

export interface EPrzegladyClient {
  sendCompletion(payload: CompletionPayload): Promise<{ ok: boolean; status: number }>;
}

export interface EPrzegladyClientOptions {
  baseUrl: string;
  authToken: string;
  http?: AxiosInstance;
}

interface EPrzegladyWirePayload {
  inspectionId: string;
  completedAt: string;
  technicianId: string;
}

export function translateToWire(payload: CompletionPayload): EPrzegladyWirePayload {
  return {
    inspectionId: payload.taskId,
    completedAt: payload.completedAt,
    technicianId: payload.technicianId,
  };
}

export class HttpEPrzegladyClient implements EPrzegladyClient {
  private readonly http: AxiosInstance;
  private readonly authToken: string;

  constructor(opts: EPrzegladyClientOptions) {
    this.authToken = opts.authToken;
    this.http =
      opts.http ??
      axios.create({
        baseURL: opts.baseUrl,
        timeout: 10_000,
      });
  }

  async sendCompletion(payload: CompletionPayload): Promise<{ ok: boolean; status: number }> {
    const wire = translateToWire(payload);
    try {
      const res = await this.http.post('/inspections/completions', wire, {
        headers: {
          Authorization: `Bearer ${this.authToken}`,
          'Content-Type': 'application/json',
        },
      });
      return { ok: res.status >= 200 && res.status < 300, status: res.status };
    } catch (err: unknown) {
      const status =
        typeof err === 'object' && err !== null && 'response' in err
          ? (err as { response?: { status?: number } }).response?.status ?? 0
          : 0;
      return { ok: false, status };
    }
  }
}

export function buildEPrzegladyClientFromEnv(env: NodeJS.ProcessEnv = process.env): HttpEPrzegladyClient {
  const baseUrl = env.EPRZEGLADY_BASE_URL;
  const authToken = env.EPRZEGLADY_AUTH_TOKEN;
  if (!baseUrl || !authToken) {
    throw new Error('EPRZEGLADY_BASE_URL and EPRZEGLADY_AUTH_TOKEN must be set');
  }
  return new HttpEPrzegladyClient({ baseUrl, authToken });
}
