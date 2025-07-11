#!/bin/bash

# This script should be run from the root directory of the project.

# Source the error handling script
. scripts/error-handling.sh

remove_lock() {
    local path=$1
    local description
    description=$(echo "$path" | sed 's/\// -- /g')

    echo "########################   DELETE -- ${description} --   ###########################"
    rm -rf "${path}"

    handle_error "Removing ${description}"
}

# Clean
remove_lock "packages/shared-components/package-lock.json"
remove_lock "packages/api/package-lock.json"
remove_lock "packages/workbench/package-lock.json"
remove_lock "packages/legacy-workbench/package-lock.json"
remove_lock "packages/root-config/package-lock.json"
remove_lock "packages/security-module/package-lock.json"

echo '########################   All package locks are deleted successfully!   ###########################'
echo ''
