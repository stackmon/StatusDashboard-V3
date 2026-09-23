#!/usr/bin/env bash
#
# Publish the Vite build output to an OTC OBS bucket that hosts a static website.
#
# Required: OBS_BUCKET, OBS_SITE_ENDPOINT (host or full URL, used by the post-upload check).
# Optional: OBS_ENDPOINT, OBS_REGION, DIST_DIR, VERSION_FILE (release marker from
# write-version-json.sh, published as /version.json) and RETAIN_DAYS (whole number of days an
# object has been out of the build before it is deleted; default 30, 0 keeps everything).
set -euo pipefail

: "${OBS_BUCKET:?OBS_BUCKET is required}"
: "${OBS_SITE_ENDPOINT:?OBS_SITE_ENDPOINT is required}"

OBS_ENDPOINT="${OBS_ENDPOINT:-https://obs.eu-de.otc.t-systems.com}"
OBS_REGION="${OBS_REGION:-eu-de}"
DIST_DIR="${DIST_DIR:-dist}"

case "$OBS_SITE_ENDPOINT" in
  http://* | https://*) SITE_URL="$OBS_SITE_ENDPOINT" ;;
  *) SITE_URL="https://${OBS_SITE_ENDPOINT}" ;;
esac

# Hashed assets can be cached forever, every other file keeps a short TTL. index.html and
# version.json must be revalidated, but `public` lets the shared caches in front of the bucket
# keep a copy. sw.js keeps its name across releases, so a copy served without asking the bucket
# would pin a visitor to the build that registered it and it stays out of shared caches.
IMMUTABLE="public, max-age=31536000, immutable"
SHORT="public, max-age=3600"
REVALIDATE="public, no-cache, must-revalidate"
SERVICE_WORKER="no-cache, must-revalidate"
# A file that matches none of the lists fails the run instead of silently not being published.
ASSET_EXTENSIONS=(js css woff2 woff svg png ico json map)
ROOT_EXTENSIONS=(png svg ico webmanifest)
ROOT_JS_EXTENSIONS=(js)

[ -d "$DIST_DIR" ] || { echo "::error::${DIST_DIR} does not exist, run the build first"; exit 1; }
[ -f "${DIST_DIR}/index.html" ] || { echo "::error::${DIST_DIR}/index.html is missing"; exit 1; }

work="$(mktemp -d)"
trap 'rm -rf "$work"' EXIT

export AWS_DEFAULT_REGION="$OBS_REGION"
export AWS_EC2_METADATA_DISABLED="true"
export AWS_PAGER=""

# Since CLI 2.23 the aws CLI sends a trailing CRC64NVME checksum as aws-chunked and marks the
# object with Content-Encoding: aws-chunked. OBS stores that framing as file content, which a
# browser renders as page garbage. OBS does not need the checksum, so keep it opt-in.
export AWS_REQUEST_CHECKSUM_CALCULATION="${AWS_REQUEST_CHECKSUM_CALCULATION:-when_required}"
export AWS_RESPONSE_CHECKSUM_VALIDATION="${AWS_RESPONSE_CHECKSUM_VALIDATION:-when_required}"

aws configure set default.s3.addressing_style path

S3=(aws --endpoint-url "$OBS_ENDPOINT" s3)
S3API=(aws --endpoint-url "$OBS_ENDPOINT" s3api)
# --no-guess-mime-type: the type is always passed explicitly, a guessed one would overwrite the
# metadata an earlier pass already uploaded.
COMMON=(--no-progress --only-show-errors --no-guess-mime-type)

# Every publish re-uploads the whole build (`aws s3 sync` compares size and mtime, and a CI
# checkout has fresh mtimes), so an object older than the window has been absent from every build
# since then and no page the bucket serves can reference it. prune_stale re-checks that none of the
# objects it just uploaded looks stale, which is what a sync that starts skipping unchanged files
# would produce.
RETAIN_DAYS="${RETAIN_DAYS:-30}"
case "$RETAIN_DAYS" in
  *[!0-9]*) echo "::error::RETAIN_DAYS must be a whole number of days, got '${RETAIN_DAYS}'"; exit 1 ;;
esac

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

sync_pass() { # <content-type> <cache-control> <exclude/include args...>
  local content="$1" cache="$2"
  shift 2
  "${S3[@]}" sync "$DIST_DIR" "s3://${OBS_BUCKET}" "${COMMON[@]}" \
    --content-type "$content" --cache-control "$cache" "$@"
}

