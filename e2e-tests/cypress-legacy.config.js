const {defineConfig} = require('cypress');

module.exports = defineConfig({
    projectId: 'v35btb',
    fixturesFolder: 'fixtures',
    screenshotsFolder: 'report/screenshots',
    videosFolder: 'report/videos',
    video: true,
    defaultCommandTimeout: 25000,
    numTestsKeptInMemory: 10,
    viewportWidth: 1280,
    viewportHeight: 720,
    e2e: {
        retries: {
            runMode: 2,
            openMode: 0
        },
        // We've imported your old cypress plugins here.
        // You may want to clean this up later by importing these.
        setupNodeEvents(on, config) {
            return require('./plugins')(on, config);
        },
        baseUrl: 'http://localhost:9000',
        specPattern: 'e2e-legacy/**/*.{js,jsx,ts,tsx}',
        supportFile: 'support/e2e.js',
        reporter: "cypress-multi-reporters",
        reporterOptions: {
            configFile: 'cypress-reporter-config.json'
        }
    },
    env: {
        set_default_user_data: true
    }
});
