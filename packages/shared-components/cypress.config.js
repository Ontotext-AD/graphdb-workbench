const { defineConfig } = require("cypress");
// const codeCoverageTask = require('@cypress/code-coverage/task');

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3333/',
    video: false,
    setupNodeEvents(on, config) {
      require('@cypress/code-coverage/task')(on, config)
      // include any other plugin code...

      // It's IMPORTANT to return the config object
      // with any changed environment variables
      return config
    },
  },
});