# Drops what no recent build contains. Failures warn instead of failing the run: pruning cannot
# corrupt the site, and a gap in the bucket policy must not block a release.
prune_stale() { # <days>
  local days="$1" cutoff keys payload build_keys count part result failed=0

  cutoff="$(date -u -d "-${days} days" +%Y-%m-%dT%H:%M:%S.000Z)" || {
    echo "::warning::${OBS_BUCKET}: no retention cutoff for '${days}' days, nothing was pruned"
    return 0
  }
  keys="$work/keys"
  payload="$work/payload"
  build_keys="$work/build.keys"

  if ! "${S3API[@]}" list-objects-v2 --bucket "$OBS_BUCKET" \
      --output text --query 'Contents[].[LastModified,Key]' > "${keys}.listing"; then
    echo "::warning::${OBS_BUCKET}: object listing failed, nothing was pruned"
    return 0
  fi

  awk -F'\t' -v cutoff="$cutoff" \
    '$1 ~ /^[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]T/ && $1 < cutoff { print $2 }' \
    "${keys}.listing" > "$keys"

  count="$(wc -l < "$keys" | tr -d '[:space:]')"
  if [ "$count" = "0" ]; then
    echo "every object is younger than ${days} days"
    return 0
  fi

  # Nothing this run uploaded may look stale. If it does, the full-re-upload assumption no longer
  # holds and deleting would take live content with it, so keep everything and say so.
  (cd "$DIST_DIR" && find . -type f -print | sed 's|^\./||' | LC_ALL=C sort) > "$build_keys"
  if [ ! -s "$build_keys" ]; then
    echo "::warning::${OBS_BUCKET}: no list of the files just uploaded, nothing was pruned"
    return 0
  fi
  LC_ALL=C comm -12 "$build_keys" <(LC_ALL=C sort "$keys") > "$work/live.keys"
  if [ -s "$work/live.keys" ]; then
    echo "::warning::${OBS_BUCKET}: nothing was pruned, $(wc -l < "$work/live.keys" | tr -d '[:space:]') object(s) of this build are older than ${days} days:"
    head -n 20 "$work/live.keys" | sed 's/^/  /'
    return 0
  fi

  echo "${count} object(s) have been out of the build for more than ${days} days:"
  head -n 20 "$keys" | sed 's/^/  /'
  [ "$count" -le 20 ] || echo "  ... and $((count - 20)) more"

  # The batch prefix must not collide with $keys: a "$keys".* glob would also pick up the
  # $keys.listing file next to it and send the raw listing as a batch of garbage keys.
  split -l 1000 -d "$keys" "$work/part."
  for part in "$work"/part.*; do
    awk 'BEGIN { printf "{\"Quiet\": true, \"Objects\": [" } \
         { printf "%s{\"Key\": \"%s\"}", (NR > 1 ? "," : ""), $0 } \
         END { printf "]}" }' "$part" > "$payload"

    if ! result="$("${S3API[@]}" delete-objects --bucket "$OBS_BUCKET" \
        --delete "file://${payload}" --query 'Errors[].[Key,Message]' --output text)"; then
      echo "::warning::${OBS_BUCKET}: delete-objects was rejected, the bucket keeps growing"
      failed=1
      break
    fi

    case "$result" in
      "" | None) ;;
      *)
        echo "::warning::${OBS_BUCKET}: some objects were not deleted"
        printf '%s\n' "$result"
        ;;
    esac
  done

  if [ "$failed" = "1" ]; then
    echo "::warning::pruning ${OBS_BUCKET} stopped early, it keeps growing until this is fixed"
  else
    echo "pruned ${count} object(s)"
  fi
}

