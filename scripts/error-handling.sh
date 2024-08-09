#!/bin/bash

# Function to handle errors and log the progress
handle_error() {
    if [ $? -ne 0 ]; then
        echo ""
        echo "########################   FAILED -- ${1} --   ###########################"
        echo ""
        exit 1
    fi
    echo "########################   PASSED -- ${1} --   ###########################"
    echo ""
}
