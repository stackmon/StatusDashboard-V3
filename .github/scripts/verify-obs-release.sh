#!/usr/bin/env bash
#
# Assert that OBS static website endpoints serve the release marker this run published.
#
#   bash .github/scripts/verify-obs-release.sh version.json <endpoint> [more endpoints...]
#
# An endpoint is a bare host (https:// is assumed) or a full URL. Every endpoint has to serve
# /version.json with the JSON content type and a body that is byte for byte the local marker, so
# a marker hidden behind the bucket error document cannot pass as a healthy one.
#
# Passing several endpoints is how a mirror proves it matches the primary bucket.
set -euo pipefail

: "${1:-usage: verify-obs-release.sh <local-marker.json> <endpoint> [endpoint...]}"
marker="$1"
shift
[ -f "$marker" ] || { echo "::error::${marker} does not exist"; exit 1; }
[ "$#" -gt 0 ] || { echo "::error::no endpoint given"; exit 1; }

work="$(mktemp -d)"
trap 'rm -rf "$work"' EXIT

field() { # <file> <key>, tolerant of a missing file so an unreachable endpoint still reports
  [ -f "$1" ] || return 0
  sed -n "s/^[[:space:]]*\"$2\":[[:space:]]*\"\([^\"]*\)\",\{0,1\}[[:space:]]*$/\1/p" "$1" | head -1
}

short() { printf '%s' "$1" | cut -c1-"$2"; }

expected_sha="$(field "$marker" sha)"
expected_digest="$(field "$marker" digest)"
echo "expected sha=${expected_sha} digest=${expected_digest}"

printf '  %-56s %-7s %-13s %-24s %s\n' "ENDPOINT" "STATUS" "SHA" "DIGEST" "BUILT_AT"
status=0
for endpoint in "$@"; do
  case "$endpoint" in
    http://* | https://*) base="$endpoint" ;;
    *) base="https://$endpoint" ;;
  esac
  body="$work/body"
  headers="$work/headers"
  rm -f "$body" "$headers"
  # no-cache: a marker describes the release that is live right now, never a cached answer.
  code="$(curl -sS -o "$body" -D "$headers" -w '%{http_code}' --max-time 60 --retry 2 --retry-delay 2 \
    -H 'Cache-Control: no-cache' "${base}/version.json" || true)"
  served_sha="$(field "$body" sha)"
  served_digest="$(field "$body" digest)"

  if [ "$code" != "200" ]; then
    printf '  %-56s %-7s %-13s %-24s %s\n' "$endpoint" "$code" - - -
    echo "::error::${endpoint} answered ${code} for /version.json"
    status=1
  elif ! grep -qiE '^content-type:[[:space:]]*application/json' "$headers"; then
    printf '  %-56s %-7s %-13s %-24s %s\n' "$endpoint" "$code" - - -
    echo "::error::${endpoint} serves /version.json with a non-JSON content type, which is what the bucket error document looks like"
    grep -i '^content-type:' "$headers" | tr -d '\r' >&2
    status=1
  elif ! cmp -s "$body" "$marker"; then
    printf '  %-56s %-7s %-13s %-24s %s\n' "$endpoint" "$code" \
      "$(short "${served_sha:-<none>}" 12)" "$(short "${served_digest:-<none>}" 24)" "$(field "$body" built_at)"
    echo "::error::${endpoint} serves a different release than this build"
    printf '    serves   sha=%s digest=%s built_at=%s ref=%s\n' \
      "${served_sha:-<none>}" "${served_digest:-<none>}" "$(field "$body" built_at)" "$(field "$body" ref)" >&2
    printf '    expected sha=%s digest=%s built_at=%s ref=%s\n' \
      "$expected_sha" "$expected_digest" "$(field "$marker" built_at)" "$(field "$marker" ref)" >&2
    delta="$(diff -u "$marker" "$body" 2>&1 | sed -n '3,12p' || true)"
    [ -z "$delta" ] || printf '    %s\n' "$delta" >&2
    status=1
  else
    printf '  %-56s %-7s %-13s %-24s %s\n' "$endpoint" "$code" \
      "$(short "$served_sha" 12)" "$(short "$served_digest" 24)" "$(field "$body" built_at)"
  fi
done

[ "$status" -eq 0 ] || { echo "::error::at least one endpoint does not serve this release"; exit 1; }
echo "every endpoint serves the same release"
