import { ApiError } from "./ApiError";

/**
 * @author Aloento
 * @since 1.5.0
 * @version 1.0.0
 */
export interface FetchPlusOptions {
  /** Bearer token for Authorization header */
  token?: string;
  /** AbortSignal for request cancellation */
  signal?: AbortSignal;
}

/**
 * @author Aloento
 * @since 1.5.0
 * @version 1.0.0
 */
class FetchPlus {
  private buildHeaders(token?: string, extra?: Record<string, string>): Headers {
    const headers: Record<string, string> = { ...extra };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    return new Headers(headers);
  }

  async getJson<T = unknown>(url: string, options?: FetchPlusOptions): Promise<T> {
    const headers = this.buildHeaders(options?.token);
    const res = await fetch(url, { headers, signal: options?.signal });

    if (!res.ok) {
      const body = await res.text().catch(() => undefined);
      throw ApiError.fromHttp(res, body);
    }

    return this.parseJson<T>(res);
  }

  async postJson<T = unknown>(url: string, body: unknown, options?: FetchPlusOptions): Promise<T> {
    const headers = this.buildHeaders(options?.token, {
      "Content-Type": "application/json",
    });
    const res = await fetch(url, {
      method: "POST",
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: options?.signal,
    });

    if (!res.ok) {
      const text = await res.text().catch(() => undefined);
      throw ApiError.fromHttp(res, text);
    }

    return this.parseJson<T>(res);
  }

  async patchJson<T = unknown>(url: string, body: unknown, options?: FetchPlusOptions): Promise<T> {
    const headers = this.buildHeaders(options?.token, {
      "Content-Type": "application/json",
    });
    const res = await fetch(url, {
      method: "PATCH",
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: options?.signal,
    });

    if (!res.ok) {
      const text = await res.text().catch(() => undefined);
      throw ApiError.fromHttp(res, text);
    }

    return this.parseJson<T>(res);
  }

  private async parseJson<T>(res: Response): Promise<T> {
    const text = await res.text();
    if (!text) return undefined as unknown as T;
    return JSON.parse(text) as T;
  }
}

/** Singleton instance */
export const fetchPlus = new FetchPlus();
