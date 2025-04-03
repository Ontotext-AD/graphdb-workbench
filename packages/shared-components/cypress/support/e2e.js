// ***********************************************************
// This example support/e2e.js is processed and
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
import './commands'

// Alternatively you can use CommonJS syntax:
// require('./commands')

import './commands'

// Global array to store browser console logs for the current test.
// This array will be cleared before each test to avoid carrying
// over logs between tests.
let currentTestLogs = [];

/**
 * Global event handler to capture browser console output.
 *
 * The event handler uses Cypress.on('window:before:load') to override
 * the default browser console methods (log, info, warn, error, debug)
 * before the page loads. This ensures that any console messages generated
 * during page load and later execution are captured.
 *
 * Each console message is stored in the currentTestLogs array as an object:
 *   { level: 'error', args: ['An error occurred'] }
 *
 * Example:
 *   If the browser logs "An error occurred" via console.error,
 *   the following object is pushed into currentTestLogs:
 *   { level: 'error', args: ['An error occurred'] }
 */
Cypress.on('window:before:load', (win) => {
  ['log', 'info', 'warn', 'error', 'debug'].forEach((level) => {
    const originalFn = win.console[level];
    win.console[level] = function (...args) {
      currentTestLogs.push({ level, args });
      originalFn.apply(win.console, args);
    };
  });
});

/**
 * beforeEach Hook
 *
 * This hook runs before every test. It clears the currentTestLogs array,
 * ensuring that logs from previous tests do not mix with the logs for the current test.
 */
beforeEach(() => {
  currentTestLogs = [];
});

/**
 * afterEach Hook
 *
 * This hook runs after every test. If the test has failed (i.e.,
 * this.currentTest.state === 'failed') and there are logs captured in the
 * currentTestLogs array, it calls a custom Cypress task named 'writeConsoleLogs'.
 *
 * The custom task 'writeConsoleLogs' (defined in cypress.config.js file)
 * takes care of writing the logs to a file. The file is organized
 * by the test's full title and spec name.
 *
 * Example:
 *   If a test titled "Should display error" in spec "example.cy.js" fails,
 *   the logs will be written to a file like:
 *     report/console/example/Should_display_error.txt
 *   The file will contain formatted log messages:
 *     [ERROR] An error occurred
 *     [WARN] This is a warning message
 */
afterEach(function () {
  if (this.currentTest.state === 'failed' && currentTestLogs.length > 0) {
    const testTitle = this.currentTest.fullTitle();
    const specName = Cypress.spec.name;
    cy.task('writeConsoleLogs', {
      testTitle,
      specName,
      logs: currentTestLogs
    }, { log: false });
  }
});
