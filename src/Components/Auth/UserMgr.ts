import { jwtDecode } from "jwt-decode";
import { SigninRedirectArgs, User, UserManager, WebStorageStateStore } from "oidc-client-ts";

/**
 * UserMgr class extends the UserManager class to provide custom user management functionalities.
 *
 * @class
 * @extends {UserManager}
 *
 * @constructor
 * Initializes a new instance of the UserMgr class with specific settings for client ID, scope, user store, authority URL, post logout redirect URI, and redirect URI.
 *
 * @throws {Error} - Throws an error if the code is not found in the user store, if the token exchange fails, or if the access token is not found in the response.
 *
 * @description
 * The UserMgr class provides methods for handling user sign-in redirects and callbacks. It includes functionality for generating a code challenge, storing and retrieving codes from the user store, and exchanging codes for tokens. The class also decodes the access token and stores the user information.
 *
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

  override async signinRedirect(_args?: SigninRedirectArgs): Promise<void> {
    const code = crypto.randomUUID();
    await this.settings.userStore.set("code", code);

    const codeChallenge = Array.from(
      new Uint8Array(
        await crypto.subtle.digest(
          'SHA-256', new TextEncoder().encode(code)
        )))
      .map(byte => byte.toString(16).padStart(2, '0'))
      .join('');

    const stateObj = JSON.stringify({
      callback_url: this.settings.redirect_uri,
      code_challenge: codeChallenge,
    });
    const state = btoa(stateObj).replace(/=+$/, '');

    const loginUrl = `${process.env.SD_BACKEND_URL}/auth/login?state=${state}`;
    window.location.href = loginUrl;
  }

  override async signinCallback(_url?: string): Promise<User | undefined> {
    const code = await this.settings.userStore.get("code");
    if (!code)
      throw new Error("Code not found in user store");

    this.settings.userStore.remove("code");
    const res = await fetch(`${process.env.SD_BACKEND_URL}/auth/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        code_verifier: code,
      }),
    });

    if (!res.ok)
      throw new Error("Failed to exchange code for token");

    const data = await res.json();
    const access = data.access_token;

    if (!access)
      throw new Error("Access token not found in response");

    const decodedToken = jwtDecode(access);

    const user = new User({
      access_token: access,
      token_type: "Bearer",
      profile: decodedToken as User["profile"],
      expires_at: decodedToken.exp,
    });

    await this.storeUser(user);
    return user;
  }
}
