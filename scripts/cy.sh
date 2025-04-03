#!/bin/bash
#
## This script should be run from the root directory of the project.
#
## Source the error handling script
#. scripts/error-handling.sh
#
#run_test() {
#    local package=$1
#    local description
#    description=$(echo "$package" | sed 's/\// -- /g')
#
#    echo ''
#    echo "########################   Cypress Test -- ${description} --   ###########################"
#    echo ''
#
#    npm run cy:run:ci --prefix "packages/${package}"
#
#    handle_error "Cypress Test -- ${description}"
#}
#
## Run cypress tests for each package
#run_test "shared-components"
#
#echo ''
#echo '########################   All tests completed successfully!   ###########################'
#echo ''
#!/bin/bash
# ***************************************************************
# This script is designed to run Cypress tests for a given package.
#
# It accepts an optional parameter which specifies the command suffix
# to be used when invoking npm scripts.
#
# For example:
#   - Running `sh scripts/cy.sh` will use the default suffix "ci" and execute:
#       npm run cy:run:ci --prefix "packages/shared-components"
#
#   - Running `sh scripts/cy.sh down` will execute:
#       npm run cy:run:down --prefix "packages/shared-components"
#
# You can define corresponding npm scripts such as:
#   "cy:run": "sh scripts/cy.sh",
#   "cy:down": "sh scripts/cy.sh down",
#   "cy:up": "sh scripts/cy.sh up",
#
# This allows you to manage different test setups (e.g., bringing services up or down)
# without modifying the script for each package.
#
# Make sure to run this script from the root directory of your project.
# ***************************************************************

# Source the error handling script
. scripts/error-handling.sh

# Accept the command suffix as the first argument.
# If not provided, default to "ci".
cmd_suffix=${1:-ci}

# Function to run the Cypress test for a given package.
run_test() {
    local package=$1
    local description
    description=$(echo "$package" | sed 's/\// -- /g')

    echo ''
    echo "########################   Cypress Test -- ${description} --   ###########################"
    echo ''

    npm run cy:run:"${cmd_suffix}" --prefix "packages/${package}"

    handle_error "Cypress Test -- ${description}"
}

# Run cypress tests for each package
run_test "shared-components"

echo ''
echo '########################   All tests completed successfully!   ###########################'
echo ''
