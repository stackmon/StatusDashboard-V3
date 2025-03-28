import { useMount } from "ahooks";
import { useState } from "react";
import { useAuth } from "react-oidc-context";

/**
 * @author Aloento
 * @since 1.0.0
 * @version 0.1.0
 */
export function useExpireMin() {
  const auth = useAuth();
  const [exp, setExp] = useState<string>();

  function calcExp() {
    const expiresIn = auth.user?.expires_in || 0;
    setExp(expiresIn > 0 ? `${Math.round(expiresIn / 60)} mins` : "Expired");
  }

  useMount(() => {
    calcExp();
    const i = setInterval(() => calcExp(), 10000);
    return () => clearInterval(i);
  });

  return exp;
}
