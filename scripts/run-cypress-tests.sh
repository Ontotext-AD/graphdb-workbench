#!/usr/bin/env bash

# Force quit if error occurs or if there is unbound variable
set -eu

echo "Working directory: $(pwd)"

GRAPHDB_VERSION=$1
GRAPHDB_DOWNLOAD_URL="http://maven.ontotext.com/repository/owlim-releases/com/ontotext/graphdb/graphdb-free/${GRAPHDB_VERSION}/graphdb-free-${GRAPHDB_VERSION}-dist.zip"

echo "Downloading GraphDB from $GRAPHDB_DOWNLOAD_URL"
# Clean previous runs
rm -rf /tmp/graphdb.zip /tmp/graphdb-tmp /tmp/graphdb
curl -sSL -u ${NEXUS_CREDENTIALS} ${GRAPHDB_DOWNLOAD_URL} -o /tmp/graphdb.zip
unzip -q /tmp/graphdb.zip -d /tmp/graphdb-tmp
mv /tmp/graphdb-tmp/graphdb* /tmp/graphdb
rm -rf /tmp/graphdb.zip /tmp/graphdb-tmp

echo "Starting GraphDB daemon"
/tmp/graphdb/bin/graphdb -d \
    -Dgraphdb.home=/tmp/graphdb \
    -Dgraphdb.workbench.home="$(pwd)/dist/" \
    -Dgraphdb.workbench.importDirectory="$(pwd)/test-cypress/fixtures/graphdb-import/"

cd test-cypress

echo "Installing Cypress tests module"
npm install

echo "Starting Cypress tests against GraphDB version ${GRAPHDB_VERSION}"
#npm run test -- --record=false --config baseUrl=http://localhost:7200,video=false

ls -1 ./integration/**/*.spec.js | parallel -I% --jobs 2 npx cypress run --spec % --record=false --config baseUrl=http://localhost:7200,video=false
