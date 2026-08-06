import { useEffect, useRef, useState } from "react";

/**
 * @author Aloento
 * @since 1.5.0
 * @version 1.0.0
 */
export function useNetworkStatus(onRecovery?: () => void) {
  const [isOnline, setIsOnline] = useState(() => navigator.onLine);
  const [wasOffline, setWasOffline] = useState(false);
  const lastOnlineAt = useRef<Date | null>(new Date());
  const recoveryCalled = useRef(false);

  useEffect(() => {
    function handleOnline() {
      setIsOnline(true);
      lastOnlineAt.current = new Date();
      setWasOffline(true);
      recoveryCalled.current = false;
    }

    function handleOffline() {
      setIsOnline(false);
      recoveryCalled.current = false;
    }

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Trigger onRecovery exactly once when coming back online
  useEffect(() => {
    if (isOnline && wasOffline && !recoveryCalled.current && onRecovery) {
      recoveryCalled.current = true;
      onRecovery();
    }
  }, [isOnline, wasOffline, onRecovery]);

  // Reset wasOffline after recovery has been processed
  useEffect(() => {
    if (isOnline && wasOffline && recoveryCalled.current) {
      // Small delay so consumers can read wasOffline before reset
      const timer = setTimeout(() => setWasOffline(false), 500);
      return () => clearTimeout(timer);
    }
  }, [isOnline, wasOffline]);

  return {
    isOnline,
    wasOffline,
    lastOnlineAt: lastOnlineAt.current,
  };
}
