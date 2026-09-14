#!/usr/bin/env bash
#
# Publish the Vite build output to an OTC OBS bucket that hosts a static website.
#
# Required environment:
#   OBS_BUCKET         target bucket
#   OBS_SITE_ENDPOINT  website endpoint host, used by the post-upload check
# Optional environment:
#   OBS_ENDPOINT       S3 API endpoint        (default: https://obs.eu-de.otc.t-systems.com)
#   OBS_REGION         signature region       (default: eu-de)
#   DIST_DIR           build output directory (default: dist)
set -euo pipefail

: "${OBS_BUCKET:?OBS_BUCKET is required}"
: "${OBS_SITE_ENDPOINT:?OBS_SITE_ENDPOINT is required}"

OBS_ENDPOINT="${OBS_ENDPOINT:-https://obs.eu-de.otc.t-systems.com}"
OBS_REGION="${OBS_REGION:-eu-de}"
DIST_DIR="${DIST_DIR:-dist}"

# Vite content-hashes everything under assets/, so those names change with the content and
# can be cached forever. Every other file keeps its name and gets a short TTL, and index.html
# is revalidated on each visit.
IMMUTABLE="public, max-age=31536000, immutable"
SHORT="public, max-age=3600"
# The cache class follows the location and the content type follows the extension. A file that
# fits neither list fails the run instead of becoming a silent gap in the published site.
ASSET_EXTENSIONS=(js css woff2 woff svg png ico json map)
ROOT_EXTENSIONS=(png svg ico webmanifest)

[ -d "$DIST_DIR" ] || { echo "::error::${DIST_DIR} does not exist, run the build first"; exit 1; }
[ -f "${DIST_DIR}/index.html" ] || { echo "::error::${DIST_DIR}/index.html is missing"; exit 1; }

export AWS_DEFAULT_REGION="$OBS_REGION"
export AWS_EC2_METADATA_DISABLED="true"
export AWS_PAGER=""

aws configure set default.s3.addressing_style path

S3=(aws --endpoint-url "$OBS_ENDPOINT" s3)
# --no-guess-mime-type: the content type is always passed explicitly, and a guessed type
# would overwrite the metadata that an earlier pass already uploaded.
COMMON=(--no-progress --only-show-errors --no-guess-mime-type)

content_type() {
  case "$1" in
    js) printf '%s' "application/javascript" ;;
    css) printf '%s' "text/css" ;;
    woff2) printf '%s' "font/woff2" ;;
    woff) printf '%s' "font/woff" ;;
    svg) printf '%s' "image/svg+xml" ;;
    png) printf '%s' "image/png" ;;
    ico) printf '%s' "image/x-icon" ;;
    webmanifest) printf '%s' "application/manifest+json" ;;
    json | map) printf '%s' "application/json" ;;
    *) echo "unsupported extension: .$1" >&2; exit 1 ;;
  esac
}

in_list() { # <value> <list...>
  local value="$1" item
  shift
  for item in "$@"; do
    [ "$item" = "$value" ] && return 0
  done
  return 1
}

# `aws s3 sync` compares size and mtime only. A CI checkout has fresh mtimes, so every run
# re-uploads everything and the metadata below is always rewritten.
sync_pass() { # <content-type> <cache-control> <exclude/include args...>
  local content="$1" cache="$2"
  shift 2
  "${S3[@]}" sync "$DIST_DIR" "s3://${OBS_BUCKET}" "${COMMON[@]}" \
    --content-type "$content" --cache-control "$cache" "$@"
}

unmatched=()
while IFS= read -r file; do
  file="${file#./}"
  case "$file" in
    index.html) continue ;;
    assets/*) in_list "${file##*.}" "${ASSET_EXTENSIONS[@]}" || unmatched+=("$file") ;;
    *) in_list "${file##*.}" "${ROOT_EXTENSIONS[@]}" || unmatched+=("$file") ;;
  esac
done < <(cd "$DIST_DIR" && find . -type f)
if [ "${#unmatched[@]}" -gt 0 ]; then
  echo "::error::${#unmatched[@]} artifact(s) have no upload rule, add them to ASSET_EXTENSIONS/ROOT_EXTENSIONS and content_type():"
  printf '  %s\n' "${unmatched[@]}"
  exit 1
fi

echo "::group::hashed assets"
for ext in "${ASSET_EXTENSIONS[@]}"; do
  # The filter wildcard also matches "/", so nested directories are covered as well.
  sync_pass "$(content_type "$ext")" "$IMMUTABLE" --exclude '*' --include "assets/*.${ext}"
done
echo "::endgroup::"

echo "::group::site assets"
for ext in "${ROOT_EXTENSIONS[@]}"; do
  # The last matching filter wins, hence the second exclusion: assets/ is uploaded above and
  # must not be rewritten with the shorter TTL.
  sync_pass "$(content_type "$ext")" "$SHORT" --exclude '*' --include "*.${ext}" --exclude 'assets/*'
done
echo "::endgroup::"

echo "::group::index.html"
# Uploaded last: a visitor must never receive an index.html that references a bundle which is
# not in the bucket yet. It is deliberately in none of the passes above, otherwise it would be
# uploaded with the wrong cache header before the assets are in place.
"${S3[@]}" cp "${DIST_DIR}/index.html" "s3://${OBS_BUCKET}/index.html" "${COMMON[@]}" \
  --content-type "text/html; charset=utf-8" --cache-control "no-cache, must-revalidate"
echo "::endgroup::"

echo "::group::verify"
entry="$(grep -m1 -oE 'src="/assets/[^"]+\.js"' "${DIST_DIR}/index.html" || true)"
entry="${entry#src=\"}"; entry="${entry%\"}"
if [ -z "$entry" ]; then
  echo "::error::${DIST_DIR}/index.html does not reference a hashed entry script"
  exit 1
fi

head_ok() { # <path> <expected content-type>
  local header
  header="$(curl -fsSI --max-time 30 "https://${OBS_SITE_ENDPOINT}${1}")" || {
    echo "::error::GET https://${OBS_SITE_ENDPOINT}${1} failed"
    return 1
  }
  grep -qi "^content-type: .*${2}" <<<"$header" || {
    echo "::error::${1} is served with an unexpected content type"
    printf '%s\n' "$header"
    return 1
  }
}

head_ok /index.html "text/html"
head_ok "$entry" "application/javascript"

served="$(curl -fsS --max-time 30 "https://${OBS_SITE_ENDPOINT}/" | grep -m1 -oE 'src="/assets/[^"]+\.js"' || true)"
served="${served#src=\"}"; served="${served%\"}"
if [ "$served" != "$entry" ]; then
  echo "::error::https://${OBS_SITE_ENDPOINT}/ serves '${served:-<none>}' instead of '${entry}'"
  exit 1
fi

echo "published ${entry} to ${OBS_BUCKET}"
echo "::endgroup::"
