#!/bin/bash

# This script should be run from the root directory of the project.

# Source the error handling script
source ./scripts/error-handling.sh

test_package() {
    local package=$1
    local description
    description=$(echo "$package" | sed 's/\// -- /g')

    echo ''
    echo "########################   Testing -- ${description} --   ###########################"
    echo ''

    npm run test --prefix "packages/${package}"

    handle_error "Testing ${description}"
}

# Test packages
test_package "legacy-workbench"
test_package "workbench"
test_package "api"
test_package "shared-components"

echo ''
echo '########################   All packages tested successfully!   ###########################'
echo ''
