# StatusDashboard V3

## How To Run

1. Install [Node.js](https://nodejs.org/en/download/package-manager/current) above v24.
2. Run CMD `corepack enable`.
3. Run CMD `pnpm install`.
4. Run CMD `pnpm dev`.

## Build

`pnpm build` needs `SD_BACKEND_URL`, `SD_CLIENT_ID` and `SD_AUTHORITY_URL` in the environment and
fails when one of them is empty. `pnpm start` serves the output of the last build.
