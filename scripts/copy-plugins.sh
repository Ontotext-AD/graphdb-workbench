#!/bin/bash
. scripts/error-handling.sh

copy_plugins() {
    local source_dir="node_modules/graphdb-workbench-plugins/dist"
    local target_dir="wb-plugins"

    echo "########################   COPYING PLUGINS   ###########################"

    if [ -d "$source_dir" ]; then
        echo "Found plugins, syncing..."
        mkdir -p "$target_dir"
        cp -R "$source_dir"/* "$target_dir"/
        handle_error "Copying plugins from $source_dir to $target_dir"
        echo "########################   PLUGINS COPIED SUCCESSFULLY   ###########################"
    else
        echo "No plugins found in $source_dir"
    fi

    echo ''
}

copy_plugins
