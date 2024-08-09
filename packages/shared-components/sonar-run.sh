#!/bin/bash

# Ensure that the required environment variables are set
if [ -z "$BRANCH_NAME" ]; then
    echo "Error: BRANCH_NAME environment variable is not set."
    exit 1
fi

# Default to empty values for pull request specific variables
ghprbSourceBranch=${ghprbSourceBranch:-""}
ghprbTargetBranch=${ghprbTargetBranch:-""}
ghprbPullId=${ghprbPullId:-""}

# Run SonarQube analysis based on the branch name
if [ "$BRANCH_NAME" == "master" ]; then
    echo "Running SonarQube analysis on master branch"
    node sonar-project.js --branch="$BRANCH_NAME"
else
    echo "Running SonarQube analysis on pull request"
    node sonar-project.js --branch="$ghprbSourceBranch" --target-branch="$ghprbTargetBranch" --pull-request-id="$ghprbPullId"
fi
