#!/usr/bin/env bash
#
# Write the release marker that every published bucket serves at /version.json, to stdout.
#
#   bash .github/scripts/write-version-json.sh > version.json
#
# Env: SD_GIT_SHA (falls back to GITHUB_SHA), DIST_DIR, GITHUB_REF_NAME, SD_BUILT_AT.
set -euo pipefail

DIST_DIR="${DIST_DIR:-dist}"
SHA="${SD_GIT_SHA:-${GITHUB_SHA:-}}"

[ -n "$SHA" ] || { echo "::error::neither SD_GIT_SHA nor GITHUB_SHA is set" >&2; exit 1; }
[ -d "$DIST_DIR" ] || { echo "::error::${DIST_DIR} does not exist, run the build first" >&2; exit 1; }

# sha256 over the sorted "<sha256>  <path>" listing of every file in DIST_DIR, so any tool can
# recompute the digest from the same build.
manifest="$(mktemp)"
trap 'rm -f "$manifest"' EXIT
while IFS= read -r file; do
  printf '%s  %s\n' "$(sha256sum "${DIST_DIR}/${file}" | cut -d' ' -f1)" "$file"
done < <(cd "$DIST_DIR" && find . -type f -print | sed 's|^\./||' | LC_ALL=C sort) >"$manifest"

digest="$(sha256sum "$manifest" | cut -d' ' -f1)"
files="$(wc -l <"$manifest" | tr -d '[:space:]')"

# Escaping backslash and quote is enough: no field here can hold a control character.
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