unmatched=()
while IFS= read -r file; do
  file="${file#./}"
  ext="${file##*.}"
  case "$file" in
    index.html) continue ;;
    assets/*) in_list "$ext" "${ASSET_EXTENSIONS[@]}" || unmatched+=("$file") ;;
    *) in_list "$ext" "${ROOT_EXTENSIONS[@]}" || in_list "$ext" "${ROOT_JS_EXTENSIONS[@]}" || unmatched+=("$file") ;;
  esac
done < <(cd "$DIST_DIR" && find . -type f)
if [ "${#unmatched[@]}" -gt 0 ]; then
  echo "::error::${#unmatched[@]} artifact(s) have no upload rule, add them to ASSET_EXTENSIONS/ROOT_EXTENSIONS/ROOT_JS_EXTENSIONS and content_type():"
  printf '  %s\n' "${unmatched[@]}"
  exit 1
fi

echo "::group::hashed assets"
for ext in "${ASSET_EXTENSIONS[@]}"; do
  sync_pass "$(content_type "$ext")" "$IMMUTABLE" --exclude '*' --include "assets/*.${ext}"
done
echo "::endgroup::"

echo "::group::site assets"
for ext in "${ROOT_EXTENSIONS[@]}"; do
  # The last matching filter wins, hence the second exclusion: assets/ was uploaded above at its
  # longer TTL.
  sync_pass "$(content_type "$ext")" "$SHORT" --exclude '*' --include "*.${ext}" --exclude 'assets/*'
done
echo "::endgroup::"

echo "::group::service worker"
for ext in "${ROOT_JS_EXTENSIONS[@]}"; do
  sync_pass "$(content_type "$ext")" "$SERVICE_WORKER" --exclude '*' --include "*.${ext}" --exclude 'assets/*'
done
echo "::endgroup::"

echo "::group::index.html"
# Uploaded last, and in none of the passes above: a visitor must never receive an index.html that
# references a bundle which is not in the bucket yet.
"${S3[@]}" cp "${DIST_DIR}/index.html" "s3://${OBS_BUCKET}/index.html" "${COMMON[@]}" \
  --content-type "text/html; charset=utf-8" --cache-control "$REVALIDATE"
echo "::endgroup::"

if [ -n "${VERSION_FILE:-}" ]; then
  echo "::group::version marker"
  [ -f "$VERSION_FILE" ] || { echo "::error::VERSION_FILE=${VERSION_FILE} does not exist"; exit 1; }
  # Last object of a release: a bucket that serves the marker serves complete content.
  "${S3[@]}" cp "$VERSION_FILE" "s3://${OBS_BUCKET}/version.json" "${COMMON[@]}" \
    --content-type "application/json" --cache-control "$REVALIDATE"
  echo "::endgroup::"
fi

echo "::group::retention"
if [ "$RETAIN_DAYS" -eq 0 ]; then
  echo "RETAIN_DAYS=0, every object is kept"
elif ! prune_stale "$RETAIN_DAYS"; then
  echo "::warning::pruning ${OBS_BUCKET} failed, the bucket keeps growing until this is fixed"
fi
echo "::endgroup::"

echo "::group::verify"
entry="$(grep -m1 -oE 'src="/assets/[^"]+\.js"' "${DIST_DIR}/index.html" || true)"
entry="${entry#src=\"}"; entry="${entry%\"}"
if [ -z "$entry" ]; then
  echo "::error::${DIST_DIR}/index.html does not reference a hashed entry script"
  exit 1
fi

head_ok() { # <path> <expected content-type>
  local header encoding
  header="$(curl -fsSI --max-time 30 "${SITE_URL}${1}")" || {
    echo "::error::GET ${SITE_URL}${1} failed"
    return 1
  }
  grep -qi "^content-type: .*${2}" <<<"$header" || {
    echo "::error::${1} is served with an unexpected content type"
    printf '%s\n' "$header"
    return 1
  }
  # A clean object has no content encoding; anything else means the uploaded body was chunked.
  encoding="$(sed -n 's/^[Cc]ontent-[Ee]ncoding:[[:space:]]*//p' <<<"$header" | tr -d '\r' | tr 'A-Z' 'a-z')"
  if [ -n "$encoding" ] && [ "$encoding" != "identity" ]; then
    echo "::error::${1} is served with Content-Encoding: ${encoding}, the object was uploaded chunk-encoded"
    printf '%s\n' "$header"
    return 1
  fi
}

head_ok /index.html "text/html"
head_ok "$entry" "application/javascript"
head_ok /sw.js "application/javascript"

# The served bundle must be byte for byte the local file; extra framing or a truncated body shows
# up only here.
served_body="$work/body"
headers="$work/headers"
hash_file() { sha256sum "$1" | cut -d' ' -f1; }

curl -fsS --max-time 60 --retry 2 --retry-delay 2 -D "$headers" -o "$served_body" "${SITE_URL}${entry}" || {
  echo "::error::GET ${SITE_URL}${entry} failed"
  exit 1
}
local_size="$(wc -c <"${DIST_DIR}${entry}" | tr -d '[:space:]')"
served_size="$(wc -c <"$served_body" | tr -d '[:space:]')"
local_hash="$(hash_file "${DIST_DIR}${entry}")"
served_hash="$(hash_file "$served_body")"
if [ "$served_size" != "$local_size" ] || [ "$served_hash" != "$local_hash" ]; then
  echo "::error::${entry} is served as ${served_size} bytes / sha256 ${served_hash}, the local file is ${local_size} bytes / sha256 ${local_hash}"
  exit 1
fi

served="$(curl -fsS --max-time 30 "${SITE_URL}/" | grep -m1 -oE 'src="/assets/[^"]+\.js"' || true)"
served="${served#src=\"}"; served="${served%\"}"
if [ "$served" != "$entry" ]; then
  echo "::error::${SITE_URL}/ serves '${served:-<none>}' instead of '${entry}'"
  exit 1
fi

if [ -n "${VERSION_FILE:-}" ]; then
  # A missing object comes back as the bucket error document, so the body, not the status code,
  # decides.
  curl -fsS --max-time 30 --retry 2 --retry-delay 2 -D "$headers" -o "$served_body" "${SITE_URL}/version.json" || {
    echo "::error::GET ${SITE_URL}/version.json failed"
    exit 1
  }
  if ! grep -qiE '^content-type:[[:space:]]*application/json' "$headers"; then
    echo "::error::/version.json is not served as JSON, the bucket error document answered instead"
    grep -i '^content-type:' "$headers" >&2
    exit 1
  fi
  if ! cmp -s "$served_body" "$VERSION_FILE"; then
    echo "::error::/version.json is not byte for byte ${VERSION_FILE}"
    exit 1
  fi
  echo "version marker served: sha $(sed -n 's/^[[:space:]]*"sha":[[:space:]]*"\([^"]*\)".*/\1/p' "$VERSION_FILE")"
fi

echo "published ${entry} to ${OBS_BUCKET}"
echo "::endgroup::"
