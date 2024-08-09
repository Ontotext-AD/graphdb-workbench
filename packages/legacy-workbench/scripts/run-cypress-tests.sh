#!/usr/bin/env bash

# Force quit if there is an unbound variable
set -u

# Traps the INT signal (Ctrl-C) so that we can cleanup when the user aborts the run
trap cleanup INT

function cleanup() {
    if [ -e "${GDB_TMPDIR:-}" ]; then
        # The PID file might not be there yet if GraphDB is still starting so wait and retry a couple of times if needed
        for i in {1..3}; do
            if [ ! -f "$GDB_TMPDIR/graphdb.pid" ]; then
                echo "GraphDB PID file not found, sleep for 5 seconds and retry (attempt $i)"
                sleep 5
            fi
            if [ -f "$GDB_TMPDIR/graphdb.pid" ]; then
                echo "Killing GraphDB"
                kill -9 $(cat "$GDB_TMPDIR/graphdb.pid")
                break
            fi
        done
        echo "Removing temporary directory"
        rm -rf "$GDB_TMPDIR"
    fi
    exit ${1:-}
}

if [ -z "${GDB_VERSION:-}" ]; then
    echo "GDB_VERSION must be set to run script. Don't run this script directly, use npm run test:acceptance"
    cleanup 1
fi

# Make sure we are in the project root
cd $(dirname $0)/..
echo "Working directory: $(pwd)"

echo "Running tests with GDB: $GDB_VERSION"

DOWNLOADS=.downloads
DOWNLOAD_URL="http://maven.ontotext.com/repository/owlim-releases/com/ontotext/graphdb/graphdb/${GDB_VERSION}/graphdb-${GDB_VERSION}-dist.zip"
GDB_ZIP="$DOWNLOADS/graphdb-$GDB_VERSION.zip"

if ! mkdir -p "$DOWNLOADS"; then
    echo "Could not create $DOWNLOADS directory"
    cleanup 1
fi

if [ ! -f "$GDB_ZIP" ]; then
    echo "Downloading GraphDB from $DOWNLOAD_URL"
    # Clean previous runs
    if ! curl -sSL "${DOWNLOAD_URL}" -o "$GDB_ZIP"; then
        echo "Could not download GraphDB"
        cleanup 1
    fi
else
    echo "Using already downloaded GraphDB"
fi

GDB_TMPDIR=$(mktemp -d -t graphdb-cypress.XXXXXX)
echo "Created temporary directory: $GDB_TMPDIR"

if ! unzip -q "$GDB_ZIP" -d "$GDB_TMPDIR"; then
    echo "Could not extract GraphDB"
    cleanup 1
fi

echo "Building Workbench"
if ! npm run build; then
    echo "Could not build Workbench"
    cleanup 1
fi

echo "Starting GraphDB daemon"
if ! "$GDB_TMPDIR/graphdb-${GDB_VERSION}/bin/graphdb" -d \
    -p "$GDB_TMPDIR/graphdb.pid" \
    -Denable.cypress.hack=true \
    -Dgraphdb.workbench.home="$(pwd)/dist/" \
    -Dgraphdb.stats.default=disabled \
    -Dgraphdb.workbench.importDirectory="$(pwd)/test-cypress/fixtures/graphdb-import/" \
    -Dgraphdb.jsonld.whitelist="https://w3c.github.io/json-ld-api/tests/*" ; then
    echo "Unable to start GraphDB"
    cleanup 1
fi

cd test-cypress

echo "Installing Cypress tests module"
if ! npm ci; then
    echo "Could not install tests module"
    cleanup 1
fi

echo "Starting Cypress tests against GraphDB version ${GDB_VERSION}"
npx cypress run --record=false --config baseUrl=http://localhost:7200,video=false

# Stops GraphDB, removes the temporary directory and exits using the exit code of the last command (i.e. the test run)
cleanup $?
