const { defineConfig } = require('cypress');
const fs = require('fs');
const path = require('path');

module.exports = defineConfig({
  defaultCommandTimeout: 10000,
  e2e: {
    baseUrl: 'http://localhost:3333/',
    video: false,
    setupNodeEvents(on, config) {
      // implement node event listeners here
      on('task', {
        /**
         * Custom task to write browser console logs to a file.
         *
         * @param {Object} params - The parameters for the task.
         * @param {string} params.testTitle - The full title of the failed test.
         * @param {string} params.specName - The name of the spec file.
         * @param {Array} params.logs - Array of log objects captured from the browser console.
         * Each log object should have a "level" property (e.g., 'log', 'error') and an "args" array.
         *
         * @example
         * // If a test fails with the title "Should display error", and the spec file is "example.cy.js",
         * // and logs array is:
         * // [ { level: 'error', args: ['Something went wrong'] }, { level: 'warn', args: ['This is a warning'] } ]
         * // then the task will write a file:
         * // report/console/example/Should_display_error.txt
         * // with the following content:
         * // [ERROR] Something went wrong
         * // [WARN] This is a warning
         */
        writeConsoleLogs({ testTitle, specName, logs }) {
          const safeTitle = testTitle.replace(/[^\w\d]/g, '_');
          const filePath = path.join(
              'report',
              'console',
              specName.replace(/\.cy\.(js|ts)$/, ''),
              `${safeTitle}.txt`
          );
          const dir = path.dirname(filePath);
          if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
          }
          const content = logs.map(({ level, args }) =>
              `[${level.toUpperCase()}] ${args.join(' ')}`
          ).join('\n');
          fs.writeFileSync(filePath, content, { flag: 'w' });
          console.log('📝 Wrote console log file:', filePath);
          return null;
        }
      });
    }
  }
});
