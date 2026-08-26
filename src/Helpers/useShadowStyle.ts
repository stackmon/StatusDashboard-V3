import { useEffect, useRef, type RefObject } from "react";

const MARKER = "data-shadow-inject";

let uidSeq = 0;

/**
 * @author Aloento
 * @since 1.5.0
 * @version 1.0.0
 */
export type ShadowRootSource =
  | RefObject<HTMLElement | null>
  | (() => ShadowRoot | null);

function resolveRoot(source: ShadowRootSource): ShadowRoot | null {
  if (typeof source === "function") {
    return source();
  }
  return source.current?.shadowRoot ?? null;
}

/**
 * @author Aloento
 * @since 1.5.0
 * @version 1.0.0
 */
export function useShadowStyle(source: ShadowRootSource, css: string) {
  const uid = useRef<string>(null);
  if (!uid.current) {
    uid.current = `${MARKER}-${++uidSeq}`;
  }

  useEffect(() => {
    const selector = `style[${uid.current}]`;

    const inject = () => {
      const root = resolveRoot(source);
      if (!root) {
        return false;
      }

      root.querySelectorAll(selector).forEach((s) => s.remove());

      const style = document.createElement("style");
      style.setAttribute(MARKER, uid.current!);
      style.textContent = css;
      root.appendChild(style);
      return true;
    };

    const cleanup = () => {
      const root = resolveRoot(source);
      root?.querySelectorAll(selector).forEach((s) => s.remove());
    };

    // Common case: the shadow root already exists.
    if (inject()) {
      return cleanup;
    }

    // The host may not be upgraded yet (its shadow root is attached lazily),
    // so watch the element until the root shows up.
    if (typeof source !== "function") {
      const host = source.current;
      if (host) {
        const observer = new MutationObserver(() => {
          if (inject()) {
            observer.disconnect();
          }
        });
        observer.observe(host, { attributes: true, childList: true, subtree: true });

        return () => {
          observer.disconnect();
          cleanup();
        };
      }
    }

    return cleanup;
  }, [source, css]);
}
