import { uniqueId } from "lodash";
import { SigninRedirectArgs, User, UserManager, WebStorageStateStore } from "oidc-client-ts";

/**
 * @author Aloento
 * @since 1.0.0
 * @version 1.0.0
 */
export class UserMgr extends UserManager {
  constructor() {
    super({
      client_id: process.env.SD_CLIENT_ID!,
      scope: "openid profile email",
      userStore: new WebStorageStateStore({ store: window.localStorage }),
      authority: process.env.SD_AUTHORITY_URL!,
      post_logout_redirect_uri: `${window.location.origin}/signout-callback-oidc`,
      redirect_uri: `${window.location.origin}/signin-oidc`,
    });
  }

  override async signinRedirect(args?: SigninRedirectArgs): Promise<void> {
    const code = uniqueId();
    this.settings.userStore.set("code", code);

    const stateObj = JSON.stringify({
      callback_url: this.settings.redirect_uri,
      code_challenge: code,
    });
    const state = btoa(stateObj).replace(/=+$/, '');

    const loginUrl = `${process.env.SD_BACKEND_URL}/auth/login?state=${state}`;
    window.location.href = loginUrl;
  }

  override async signinCallback(url?: string): Promise<User | undefined> {
    const code = this.settings.userStore.get("code");
    if (!code) return undefined;

    this.settings.userStore.remove("code");
    fetch(`${process.env.SD_BACKEND_URL}/auth/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        code_verifier: code,
      }),
    });

  }
}
