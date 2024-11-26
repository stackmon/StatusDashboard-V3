import { useMount, useUpdateEffect } from "ahooks";
import { WebStorageStateStore } from "oidc-client-ts";
import { ReactNode } from "react";
import { AuthProvider, hasAuthParams, useAuth } from "react-oidc-context";
import { Common } from "~/Helpers/Entities";
import { Logger } from "~/Helpers/Logger";
import { useRouter } from "../Router";

/**
 * @author Aloento
 * @since 1.0.0
 * @version 1.0.0
 */
export function OIDCProvider({ children }: { children: ReactNode }): ReactNode {
  const { Reload } = useRouter();

  return (
    <AuthProvider
      client_id={process.env.SD_CLIENT_ID}
      scope="openid profile email"
      userStore={new WebStorageStateStore({ store: window.localStorage })}
      onSigninCallback={() => Reload("/")}
      onSignoutCallback={() => Reload("/")}
      matchSignoutCallback={(args) => window.location.href === args.post_logout_redirect_uri}
      authority={process.env.SD_AUTHORITY_URL}
      post_logout_redirect_uri={process.env.SD_LOGOUT_REDIRECT_URL}
      redirect_uri={process.env.SD_REDIRECT_URL}
      client_secret={process.env.SD_AUTH_SECRET}
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
