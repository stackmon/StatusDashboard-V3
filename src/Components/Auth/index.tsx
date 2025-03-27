import { useMount, useUpdateEffect } from "ahooks";
import { ReactNode } from "react";
import { AuthProvider, useAuth } from "react-oidc-context";
import { Logger } from "~/Helpers/Logger";
import { useRouter } from "../Router";
import { UserMgr } from "./UserMgr";

const userMgr = new UserMgr();

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
  const { Paths, Reload } = useRouter();

  useMount(() => {
    if (Paths.at(0) === "signin-oidc") {
      return userMgr.signinCallback();
    }

    if (Paths.at(0) === "signout-callback-oidc") {
      auth.removeUser();
      return Reload("/");
    }
  });

  useUpdateEffect(() => {
    if (auth.error)
      log.warn(auth.error);
  }, [auth.error]);

  return null;
}
