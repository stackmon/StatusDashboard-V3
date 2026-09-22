#!/bin/sh
#
# Renders the failover chain that the frontend shim includes into its nginx config: one location per
# endpoint, each one answering for the previous. OBS picks the bucket from the Host header alone and
# nginx computes that header once per request, so the endpoints cannot share an upstream block.
#
# Usage: generate-origin-conf.sh <comma-separated-endpoints> <output-file>
set -eu

origins=${1-}
out=${2-}

if [ -z "$origins" ] || [ -z "$out" ]; then
    echo "usage: $0 <comma-separated-endpoints> <output-file>" >&2
    exit 2
fi

set -f
old_ifs=$IFS
IFS=', '
set -- $origins
IFS=$old_ifs
set +f

if [ "$#" -eq 0 ]; then
    echo "empty endpoint list" >&2
    exit 2
fi

for origin in "$@"; do
    case $origin in
        '' | *[!A-Za-z0-9.-]* | .* | -* | *-)
            echo "not a plain hostname: '$origin'" >&2
            exit 2
            ;;
    esac
done

{
    echo "# Generated at image build time from SD3_FRONT_ORIGINS; edits in a running container are lost."

    i=0
    for origin in "$@"; do
        i=$((i + 1))
        echo
        if [ "$i" -eq 1 ]; then
            echo "location / {"
        else
            printf 'location @origin_%d {\n' "$i"
        fi
        printf '    proxy_pass https://%s;\n' "$origin"
        if [ "$i" -lt "$#" ]; then
            printf '    error_page 502 504 = @origin_%d;\n' "$((i + 1))"
        fi
        echo "}"
    done
} > "$out"
