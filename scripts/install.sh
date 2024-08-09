#!/bin/bash

# This script should be run from the root directory of the project.

# Source the error handling script
. scripts/error-handling.sh

install_package() {
    local package=$1
    local description
    description=$(echo "$package" | sed 's/\// -- /g')

    echo ''
    echo "########################   Installing -- ${description} --   ###########################"
    echo ''

    npm ci --prefix "packages/${package}"

    handle_error "Installing ${description}"
}
# Install
install_package "legacy-workbench"
install_package "root-config"
install_package "workbench"
install_package "api"
install_package "shared-components"

echo ''
echo '########################   All packages installed successfully!   ###########################'
echo ''
