import { useRequest } from "ahooks";
import { useEffect, useRef } from "react";
import { ApiError, errorFingerprint, getUserFriendlyMessage } from "./ApiError";
import { Logger } from "./Logger";
import { useAppToast } from "./useAppToast";

const log = new Logger("API");

export interface UseApiRequestOptions<TData, TParams extends unknown[]> {
  /** Fire-and-forget or manual trigger */
  manual?: boolean;
  /** ahooks cache key (for dedup / stale-while-revalidate) */
  cacheKey?: string;
  /** Auto-retry count (ahooks built-in) */
  retryCount?: number;
  /** Polling interval in ms */
  pollingInterval?: number;
  /** Dependencies that trigger a refresh */
  refreshDeps?: unknown[];
  /** Called when the request succeeds */
  onSuccess?: (data: TData, params: TParams) => void;
  /** Called when the request fails (in addition to built-in toast/log) */
  onError?: (err: ApiError, params: TParams) => void;
  /** Automatically show an error toast. Defaults to true. */
  showErrorToast?: boolean;
  /** Custom title for the error toast */
  errorToastTitle?: string;
}

/**
 * Unified wrapper around ahooks `useRequest` for API calls.
 *
 * - Automatically logs errors and shows toast (deduplicated via fingerprint).
 * - Manages AbortController lifecycle (cancels on unmount).
 * - Preserves `mutate` from ahooks for optimistic updates.
 * - Clears error state on successful invocations.
 *
 * @author Aloento
 * @since 3.0.0
 * @version 1.0.0
 */
export function useApiRequest<TData, TParams extends unknown[] = []>(
  service: (signal: AbortSignal, ...args: TParams) => Promise<TData>,
  options?: UseApiRequestOptions<TData, TParams>
) {
  const toast = useAppToast();
  const abortRef = useRef<AbortController | null>(null);
  const showErrorToast = options?.showErrorToast ?? true;

  // Wrap service to inject AbortSignal
  async function wrappedService(...args: TParams): Promise<TData> {
    // Abort any in-flight request
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    return service(controller.signal, ...args);
  }

  const result = useRequest(wrappedService, {
    manual: options?.manual,
    cacheKey: options?.cacheKey,
    retryCount: options?.retryCount,
    pollingInterval: options?.pollingInterval,
    refreshDeps: options?.refreshDeps,
    onSuccess: (data, params) => {
      options?.onSuccess?.(data, params);
    },
    onError: (err: unknown, params) => {
      const apiError = err instanceof ApiError
        ? err
        : ApiError.fromNetwork(err);

      // Log
      log.error(apiError.message, apiError);

      // Toast (deduplicated)
      if (showErrorToast) {
        const fp = errorFingerprint(apiError);
        const title = options?.errorToastTitle ?? "Error";
        const body = getUserFriendlyMessage(apiError);
        toast.showError(title, { body, fingerprint: fp });
      }

      // Custom callback
      options?.onError?.(apiError, params);
    },
  });

  // Cancel on unmount
  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  return {
    data: result.data,
    error: result.error ? (
      result.error instanceof ApiError ? result.error : ApiError.fromNetwork(result.error)
    ) : undefined,
    loading: result.loading,
    runAsync: result.runAsync as (...args: TParams) => Promise<TData>,
    run: result.run as (...args: TParams) => void,
    refresh: result.refresh,
    mutate: result.mutate,
    cancel: result.cancel,
  };
}
