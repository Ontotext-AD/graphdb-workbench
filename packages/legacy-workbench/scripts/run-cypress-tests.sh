#!/usr/bin/env bash

# Usage:
# scripts/run-cypress-tests.sh [--loop] [<gdb-version> [<spec>] [<cypress-arg> ...]

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

function show_help_and_exit() {
    echo "Usage: .run-cypress-tests.sh [--loop] [<license-file>] [<gdb-version>] [<spec>] [<cypress-option> ...]"
    echo "    --loop           - runs tests in a loop until failure"
    echo "    <license-file>   - GraphDB Free license file (you can also set GDB_LICENSE)"
    echo "    <gdb-version>    - GraphDB version to use (you can also set GDB_VERSION)"
    echo "    <spec>           - path to test in the integration directory, passed as --spec to cypress"
    echo "    <cypress-option> - any string starting with - with be passed to cypress, e.g., --headed"
    exit 1
}

function check_required_arguments() {
    if [ -z "${GDB_VERSION:-}" ]; then
        show_help_and_exit
    fi
    if [ -z "${GDB_LICENSE:-}" ]; then
        show_help_and_exit
    fi
}

if [[ "${1:-}" == "-h" || "${1:-}" == "--help" ]]; then
    show_help_and_exit
fi

if [[ "${1:-}" == "--loop" ]]; then
    # Has optional first "--loop" argument => run tests in loop until failure
    LOOP=1
    shift
fi

if [[ "${1:-}" == *.license ]]; then
    # Has next argument - GraphDB license
    GDB_LICENSE="$1"
    shift
fi

if [[ "${1:-}" =~ ^[0-9] ]]; then
    # Has next argument - GraphDB version
    GDB_VERSION="$1"
    shift
fi

if [ -n "${1:-}" ]; then
    # Has next argument - cypress option(s) or integration spec path
    if [[ "${1:-}" != -* ]]; then
        # Doesn't start with "-" => integration spec path inside integration directory
        set -- "$@" --spec "integration/$1"
        shift
    fi
fi

check_required_arguments

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

GDB_DIST="$GDB_TMPDIR/graphdb-${GDB_VERSION}"
mkdir -p "$GDB_DIST/work"
echo "Installing license file '$GDB_LICENSE'"
cp "$GDB_LICENSE" "$GDB_DIST/work/graphdb.license"

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

count=0
exit_code=1
while npx cypress run --record=false --config baseUrl=http://localhost:7200,video=false "$@"; do
    exit_code=$?
    count=$((count+1))
    echo "Tests OK - run $count"
    if [ -z "${LOOP:-}" ]; then
        cleanup 0
    fi
done

# Stops GraphDB, removes the temporary directory and exits using the exit code of the test run
cleanup $exit_code
