#!/bin/bash

# This script should be run from the root directory of the project.

# Source the error handling script
. scripts/error-handling.sh

clean_directory() {
    local path=$1
    local description
    description=$(echo "$path" | sed 's/\// -- /g')

    echo "########################   DELETE -- Cleaning ${description} --   ###########################"
    rm -rf "${path}"

    handle_error "Cleaning ${description}"
}

# Clean
clean_directory "packages/shared-components/.stencil"
clean_directory "packages/shared-components/dist"
clean_directory "packages/shared-components/loader"
clean_directory "packages/shared-components/node_modules"
clean_directory "packages/shared-components/www"
clean_directory "packages/shared-components/package-lock.json"

clean_directory "packages/api/dist"
clean_directory "packages/api/node_modules"
clean_directory "packages/api/coverage"
clean_directory "packages/api/package-lock.json"

clean_directory "packages/workbench/dist"
clean_directory "packages/workbench/node_modules"
clean_directory "packages/workbench/.angular"
clean_directory "packages/workbench/package-lock.json"

clean_directory "packages/legacy-workbench/dist"
clean_directory "packages/legacy-workbench/node_modules"
clean_directory "packages/legacy-workbench/package-lock.json"

clean_directory "packages/root-config/dist"
clean_directory "packages/root-config/node_modules"
clean_directory "packages/root-config/package-lock.json"

clean_directory "e2e-tests/node_modules"
clean_directory "e2e-tests/report"
clean_directory "e2e-tests/cypress"

clean_directory "node_modules"
clean_directory "dist"

echo '########################   All directories cleaned successfully!   ###########################'
echo ''
