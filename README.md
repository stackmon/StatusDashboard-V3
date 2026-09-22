# StatusDashboard V3

## How To Run

1. Install [Node.js](https://nodejs.org/en/download/package-manager/current) above v18.
2. Run CMD `corepack enable`.
3. Run CMD `pnpm install`.
4. Run CMD `pnpm dev`.

## Container

The image does not serve the site. The content is published to OBS static website buckets and the
container is a frozen nginx shim that forwards to them, falling back to the next region when one is
unreachable, so the CCE objects keep their current shape.

Only the `Docker Image Build and Push (manual)` workflow builds it, and only by hand: pass the tag
to push and the endpoints to chain. An added mirror or a renamed bucket is the reason to build it
again, nothing else. The chain itself is rendered by [docker/generate-origin-conf.sh](docker/generate-origin-conf.sh).
