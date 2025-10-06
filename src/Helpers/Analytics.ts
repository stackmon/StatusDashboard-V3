import { useMount } from "ahooks";

/**
 * @author Aloento
 * @since 1.2.0
 * @version 0.1.0
 */
export function useConditionalAnalytics() {
  useMount(() => {
    const href = window.location.href;
    if (/test/i.test(href)) return;

    const script = document.createElement("script");
    script.async = true;
    script.src = "https://analytics.otc-service.com/script.js";
    script.setAttribute("data-website-id", "70123d13-26d0-4f29-864c-6535801f8b50");
    document.head.appendChild(script);
  });
}
