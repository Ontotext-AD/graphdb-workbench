#!/usr/bin/env bash

# Force quit if there is an unbound variable
set -u

# Traps the INT signal (Ctrl-C) so that we can cleanup when the user aborts the run
trap cleanup INT

function cleanup() {
    if [ -e "${GDB_TMPDIR:-}" ]; then
        if [ -n "${GRAPHDB_PID:-}" ]; then
            echo "Killing GraphDB"
            kill -9 "$GRAPHDB_PID"
        fi
        echo "Removing temporary directory"
        rm -rf "$GDB_TMPDIR"
    fi
    exit "${1:-}"
}

if [ -z "${1:-}" ]; then
    if [ -z "${GDB_VERSION:-}" ]; then
        echo "GDB_VERSION must be set to run script or a version must be passed as the first argument"
        cleanup 1
    fi
else
    GDB_VERSION="$1"
fi

# Make sure we are in the project root
cd "$(dirname $0)/.." || cleanup 1
echo "Working directory: $(pwd)"

echo "Running tests with GDB: $GDB_VERSION"

DOWNLOADS=.downloads
DOWNLOAD_URL="http://maven.ontotext.com/repository/owlim-releases/com/ontotext/graphdb/graphdb/${GDB_VERSION}/graphdb-${GDB_VERSION}-dist.zip"
LOCAL_MAVEN_ZIP=~/".m2/repository/com/ontotext/graphdb/graphdb/${GDB_VERSION}/graphdb-${GDB_VERSION}-dist.zip"
GDB_ZIP="$DOWNLOADS/graphdb-$GDB_VERSION.zip"

if [ -z "${NODE_OPTIONS:-}" ]; then
    # Needed for newer node versions
    export NODE_OPTIONS=--openssl-legacy-provider
fi

if ! mkdir -p "$DOWNLOADS"; then
    echo "Could not create $DOWNLOADS directory"
    cleanup 1
fi

if [ -f "$LOCAL_MAVEN_ZIP" ]; then
    echo "Using GraphDB from local Maven repository"
    GDB_ZIP="$LOCAL_MAVEN_ZIP"
elif [ ! -f "$GDB_ZIP" ]; then
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
# Starts GraphDB as a bash background process and records the PID in GRAPHDB_PID
# The output is redirected to graphdb-console.txt in the temp directory
"$GDB_TMPDIR/graphdb-${GDB_VERSION}/bin/graphdb" \
    -Denable.cypress.hack=true \
    -Dgraphdb.workbench.home="$(pwd)/dist/" \
    -Dgraphdb.stats.default=disabled \
    -Dgraphdb.workbench.importDirectory="$(pwd)/test-cypress/fixtures/graphdb-import/" \
    -Dgraphdb.jsonld.whitelist="https://w3c.github.io/json-ld-api/tests/*" \
        > "$GDB_TMPDIR/graphdb-console.txt" \
        & GRAPHDB_PID=$!

# Give it some time to spin up and check if still alive
sleep 2
if ! kill -0 "$GRAPHDB_PID" >& /dev/null; then
    unset GRAPHDB_PID
    echo "Unable to start GraphDB"
    cleanup 1
fi

cd test-cypress || cleanup 1

echo "Installing Cypress tests module"
if ! npm ci; then
    echo "Could not install tests module"
    cleanup 1
fi

echo "Starting Cypress tests against GraphDB version ${GDB_VERSION}"
npx cypress run --record=false --config baseUrl=http://localhost:7200,video=false

# Stops GraphDB, removes the temporary directory and exits using the exit code of the last command (i.e. the test run)
cleanup $?
