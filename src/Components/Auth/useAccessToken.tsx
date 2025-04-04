import { Link, Toast, ToastFooter, ToastTitle, useToastController } from "@fluentui/react-components";
import { useAuth } from "react-oidc-context";

/**
 * @author Aloento
 * @since 1.0.0
 * @version 0.1.0
 */
export function useAccessToken() {
  const auth = useAuth();
  const { dispatchToast } = useToastController();

  function getToken() {
    if (auth.user?.expired) {
      dispatchToast(
        <Toast>
          <ToastTitle>
            You're not logged in.
          </ToastTitle>

          <ToastFooter>
            <Link
              onClick={() => auth.signinRedirect()}>
              Login
            </Link>
          </ToastFooter>
        </Toast>,
        { intent: "warning" }
      );

      throw new Error("You're not logged in.");
    }

    return auth.user!.access_token;
  }

  return getToken;
}
