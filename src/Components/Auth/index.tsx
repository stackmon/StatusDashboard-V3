import { Link } from "@fluentui/react-components";
import { UserManager } from "oidc-client-ts";
import { ReactNode, useEffect } from "react";
import { AuthProvider, useAuth } from "react-oidc-context";
import { setTokenRefresher } from "~/Helpers/fetchPlus";
import { Logger } from "~/Helpers/Logger";
import { useAppToast } from "~/Helpers/useAppToast";
import { useRouter } from "../Router";
import { Roles } from "./With";

const projectId = process.env.SD_PROJECT_ID!;

// Zitadel only asserts the roles a scope asks for and only puts the project id
// into the audience of the access token when its scope is requested.
const scope = [
  "openid", "profile", "email", "offline_access",
  ...Object.values(Roles).map(role => `urn:zitadel:iam:org:project:role:${role}`),
  `urn:zitadel:iam:org:project:id:${projectId}:aud`
];

const userMgr = new UserManager({
  authority: process.env.SD_AUTHORITY_URL!,
  client_id: process.env.SD_CLIENT_ID!,
  redirect_uri: `${window.location.origin}/signin-oidc`,
  post_logout_redirect_uri: `${window.location.origin}/`,
  scope: scope.join(" "),
  revokeTokensOnSignout: true,
  automaticSilentRenew: true,
  accessTokenExpiringNotificationTimeInSeconds: 60
});

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
 * @version 0.2.0
 */
function AuthHandler() {
  const auth = useAuth();
  const { Paths, Rep } = useRouter();
  const toast = useAppToast();

  function sessionLost() {
    toast.showWarning("Login Expired", {
      body: "Your session cannot be renewed automatically.",
      action: (
        <Link onClick={() => auth.signinRedirect()}>
          Login Again
        </Link>
      ),
    });

    auth.removeUser();
  }

  useEffect(() => {
    if (!auth.error) return;

    log.warn(auth.error);

    // A failed renewal cannot recover on its own, a failed sign-out still has to
    // drop the session the browser kept.
    if (auth.error.source === "renewSilent") sessionLost();
    else if (auth.error.source === "signoutRedirect") auth.removeUser();
  }, [auth.error]);

  // The token expired before the automatic renewal could catch it, which happens
  // when the tab was suspended past its expiry.
  useEffect(() => {
    if (!auth.user?.expired) return;

    auth.signinSilent().then((user) => {
      if (!user) sessionLost();
    });
  }, [auth.user]);

  // The sign-in callback is a route of its own, the authorization response has to
  // leave the URL once the library consumed it.
  useEffect(() => {
    if (Paths.at(0) !== "signin-oidc" || auth.isLoading) return;

    if (auth.error) {
      toast.showWarning("Login Failed", { body: auth.error.message });
    }

    Rep("/");
  }, [auth.error, auth.isLoading, Paths]);

  return null;
}
