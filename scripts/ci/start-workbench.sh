#!/usr/bin/env sh

set -eux

echo "STARTING WORKBENCH SCRIPT"

# Replace both GRAPHDB_URL environment variable
envsubst '${GRAPHDB_URL} ${WORKBENCH_PORT}' < /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf

# Tests & prints the whole configuration (easy to debug issues)
nginx -T

nginx -g "daemon off;"
