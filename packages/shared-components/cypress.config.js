const { defineConfig } = require("cypress");

module.exports = defineConfig({
  defaultCommandTimeout: 10000,
  e2e: {
    baseUrl: 'http://localhost:3333/',
    video: false,
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
});
