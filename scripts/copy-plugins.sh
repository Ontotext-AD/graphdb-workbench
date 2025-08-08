#!/bin/bash

# This script checks for a workbench-plugins folder in node_modules and copies its contents to plugins.
# It should be run from the root directory of the project.

# Source the error handling script
. scripts/error-handling.sh

copy_plugins() {
    local source_dir="node_modules/graphdb-workbench-plugins/dist"
    local target_dir="plugins"

    echo "########################   CHECKING FOR PLUGINS   ###########################"

    # Delete target directory if it exists to have a clean copy
    if [ -d "$target_dir" ]; then
        echo "Removing existing plugins directory"
        rm -rf "$target_dir"
        handle_error "Removing existing plugins directory"
    fi

    # Check if source directory exists
    if [ -d "$source_dir" ]; then
        echo "Found workbench-plugins directory in node_modules"

        # Create target directory
        echo "Creating plugins directory"
        mkdir "$target_dir"
        handle_error "Creating plugins directory"

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
