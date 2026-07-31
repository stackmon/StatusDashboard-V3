import { ScaleLoadingSpinner } from "@telekom/scale-components-react";
import { type ReactNode } from "react";
import type { ApiError } from "~/Helpers/ApiError";
import { getUserFriendlyMessage } from "~/Helpers/ApiError";

/**
 * Full-page loading view.
 */
export function LoadingView({ text = "Loading..." }: { text?: string }) {
  return (
    <div className="flex min-h-[40vh] items-center justify-center">
      <ScaleLoadingSpinner size="large" text={text} />
    </div>
  );
}

/**
 * Empty state with icon and optional action.
 */
export function EmptyView({
  text = "No data available",
  action,
}: {
  text?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16 text-gray-500">
      <svg
        className="h-16 w-16"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
        />
      </svg>
      <p className="text-lg font-medium">{text}</p>
      {action && <div>{action}</div>}
    </div>
  );
}

/**
 * Full-page error state with retry button.
 */
export function ErrorView({
  error,
  onRetry,
}: {
  error?: ApiError | Error;
  onRetry?: () => void;
}) {
  const message = error
    ? error instanceof Error
      ? error.message
      : "Unknown error"
    : "An error occurred.";

  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16">
      <div className="flex items-center justify-center h-16 w-16 rounded-full bg-red-100">
        <svg
          className="h-8 w-8 text-red-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
          />
        </svg>
      </div>
      <p className="text-lg font-medium text-gray-900">Something went wrong</p>
      <p className="text-sm text-gray-500 max-w-md text-center">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 cursor-pointer"
        >
          Retry
        </button>
      )}
    </div>
  );
}

/**
 * Non-blocking error banner displayed at the top of a page.
 * The page content below remains visible and interactive.
 */
export function ErrorBanner({
  error,
  onRetry,
  onDismiss,
}: {
  error?: ApiError | Error;
  onRetry?: () => void;
  onDismiss?: () => void;
}) {
  const message = error
    ? error instanceof Error
      ? "isNetworkError" in error
        ? getUserFriendlyMessage(error as ApiError)
        : error.message
      : "An error occurred."
    : "An error occurred.";

  return (
    <div
      role="alert"
      aria-live="polite"
      className="flex items-center justify-between gap-4 rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm"
    >
      <div className="flex items-center gap-3 min-w-0">
        <svg
          className="h-5 w-5 shrink-0 text-red-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
          />
        </svg>
        <span className="text-red-700 truncate">{message}</span>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {onRetry && (
          <button
            onClick={onRetry}
            className="rounded bg-red-600 px-3 py-1 text-xs font-medium text-white hover:bg-red-700 cursor-pointer"
          >
            Retry
          </button>
        )}
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="rounded px-2 py-1 text-xs text-red-500 hover:text-red-700 hover:bg-red-100 cursor-pointer border-0 bg-transparent"
            aria-label="Dismiss error"
          >
            Dismiss
          </button>
        )}
      </div>
    </div>
  );
}
