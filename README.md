# StatusDashboard V3

## How To Run

1. Install [Node.js](https://nodejs.org/en/download/package-manager/current) above v24.
2. Run CMD `corepack enable`.
3. Run CMD `pnpm install`.
4. Run CMD `pnpm dev`.

## Build

`pnpm build` needs `SD_BACKEND_URL`, `SD_CLIENT_ID`, `SD_AUTHORITY_URL` and `SD_PROJECT_ID` in the
environment and fails when one of them is empty. `pnpm start` serves the output of the last build.

`SD_NAME` names the deployment in the browser title, `SD_APP_NAME` names the app it is installed as
and what the install toast offers. `SD_APP_NAME` falls back to `SD_NAME Status`, so every deployment
keeps its own entry on the home screen instead of sharing one.

## Authentication

The SPA is a public OIDC client of the Zitadel project and runs the authorization code flow with
PKCE itself; there is no backend in the token path.

| Variable | Value |
| --- | --- |
| `SD_AUTHORITY_URL` | Zitadel issuer, e.g. `https://zitadel.example.com` |
| `SD_CLIENT_ID` | client id of the SPA application in that project |
| `SD_PROJECT_ID` | project id, the same value the backend uses as `SD_OIDC_CLIENT_ID` |

The application in Zitadel has to be registered with:

- application type *User Agent*, authentication method *None*, response type `code`, grant types
  `authorization_code` and `refresh_token`;
- redirect URI `${origin}/signin-oidc` and post logout redirect URI `${origin}/` for every origin the
  build is served from;
- **JWT** access tokens, otherwise the backend cannot verify them offline;
- *Assert Roles on Authentication* for the access and the ID token.

The build asks for the `sd_creators`, `sd_operators` and `sd_admins` role scopes, for
`urn:zitadel:iam:org:project:id:<SD_PROJECT_ID>:aud` (the audience the backend validates) and for
`offline_access`, which is what makes the silent renewal of the access token work in the browser.
