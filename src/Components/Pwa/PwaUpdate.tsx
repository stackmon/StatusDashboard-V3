import { useEffect, useRef } from "react";
import { useRegisterSW } from "virtual:pwa-register/react";
import { Logger } from "~/Helpers/Logger";
import { useAppToast } from "~/Helpers/useAppToast";
import { usePwaInstall } from "./usePwaInstall";

const log = new Logger("PWA");

const UPDATE_INTERVAL = 60 * 60 * 1000;
const FOREGROUND_THROTTLE = 15 * 60 * 1000;
const APPLY_TIMEOUT = 5000;

/**
 * @author Aloento
 * @since 1.6.0
 * @version 1.1.0
 */
export function PwaUpdate() {
  const toast = useAppToast();
  const prompted = useRef(false);
  const checkedAt = useRef(0);
  const registration = useRef<ServiceWorkerRegistration | null>(null);

  const {
    offlineReady: [offlineReady],
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(swUrl, reg) {
      registration.current = reg;
      log.info(`Service worker registered from ${swUrl}`);

      if (!reg) return;

      // Browsers throttle the update check they run on navigation, so ask for
      // one explicitly on every page load.
      checkForUpdate(reg);
    },
    onRegisterError(error) {
      log.error("Service worker registration failed", error);
    },
  });

  function checkForUpdate(reg: ServiceWorkerRegistration | null = registration.current) {
    checkedAt.current = Date.now();
    reg?.update()
      .catch(error => log.warn("Service worker update check failed", error));
  }

  useEffect(() => {
    const timer = setInterval(() => checkForUpdate(), UPDATE_INTERVAL);

    function onVisibilityChange() {
      if (document.visibilityState !== "visible" || !navigator.onLine) return;
      if (Date.now() - checkedAt.current < FOREGROUND_THROTTLE) return;
      checkForUpdate();
    }

    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, []);

  // The worker installed for a new release waits until every tab it controls is
  // gone, which a reload does not do: the next load finds the same waiting
  // worker and prompts again. Ask it to take over and reload once it has.
  function applyUpdate() {
    if (!registration.current?.waiting) {
      window.location.reload();
      return;
    }

    let reloading = false;

    function reload() {
      if (reloading) return;
      reloading = true;
      window.location.reload();
    }

    navigator.serviceWorker.addEventListener("controllerchange", reload, { once: true });
    void updateServiceWorker(true);

    // Activation does not always reach the page: a worker built without
    // `clients.claim()` never claims it, and the browser can hold the takeover
    // while the tab keeps the current worker busy. The reload retires the tab
    // either way, which is what lets the new worker finish activating.
    window.setTimeout(reload, APPLY_TIMEOUT);
  }

  useEffect(() => {
    if (!needRefresh || prompted.current) return;
    prompted.current = true;

    toast.showWarning("A new version is available.", {
      body: "Reload to switch to the latest build of the dashboard.",
      action: (
        <button
          onClick={() => applyUpdate()}
          className="rounded bg-blue-600 px-3 py-1 text-xs font-medium text-white hover:bg-blue-700 cursor-pointer"
        >
          Reload
        </button>
      ),
    });
  }, [needRefresh]);

  usePwaInstall(offlineReady);

  return null;
}
