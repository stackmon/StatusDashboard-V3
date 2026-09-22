#!/bin/sh
#
# Renders the failover chain that the frontend shim includes into its nginx config.
#
# OBS picks the bucket from the Host header alone, so every bucket has to be reached through its
# own website endpoint: a single upstream block cannot send three different Host headers. The list
# therefore becomes a chain of locations, each proxy_pass naming one endpoint, and a failing
# endpoint is answered by the next one.
#
# Usage: generate-origin-conf.sh <comma-separated-endpoints> <output-file>
set -eu

origins=${1-}
out=${2-}

if [ -z "$origins" ] || [ -z "$out" ]; then
    echo "usage: $0 <comma-separated-endpoints> <output-file>" >&2
    exit 2
fi

# Split the list on commas and stray spaces; globbing off because the input is free text.
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
    echo "# Generated at image build time from SD3_FRONT_ORIGINS. Editing this file in a running"
    echo "# container changes nothing outside that container."

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
