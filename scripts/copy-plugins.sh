#!/bin/bash

# This script checks for a workbench-plugins folder in node_modules and copies its contents to plugins.
# It should be run from the root directory of the project.

# Source the error handling script
. scripts/error-handling.sh

copy_plugins() {
    local source_dir="node_modules/workbench-plugins"
    local target_dir="plugins"

    echo "########################   CHECKING FOR PLUGINS   ###########################"

    # Check if source directory exists
    if [ -d "$source_dir" ]; then
        echo "Found workbench-plugins directory in node_modules"

        # Create target directory if it doesn't exist
        if [ ! -d "$target_dir" ]; then
            echo "Creating plugins directory"
            mkdir -p "$target_dir"
            handle_error "Creating plugins directory"
        fi

        echo "########################   COPYING PLUGINS   ###########################"
        # Copy all contents from source to target
        cp -R "$source_dir"/* "$target_dir"/
        handle_error "Copying plugins from $source_dir to $target_dir"

        echo "########################   PLUGINS COPIED SUCCESSFULLY   ###########################"
    else
        echo "No workbench-plugins directory found in node_modules. Skipping."
    fi

    echo ''
}

copy_plugins
