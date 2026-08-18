import { ApiError } from "./ApiError";

export interface FetchPlusOptions {
  /** Bearer token for Authorization header */
  token?: string;
  /** AbortSignal for request cancellation */
  signal?: AbortSignal;
}

export type TokenRefresher = () => Promise<string | null>;

let refresher: TokenRefresher | null = null;

export function setTokenRefresher(fn: TokenRefresher | null): void {
  refresher = fn;
}

/**
 * @author Aloento
 * @since 1.6.0
 * @version 1.0.0
 */
class FetchPlus {
  private async request<T>(url: string, init: RequestInit, options?: FetchPlusOptions, retried = false): Promise<T> {
    const headers = new Headers(init.headers);
    if (options?.token) {
      headers.set("Authorization", `Bearer ${options.token}`);
    }

    const res = await fetch(url, { ...init, headers });

    if (res.status === 401 && !retried && options?.token && refresher) {
      let newToken: string | null = null;
      try {
        newToken = await refresher();
      } catch {
        newToken = null;
      }

      if (newToken) {
        headers.set("Authorization", `Bearer ${newToken}`);
        return this.request<T>(url, { ...init, headers }, { ...options, token: newToken }, true);
      }
    }

    if (!res.ok) {
      const body = await res.text().catch(() => undefined);
      throw ApiError.fromHttp(res, body);
    }

    return this.parseJson<T>(res);
  }

  getJson<T = unknown>(url: string, options?: FetchPlusOptions): Promise<T> {
    return this.request<T>(url, { signal: options?.signal }, options);
  }

  postJson<T = unknown>(url: string, body: unknown, options?: FetchPlusOptions): Promise<T> {
    return this.request<T>(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: options?.signal,
    }, options);
  }

  patchJson<T = unknown>(url: string, body: unknown, options?: FetchPlusOptions): Promise<T> {
    return this.request<T>(url, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: options?.signal,
    }, options);
  }

  private async parseJson<T>(res: Response): Promise<T> {
    const text = await res.text();
    if (!text) return undefined as unknown as T;
    return JSON.parse(text) as T;
  }
}

/** Singleton instance */
export const fetchPlus = new FetchPlus();
