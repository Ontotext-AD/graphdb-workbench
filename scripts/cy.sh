#!/bin/bash

# This script should be run from the root directory of the project.

# Source the error handling script
. scripts/error-handling.sh

run_test() {
    local package=$1
    local description
    description=$(echo "$package" | sed 's/\// -- /g')

    echo ''
    echo "########################   Cypress Test -- ${description} --   ###########################"
    echo ''

    npm run cy:run:ci --prefix "packages/${package}"

    handle_error "Cypress Test -- ${description}"
}

# Run cypress tests for each package
run_test "workbench"
run_test "shared-components"

echo ''
echo '########################   All tests completed successfully!   ###########################'
echo ''
