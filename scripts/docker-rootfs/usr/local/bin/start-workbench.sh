#!/usr/bin/env sh

set -eu

# Replace both GRAPHDB_URL and GRAPHDB_PORT environment variables
envsubst '${GRAPHDB_URL} ${WORKBENCH_PORT}' </etc/nginx/conf.d/default.conf > /etc/nginx/conf.d/default.conf.tmp
mv /etc/nginx/conf.d/default.conf.tmp /etc/nginx/conf.d/default.conf

# Tests & prints the whole configuration (easy to debug issues)
nginx -T

nginx -g "daemon off;" > /dev/null
