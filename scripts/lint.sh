#!/bin/bash

# This script should be run from the root directory of the project.

# Source the error handling script
. scripts/error-handling.sh

lint_package() {
    local package=$1
    local description
    description=$(echo "$package" | sed 's/\// -- /g')

    echo ''
    echo "########################   Linting -- ${description} --   ###########################"
    echo ''

    npm run lint --prefix "packages/${package}"

    handle_error "Linting ${description}"
}
# Install
lint_package "root-config"
lint_package "workbench"
lint_package "api"
lint_package "shared-components"

echo ''
echo '########################   All packages lint check passed successfully!   ###########################'
echo ''
