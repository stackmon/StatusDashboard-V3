import { User } from "oidc-client-ts";
import { AuthContextProps } from "react-oidc-context";

/**
 * @author Aloento
 * @since 1.0.0
 * @version 1.0.0
 */
export const Dic = {
  Name: "SD3",
};

/**
 * @author Aloento
 * @since 1.0.0
 * @version 1.0.0
 */
export abstract class Common {
  public static get LocalUser(): User | null {
    const str = localStorage.getItem(
      process.env.NODE_ENV === "development"
        ? "oidc.user:http://80.158.108.251:8080/realms/sd2:status-dashboard"
        : "oidc.user:https://keycloak.eco.tsi-dev.otc-service.com/realms/eco:status-dashboard"
    );

    if (!str) return null;
    return User.fromStorageString(str);
  }

  public static AuthSlot?: AuthContextProps;

  public static get Auth(): Promise<AuthContextProps> {
    return new Promise<AuthContextProps>(resolve => {
      if (this.AuthSlot)
        return resolve(this.AuthSlot);

      const interval = setInterval(() => {
        if (this.AuthSlot) {
          clearInterval(interval);
          resolve(this.AuthSlot);
        }
      }, 100);
    });
  }

  public static async AccessToken(): Promise<string | void> {
    let { isAuthenticated, user, signinSilent } = await this.Auth;

    if (!isAuthenticated)
      user = await signinSilent();

    if (user)
      return user.access_token;
  }
}
