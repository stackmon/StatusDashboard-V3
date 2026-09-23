import { useEffect, useMemo, useRef, useState } from "react";
import { Dic } from "~/Helpers/Entities";
import { Logger } from "~/Helpers/Logger";
import { useAppToast } from "~/Helpers/useAppToast";

const log = new Logger("PWA");

interface InstallPromptEvent extends Event {
  prompt(): Promise<void>;
  readonly userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const OFFERED_KEY = "pwaInstallOffered";
const HINT_TIMEOUT = 10_000;
const CAN_PROMPT = "onbeforeinstallprompt" in window;

function isStandalone(): boolean {
  return window.matchMedia("(display-mode: standalone)").matches
    || (navigator as Navigator & { standalone?: boolean }).standalone === true;
}

function isIOSSafari(): boolean {
  const ua = navigator.userAgent;
  if (/CriOS|FxiOS|EdgiOS|OPiOS/.test(ua)) return false;

  return /iPad|iPhone|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1);
}

/**
 * @author Aloento
 * @since 1.6.0
 * @version 1.0.0
 */
export function usePwaInstall(Ready: boolean) {
  const toast = useAppToast();
  const [prompt, setPrompt] = useState<InstallPromptEvent | null>(null);
  const offered = useRef(false);

  const Cached = useMemo(() => navigator.serviceWorker?.controller != null, []);

  useEffect(() => {
    function onInstallAvailable(event: Event) {
      event.preventDefault();
      setPrompt(event as InstallPromptEvent);
    }

    window.addEventListener("beforeinstallprompt", onInstallAvailable);
    return () => window.removeEventListener("beforeinstallprompt", onInstallAvailable);
  }, []);

  useEffect(() => {
    if (offered.current || isStandalone() || localStorage.getItem(OFFERED_KEY)) return;

    function offer(body: string, timeout: number, action?: React.ReactNode) {
      offered.current = true;
      localStorage.setItem(OFFERED_KEY, "1");

      const options = { body, timeout, action };
      toast.showInfo(`Install ${Dic.App}`, options);
    }

    async function install() {
      const event = prompt;
      if (!event) return;

      // The prompt can only be replayed once.
      setPrompt(null);

      try {
        await event.prompt();
        const { outcome } = await event.userChoice;
        log.info(`Install prompt ${outcome}`);
      } catch (error) {
        log.warn("The install prompt could not be shown", error);
      }
    }

    if (isIOSSafari()) {
      // Safari only installs through its own menu, so the instruction is the whole offer.
      if (Ready || Cached)
        offer("Tap Share, then “Add to Home Screen”, to open the dashboard as an app.", HINT_TIMEOUT);

      return;
    }

    if (CAN_PROMPT) {
      // The browser decides when the dashboard may be installed, until then there is nothing to offer.
      if (!prompt) return;

      offer(
        "Open the dashboard like an app, straight from your home screen, and keep reading it while you are offline.",
        -1,
        <button
          onClick={install}
          className="rounded bg-blue-600 px-3 py-1 text-xs font-medium text-white hover:bg-blue-700 cursor-pointer"
        >
          Install
        </button>
      );

      return;
    }

    // There is no install to offer here, so the toast stays what it was before the offer existed.
    if (Ready)
      toast.showInfo("Ready to work offline.", {
        body: "The dashboard is cached on this device and opens without a network.",
      });
  }, [Ready, prompt]);
}
