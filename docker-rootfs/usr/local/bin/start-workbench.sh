#!/usr/bin/env sh

set -eu

# Replace ONLY the GRAPHDB_URL environment variable
envsubst '${GRAPHDB_URL}' </etc/nginx/conf.d/default.conf > /etc/nginx/conf.d/default.conf.tmp
mv /etc/nginx/conf.d/default.conf.tmp /etc/nginx/conf.d/default.conf

# Tests & prints the whole configuration (easy to debug issues)
nginx -T

nginx -g "daemon off;"
