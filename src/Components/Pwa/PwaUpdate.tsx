import { useEffect, useRef } from "react";
import { useRegisterSW } from "virtual:pwa-register/react";
import { Logger } from "~/Helpers/Logger";
import { useAppToast } from "~/Helpers/useAppToast";

const log = new Logger("PWA");

const UPDATE_INTERVAL = 60 * 60 * 1000;
const FOREGROUND_THROTTLE = 15 * 60 * 1000;

/**
 * @author Aloento
 * @since 1.6.0
 * @version 1.0.0
 */
export function PwaUpdate() {
  const toast = useAppToast();
  const prompted = useRef(false);
  const checkedAt = useRef(0);
  const registration = useRef<ServiceWorkerRegistration>(null);

  const {
    offlineReady: [offlineReady],
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(swUrl, reg) {
      registration.current = reg!;
      log.info(`Service worker registered from ${swUrl}`);
    },
    onRegisterError(error) {
      log.error("Service worker registration failed", error);
    },
  });

  useEffect(() => {
    function check() {
      checkedAt.current = Date.now();
      registration.current?.update()
        .catch(error => log.warn("Service worker update check failed", error));
    }

    const timer = setInterval(check, UPDATE_INTERVAL);

    function onVisibilityChange() {
      if (document.visibilityState !== "visible" || !navigator.onLine) return;
      if (Date.now() - checkedAt.current < FOREGROUND_THROTTLE) return;
      check();
    }

    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, []);

  useEffect(() => {
    if (!needRefresh || prompted.current) return;
    prompted.current = true;

    toast.showWarning("A new version is available.", {
      body: "Reload to switch to the latest build of the dashboard.",
      action: (
        <button
          onClick={() => updateServiceWorker(true)}
          className="rounded bg-blue-600 px-3 py-1 text-xs font-medium text-white hover:bg-blue-700 cursor-pointer"
        >
          Reload
        </button>
      ),
    });
  }, [needRefresh]);

  useEffect(() => {
    if (!offlineReady) return;

    toast.showInfo("Ready to work offline.", {
      body: "The dashboard is cached on this device and opens without a network.",
    });
  }, [offlineReady]);

  return null;
}
