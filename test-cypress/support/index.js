// ***********************************************************
// This example support/index.js is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands';

// Alternatively you can use CommonJS syntax:
// require('./commands')

import 'cypress-real-events';
import 'cypress-file-upload';
import {LicenseStubs} from "../stubs/license-stubs";
import {SecurityStubs} from "../stubs/security-stubs";

// Configures an environment variable with the key used for common actions (cmd on mac, ctrl on other OS).
// This variable must be used in all actions that type e.g. ctrl-a to select text.
Cypress.env('modifierKey', Cypress.platform === 'darwin' ? '{cmd}' : '{ctrl}');

require('cypress-failed-log');
require('cypress-terminal-report/src/installLogsCollector')();

// We don't want any tests to hit real Google
beforeEach(() => {
    LicenseStubs.stubGoogleCalls();
    // This env variable is set globally in the cypress.config.js and
    // can be changed from within the spec files if needed like this
    // Cypress.env('set_default_user_data', false);
    if (Cypress.env('set_default_user_data')) {
        // cy.setDefaultUserData();
        // Stub the request for updating user data instead of making request
        // to modify it because for some reason this request gets a 401 response
        // for some reason.
        // It'll be good to investigate it a bit sometime.
        SecurityStubs.stubGetAdminUser();
        // SecurityStubs.stubUpdateUserData('admin');
    }
});

/*
 * Before each test run, the "test:before:run" event hook is triggered.
 * - It updates the Cypress configuration's baseUrl using the value stored in the Cypress environment.
 *   This ensures that every test runs against the correct URL endpoint.
 */
Cypress.on('test:before:run', () => {
    Cypress.config('baseUrl', Cypress.env('base'))
});

/*
 * The "before" hook runs once before all tests in a spec start.
 * It performs the following actions:
 *
 * - Calls the "startGraphDb" task to launch a GraphDB Docker container.
 *   The task returns connection details (host, port, containerId) for the GraphDB instance.
 *   A high timeout (300000 ms) is set to allow the container enough time to start.
 *
 * - Once GraphDB is up, the returned port ся used to call the "startWorkbench" task.
 *   This task starts a Workbench testcontainer, passing the GraphDB port as a build argument.
 *   Again, a high timeout is used to ensure that the container is fully started.
 *
 * The end result is that both testcontainers (GraphDB and Workbench) are up and running before any spec begins.
 */
before(() => {
    return cy.task('startGraphDb', {}, { timeout: 300000 })
        .then((details) => cy.task('startWorkbench', {graphdbPort: details.port}, {timeout: 300000}));
});

/*
 * The "after" hook runs once after all tests in a spec have completed.
 * It handles the cleanup process by stopping the testcontainers:
 *
 * - Calls the "stopWorkbench" task to stop the Workbench container.
 * - Calls the "stopGraphDb" task to stop the GraphDB container.
 *
 * The container IDs are retrieved from the Cypress environment variables where they were stored
 * when the containers were started. This cleanup ensures that no resources remain active,
 * preventing resource leaks and maintaining a clean test environment for subsequent runs.
 */
after(() => {
    cy.task('stopWorkbench', { containerId: Cypress.env('config.env.workbenchContainerId') });
    cy.task('stopGraphDb', { containerId: Cypress.env('config.env.graphdbContainerId') });
});
