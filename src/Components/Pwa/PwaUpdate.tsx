import { useEffect, useRef } from "react";
import { useRegisterSW } from "virtual:pwa-register/react";
import { Logger } from "~/Helpers/Logger";
import { useAppToast } from "~/Helpers/useAppToast";
import { usePwaInstall } from "./usePwaInstall";

const log = new Logger("PWA");

const UPDATE_INTERVAL = 60 * 60 * 1000;
const FOREGROUND_THROTTLE = 15 * 60 * 1000;

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

  // The document is fetched from the network on every load, so reloading picks
  // up the current build without waiting for the worker to take over.
  function applyUpdate() {
    window.location.reload();
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
