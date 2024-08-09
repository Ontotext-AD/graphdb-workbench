#!/bin/bash

# This script should be run from the root directory of the project.

# Source the error handling script
source ./scripts/error-handling.sh

install_package() {
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
install_package "legacy-workbench"
install_package "root-config"
install_package "workbench"
install_package "api"
install_package "shared-components"

echo ''
echo '########################   All packages lint check passed successfully!   ###########################'
echo ''
