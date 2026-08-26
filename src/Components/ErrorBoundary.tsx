import { ScaleLoadingSpinner } from "@telekom/scale-components-react";
import { useCallback, useRef } from "react";
import { ErrorBoundary, type FallbackProps } from "react-error-boundary";

/**
 * @author Aloento
 * @since 1.5.0
 * @version 1.0.0
 */
function RootFallback({ error, resetErrorBoundary }: FallbackProps) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-zinc-50 p-8">
      <div className="flex flex-col items-center gap-4 rounded-lg bg-white p-8 shadow-md max-w-md text-center">
        <div className="text-red-500 text-5xl">!</div>
        <h1 className="text-xl font-semibold text-gray-900">Something went wrong</h1>
        <p className="text-sm text-gray-600 break-all">
          {error instanceof Error ? error.message : "An unexpected error occurred."}
        </p>
        <div className="flex gap-3">
          <button
            onClick={resetErrorBoundary}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 cursor-pointer"
          >
            Reload
          </button>
          <a href="/" className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
            Return Home
          </a>
        </div>
      </div>
    </div>
  );
}

/**
 * @author Aloento
 * @since 1.5.0
 * @version 1.0.0
 */
function DataLoadFallback({ error, resetErrorBoundary }: FallbackProps) {
  const retried = useRef(false);

  const handleRetry = useCallback(() => {
    if (!retried.current) {
      retried.current = true;
      resetErrorBoundary();
      // Reset after a short delay to allow re-entry
      setTimeout(() => { retried.current = false; }, 2000);
    }
  }, [resetErrorBoundary]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-zinc-50 p-8">
      <ScaleLoadingSpinner size="large" text="Loading data..." />
      <div className="flex flex-col items-center gap-3 text-center">
        <p className="text-sm text-red-600">
          {error instanceof Error ? error.message : "Failed to load data."}
        </p>
        <div className="flex gap-3">
          <button
            onClick={handleRetry}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 cursor-pointer"
          >
            Retry
          </button>
          <a href="/" className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
            Return Home
          </a>
        </div>
      </div>
    </div>
  );
}

/**
 * @author Aloento
 * @since 1.5.0
 * @version 1.0.0
 */
export interface ErrorBoundaryProps {
  children: React.ReactNode;
  /** Use the data-load variant (includes spinner + simpler UI) */
  variant?: "root" | "data";
  /** Called when the error boundary resets */
  onReset?: () => void;
}

/**
 * @author Aloento
 * @since 1.5.0
 * @version 1.0.0
 */
export function AppErrorBoundary({ children, variant = "root", onReset }: ErrorBoundaryProps) {
  return (
    <ErrorBoundary
      FallbackComponent={variant === "data" ? DataLoadFallback : RootFallback}
      onReset={onReset}
    >
      {children}
    </ErrorBoundary>
  );
}
