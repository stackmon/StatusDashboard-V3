import { Link, Toast, ToastFooter, ToastTitle, ToastTrigger, useToastController } from "@fluentui/react-components";
import { useMount } from "ahooks";
import { ReactNode, useEffect } from "react";
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
  const { dispatchToast } = useToastController();

  useMount(() => {
    if (Paths.at(0) === "signin-oidc") {
      return userMgr.signinCallback();
    }

    if (Paths.at(0) === "signout-callback-oidc") {
      auth.removeUser();
      return Reload("/");
    }
  });

  useEffect(() => {
    if (auth.error)
      log.warn(auth.error);

    if (auth.user?.expires_in) {
      const i = setInterval(() => {
        if (auth.user?.expired) {
          dispatchToast(
            <Toast>
              <ToastTitle>
                Login Expired
              </ToastTitle>

              <ToastFooter>
                <Link
                  onClick={() => auth.signinRedirect()}>
                  Login Again
                </Link>

                <ToastTrigger>
                  <Link
                    href="/"
                    onClick={() => auth.signoutSilent()}>
                    Dismiss
                  </Link>
                </ToastTrigger>
              </ToastFooter>
            </Toast>,
            { intent: "warning", timeout: -1 }
          );

          clearInterval(i);
        }
      }, (auth.user.expires_in + 5) * 1000);

      return () => clearInterval(i);
    }
  }, [auth.error, auth.user]);

  return null;
}
