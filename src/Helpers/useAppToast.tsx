import {
  Toast,
  ToastBody,
  ToastFooter,
  ToastTitle,
  ToastTrigger,
  useToastController,
} from "@fluentui/react-components";
import { useRef } from "react";

type ToastIntent = "success" | "warning" | "error" | "info";

interface ToastOptions {
  /** Auto-dismiss timeout in ms. -1 = never auto-dismiss. */
  timeout?: number;
  /** Optional action element rendered in the toast footer */
  action?: React.ReactNode;
}

const DEDUP_WINDOW_MS = 30_000;

/**
 * @author Aloento
 * @since 1.5.0
 * @version 1.0.0
 */
export function useAppToast() {
  const { dispatchToast } = useToastController();
  const lastErrors = useRef<Map<string, number>>(new Map());

  /** Check if this fingerprint was already shown within the dedup window */
  function isDuplicate(fingerprint: string): boolean {
    const lastTime = lastErrors.current.get(fingerprint);
    if (lastTime && Date.now() - lastTime < DEDUP_WINDOW_MS) {
      return true;
    }
    lastErrors.current.set(fingerprint, Date.now());
    // Cleanup old entries periodically
    if (lastErrors.current.size > 20) {
      const cutoff = Date.now() - DEDUP_WINDOW_MS;
      for (const [key, value] of lastErrors.current) {
        if (value < cutoff) lastErrors.current.delete(key);
      }
    }
    return false;
  }

  function show(title: string, intent: ToastIntent, opts?: ToastOptions & { body?: string; fingerprint?: string }) {
    if (opts?.fingerprint && isDuplicate(opts.fingerprint)) return;

    const timeout = opts?.timeout;
    dispatchToast(
      <Toast>
        <ToastTitle>{title}</ToastTitle>
        {opts?.body && <ToastBody>{opts.body}</ToastBody>}
        {opts?.action && (
          <ToastFooter>
            {opts.action}
            <ToastTrigger>
              <button className="text-blue-600 hover:underline cursor-pointer border-0 bg-transparent text-sm">Dismiss</button>
            </ToastTrigger>
          </ToastFooter>
        )}
      </Toast>,
      {
        intent,
        timeout: timeout,
        position: "bottom-end",
      }
    );
  }

  return {
    /** Error toast (8s timeout, supports dedup via fingerprint) */
    showError(title: string, opts?: { body?: string; timeout?: number; fingerprint?: string; action?: React.ReactNode }) {
      show(title, "error", { ...opts, timeout: opts?.timeout ?? 8000 });
    },
    /** Warning toast (never auto-dismiss by default) */
    showWarning(title: string, opts?: { body?: string; timeout?: number; action?: React.ReactNode }) {
      show(title, "warning", { ...opts, timeout: opts?.timeout ?? -1 });
    },
    /** Success toast (3s auto-dismiss) */
    showSuccess(title: string, opts?: { body?: string; timeout?: number }) {
      show(title, "success", { ...opts, timeout: opts?.timeout ?? 3000 });
    },
    /** Info toast (5s auto-dismiss) */
    showInfo(title: string, opts?: { body?: string; timeout?: number }) {
      show(title, "info", { ...opts, timeout: opts?.timeout ?? 5000 });
    },
  };
}
