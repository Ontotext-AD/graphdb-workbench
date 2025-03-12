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
        // Debugging purposes.
        //
        // Example for retrieving browser console errors. Useful, when running tests inside a container,
        // and you don't have access to the actual browser console:
        //
        // const consoleErrors = [];
        //
        // beforeEach(() => {
        //   cy.on('window:before:load', (win) => {
        //     win.console.error = (error, ...args) => {
        //       consoleError.push({error, args });
        //     }
        //   })
        // })
        //
        // afterEach(() => {
        //   const errorContent = consoleErrors.map(({error, args}) => `${error}, ${args.join(', ')}`).join('\n');
        //   cy.task('writeFile', {
        //     filePath: './cypress-error.log',
        //     content: errorContent,
        //   }, { log: false });
        // })`
        //
        // This will result in a cypress-error.log file being created with all browser console errors.
        writeFile({ filePath, content, flag = 'w' }) {
          const dir = path.dirname(filePath);
          if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
          }

          fs.writeFileSync(filePath, content, { flag });
          return null;
        }
      });
    },
  },
});
