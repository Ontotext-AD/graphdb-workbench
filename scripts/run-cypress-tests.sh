#!/usr/bin/env bash

set -eu

# Export the variable to be used in the compose file (test-cypress/docker-compose.yml)
export GRAPHDB_VERSION=$1

echo "Starting Cypress tests against GraphDB version ${GRAPHDB_VERSION}"

# Build Workbench image
docker build -t graphdb-workbench:latest .

# Build custom GraphDB image with text fixtures and start the compose
docker-compose --file test-cypress/docker-compose.yml up -d --build

# Wait until both containers are reachable
npm install -g wait-on

# Wait GraphDB for 60 seconds
wait-on http://localhost:7200 -t 60000

# Wait Workbench for 30 seconds
wait-on http://localhost:7300 -t 30000

# Run the tests
npx cypress run --record=true --config baseUrl=http://localhost:7300,video=false

