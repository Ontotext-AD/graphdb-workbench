#!/bin/bash

# This script should be run from the root directory of the project.

# Source the error handling script
source ./scripts/error-handling.sh

validate_package() {
    local package=$1
    local description
    description=$(echo "$package" | sed 's/\// -- /g')

    echo ''
    echo "########################   Validating -- ${description} --   ###########################"
    echo ''

    npm run validate --prefix "packages/${package}"

    handle_error "Validating ${description}"
}

# Test packages
validate_package "legacy-workbench"

echo ''
echo '########################   All packages validated successfully!   ###########################'
echo ''
