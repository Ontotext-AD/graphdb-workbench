#!/bin/bash

# This script should be run from the root directory of the project.

# Source the error handling script
. scripts/error-handling.sh

 analyze_package() {
    local package=$1
    local description
    description=$(echo "$package" | sed 's/\// -- /g')

    echo ''
    echo "########################   Running Sonar analysis -- ${description} --   ###########################"
    echo ''

    npm run sonar --prefix "packages/${package}"

    handle_error "Analysing ${description}"
}
# Install
analyze_package "workbench"
analyze_package "shared-components"

echo ''
echo '########################   All Sonar analysis ran successfully!   ###########################'
echo ''
