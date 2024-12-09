#!/bin/bash

# This script should be run from the root directory of the project.

# Source the error handling script
. scripts/error-handling.sh

build_package() {
    local package=$1
    local description
    description=$(echo "$package" | sed 's/\// -- /g')

    echo ''
    echo "########################   Building -- ${description} --   ###########################"
    echo ''

    npm run build --prefix "packages/${package}"

    handle_error "Building ${description}"
}

# Build packages
build_package "api"
build_package "shared-components"

echo ''
echo '########################   All packages built successfully!   ###########################'
echo ''
