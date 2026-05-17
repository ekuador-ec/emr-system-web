import { supabase } from "@/infrastructure/core/supabaseClient";

export interface AiApiClientConfig {
  baseUrl: string;
  apiKey: string;
  getAccessToken?: () => Promise<string | null>;
  fetchImpl?: typeof fetch;
}

export interface AiApiErrorPayload {
  code: string;
  message: string;
  details?: unknown;
}

export class AiApiError extends Error {
  public readonly code: string;
  public readonly status: number;
  public readonly details?: unknown;

  constructor(code: string, message: string, status: number, details?: unknown) {
    super(message);
    this.name = "AiApiError";
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

async function defaultGetAccessToken(): Promise<string | null> {
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? null;
}

export class AiApiClient {
  private readonly baseUrl: string;
  private readonly apiKey: string;
  private readonly getAccessToken: () => Promise<string | null>;
  private readonly fetchImpl: typeof fetch;

  constructor(config: AiApiClientConfig) {
    if (!config.baseUrl) throw new Error("AI service base URL is missing");
    if (!config.apiKey) throw new Error("AI service API key is missing");
    this.baseUrl = config.baseUrl.replace(/\/+$/, "");
    this.apiKey = config.apiKey;
    this.getAccessToken = config.getAccessToken ?? defaultGetAccessToken;
    this.fetchImpl = config.fetchImpl ?? fetch.bind(globalThis);
  }

  private async buildHeaders(extra?: Record<string, string>): Promise<Headers> {
    const token = await this.getAccessToken();
    if (!token) {
      throw new AiApiError("AUTH_MISSING_JWT", "Sesion expirada", 401);
    }
    const headers = new Headers(extra);
    headers.set("X-Api-Key", this.apiKey);
    headers.set("Authorization", `Bearer ${token}`);
    return headers;
  }

  async request<T>(method: string, path: string, body?: unknown, signal?: AbortSignal): Promise<T> {
    const headers = await this.buildHeaders({
      "Content-Type": "application/json",
      Accept: "application/json",
    });

    const init: RequestInit = {
      method,
      headers,
      signal: signal ?? null,
    };
    if (body !== undefined) init.body = JSON.stringify(body);

    let response: Response;
    try {
      response = await this.fetchImpl(`${this.baseUrl}${path}`, init);
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") throw error;
      const message = error instanceof Error ? error.message : "Error de red";
      throw new AiApiError("NETWORK_ERROR", message, 0);
    }

    if (response.status === 204) {
      return undefined as T;
    }

    const text = await response.text();
    const data = text ? safeJsonParse(text) : null;

    if (!response.ok) {
      const payload = (data as { error?: AiApiErrorPayload } | null)?.error;
      throw new AiApiError(
        payload?.code ?? "HTTP_ERROR",
        payload?.message ?? `Request failed with status ${response.status}`,
        response.status,
        payload?.details,
      );
    }

    return data as T;
  }

  async openSseStream(
    method: string,
    path: string,
    body: unknown,
    signal: AbortSignal,
  ): Promise<ReadableStreamDefaultReader<Uint8Array>> {
    const headers = await this.buildHeaders({
      "Content-Type": "application/json",
      Accept: "text/event-stream",
    });

    const response = await this.fetchImpl(`${this.baseUrl}${path}`, {
      method,
      headers,
      body: JSON.stringify(body),
      signal,
    });

    if (!response.ok || !response.body) {
      const text = await response.text().catch(() => "");
      const parsed = text ? safeJsonParse(text) : null;
      const payload = (parsed as { error?: AiApiErrorPayload } | null)?.error;
      throw new AiApiError(
        payload?.code ?? "HTTP_ERROR",
        payload?.message ?? `SSE stream failed with status ${response.status}`,
        response.status,
        payload?.details,
      );
    }

    return response.body.getReader();
  }
}

function safeJsonParse(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}
