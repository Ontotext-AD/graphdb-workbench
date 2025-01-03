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

    npm ci --prefix "${package}"

    handle_error "Installing ${description}"
}

# Install package dependencies
install_package "packages/legacy-workbench"
install_package "packages/root-config"
install_package "packages/workbench"
install_package "packages/api"
install_package "packages/shared-components"
install_package "e2e-tests"

echo ''
echo '########################   Installing main project dependencies   ###########################'
echo ''
npm ci

echo ''
echo '########################   All packages installed successfully!   ###########################'
echo ''
