import { Link } from "@fluentui/react-components";
import { useMount } from "ahooks";
import { ReactNode, useEffect } from "react";
import { AuthProvider, useAuth } from "react-oidc-context";
import { setTokenRefresher } from "~/Helpers/fetchPlus";
import { Logger } from "~/Helpers/Logger";
import { useAppToast } from "~/Helpers/useAppToast";
import { useRouter } from "../Router";
import { UserMgr } from "./UserMgr";

const userMgr = new UserMgr();

setTokenRefresher(async () => {
  const user = await userMgr.signinSilent();
  return user?.access_token ?? null;
});

/**
 * @author Aloento
 * @since 1.0.0
 * @version 1.0.0
 */
export function OIDCProvider({ children }: { children: ReactNode }): ReactNode {
  return (
    <AuthProvider userManager={userMgr}>
      <AuthHandler />
      {children}
    </AuthProvider>
  );
}

const log = new Logger("Auth");

/**
 * @author Aloento
 * @since 1.0.0
 * @version 1.0.0
 */
function AuthHandler() {
  const auth = useAuth();
  const { Paths } = useRouter();
  const toast = useAppToast();

  useMount(() => {
    if (Paths.at(0) === "signin-oidc") {
      userMgr.signinCallback();
      return;
    }
  });

  function dispatch() {
    toast.showWarning("Login Expired", {
      action: (
        <Link onClick={() => auth.signinRedirect()}>
          Login Again
        </Link>
      ),
    });

    auth.signoutSilent();
  }

  useEffect(() => {
    if (auth.error)
      log.warn(auth.error);

    if (auth.user?.expired) {
      auth.signinSilent().then((user) => {
        if (!user) dispatch();
      }).catch(() => dispatch())
    }
  }, [auth.error, auth.user]);

  return null;
}
