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
      client_id={
        process.env.NODE_ENV === "development"
          ? "newsd2"
          : "status-dashboard"
      }
      scope="openid profile email"
      userStore={new WebStorageStateStore({ store: window.localStorage })}
      onSigninCallback={() => Reload("/")}
      onSignoutCallback={() => Reload("/")}
      matchSignoutCallback={(args) => window.location.href === args.post_logout_redirect_uri}
      authority={
        process.env.NODE_ENV === "development"
          ? "http://80.158.108.251:8080/realms/sd2"
          : "https://keycloak.eco.tsi-dev.otc-service.com/realms/eco"
      }
      post_logout_redirect_uri={
        process.env.NODE_ENV === "development"
          ? "http://localhost:9000/signout-callback-oidc"
          : "https://sd3.eco.tsi-dev.otc-service.com/signout-callback-oidc"
      }
      redirect_uri={
        process.env.NODE_ENV === "development"
          ? "http://localhost:9000/signin-oidc"
          : "https://sd3.eco.tsi-dev.otc-service.com/signin-oidc"
      }
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
