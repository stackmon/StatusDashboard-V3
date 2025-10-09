import { useMount } from "ahooks";

/**
 * @author Aloento
 * @since 1.2.0
 * @version 0.1.0
 */
export function useAnalytics() {
  useMount(() => {
    const { hostname, href } = window.location;

    if (!/otc-service\.com$/i.test(hostname) || /test/i.test(href)) {
      localStorage.setItem('umami.disabled', "1");
      return;
    }

    localStorage.removeItem('umami.disabled');
  });
}
