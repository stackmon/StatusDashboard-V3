import { useMount, useUpdateEffect } from "ahooks";
import { ReactNode } from "react";
import { AuthProvider, hasAuthParams, useAuth } from "react-oidc-context";
import { Common } from "~/Helpers/Entities";
import { Logger } from "~/Helpers/Logger";
import { useRouter } from "../Router";
import { UserMgr } from "./UserMgr";

/**
 * @author Aloento
 * @since 1.0.0
 * @version 1.0.0
 */
export function OIDCProvider({ children }: { children: ReactNode }): ReactNode {
  const { Reload } = useRouter();

  return (
    <AuthProvider
      onSigninCallback={() => Reload("/")}
      onSignoutCallback={() => Reload("/")}
      matchSignoutCallback={(args) => window.location.href === args.post_logout_redirect_uri}
      userManager={new UserMgr()}
    >
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
  const auth = (Common.AuthSlot = useAuth());
  const { Paths, Rep } = useRouter();

  useMount(() => {
    if (Paths.at(0) === "Logout") {
      auth.removeUser();
      return Rep("/");
    }

    if (
      !hasAuthParams() &&
      !auth.isAuthenticated &&
      !auth.activeNavigator &&
      !auth.isLoading
    )
      auth.signinRedirect();
  });

  useUpdateEffect(() => {
    if (auth.error) log.warn(auth.error);
  }, [auth.error]);

  return null;
}
