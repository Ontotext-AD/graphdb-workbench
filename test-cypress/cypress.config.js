const { defineConfig } = require('cypress')

module.exports = defineConfig({
  projectId: 'v35btb',
  fixturesFolder: 'fixtures',
  screenshotsFolder: 'report/screenshots',
  videosFolder: 'report/videos',
  video: false,
  defaultCommandTimeout: 30000,
  numTestsKeptInMemory: 10,
  e2e: {
    // We've imported your old cypress plugins here.
    // You may want to clean this up later by importing these.
    setupNodeEvents(on, config) {
      return require('./plugins/index.js')(on, config)
    },
    baseUrl: 'http://localhost:9000',
    specPattern: 'integration/**/*.{js,jsx,ts,tsx}',
    supportFile: 'support/index.js',
  },
})
