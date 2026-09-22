#!/usr/bin/env bash
#
# Write the release marker that every published bucket serves at /version.json, to stdout.
#
#   bash .github/scripts/write-version-json.sh > version.json
#
# The marker is generated once per build and travels with the build artifact, so every bucket
# uploads byte-identical content. Comparing the markers of two buckets therefore proves that
# both serve the same release, without downloading the sites.
#
# Environment:
#   SD_GIT_SHA       commit the build came from (falls back to GITHUB_SHA)
#   DIST_DIR         build output directory (default: dist)
#   GITHUB_REF_NAME  release tag or branch name recorded as "ref" (optional)
#   SD_BUILT_AT      timestamp override, for reproducible runs and tests (optional)
set -euo pipefail

DIST_DIR="${DIST_DIR:-dist}"
SHA="${SD_GIT_SHA:-${GITHUB_SHA:-}}"

[ -n "$SHA" ] || { echo "::error::neither SD_GIT_SHA nor GITHUB_SHA is set" >&2; exit 1; }
[ -d "$DIST_DIR" ] || { echo "::error::${DIST_DIR} does not exist, run the build first" >&2; exit 1; }

# The digest identifies the published content: sha256 over the "sha256  path" lines of every file
# in DIST_DIR, sorted by path. It is documented rather than opaque on purpose, any tool can
# recompute it from the same build.
manifest="$(mktemp)"
trap 'rm -f "$manifest"' EXIT
while IFS= read -r file; do
  printf '%s  %s\n' "$(sha256sum "${DIST_DIR}/${file}" | cut -d' ' -f1)" "$file"
done < <(cd "$DIST_DIR" && find . -type f -print | sed 's|^\./||' | LC_ALL=C sort) >"$manifest"

digest="$(sha256sum "$manifest" | cut -d' ' -f1)"
files="$(wc -l <"$manifest" | tr -d '[:space:]')"

# Only backslash and quote can break a JSON string, and no field is allowed to hold control
# characters here.
json_string() { printf '%s' "$1" | sed -e 's/\\/\\\\/g' -e 's/"/\\"/g'; }

cat <<EOF
{
  "sha": "$(json_string "$SHA")",
  "ref": "$(json_string "${GITHUB_REF_NAME:-}")",
  "built_at": "$(json_string "${SD_BUILT_AT:-$(date -u +%Y-%m-%dT%H:%M:%SZ)}")",
  "digest": "sha256:${digest}",
  "files": ${files}
}
EOF
