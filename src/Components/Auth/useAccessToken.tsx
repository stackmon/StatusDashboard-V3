import { Link } from "@fluentui/react-components";
import { useAuth } from "react-oidc-context";
import { useAppToast } from "~/Helpers/useAppToast";

/**
 * @author Aloento
 * @since 1.0.0
 * @version 0.2.0
 */
export function useAccessToken() {
  const auth = useAuth();
  const toast = useAppToast();

  async function getToken(): Promise<string> {
    let user = auth.user;

    if (user?.expired) {
      user = await auth.signinSilent();
    }

    if (!user) {
      toast.showWarning("You're not logged in.", {
        action: (
          <Link onClick={() => auth.signinRedirect()}>
            Login
          </Link>
        ),
      });

      throw new Error("You're not logged in.");
    }

    return user.access_token;
  }

  return getToken;
}
