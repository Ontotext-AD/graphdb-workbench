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

// Configures an environment variable with the key used for common actions (cmd on mac, ctrl on other OS).
// This variable must be used in all actions that type e.g. ctrl-a to select text.
Cypress.env('modifierKey', Cypress.platform === 'darwin' ? '{cmd}' : '{ctrl}');

require('cypress-failed-log');
require('cypress-terminal-report/src/installLogsCollector')();

// We don't want any tests to hit real Google
beforeEach(() => {
    LicenseStubs.stubGoogleCalls();
});
