import { defineConfig } from 'cypress';
import setupPlugins from './plugins/index.js';

export default defineConfig({
    projectId: 'v35btb',
    fixturesFolder: 'fixtures',
    screenshotsFolder: 'report/screenshots',
    videosFolder: 'report/videos',
    video: true,
    defaultCommandTimeout: 25000,
    numTestsKeptInMemory: 10,
    viewportWidth: 1600,
    viewportHeight: 1200,
    e2e: {
        retries: {
            runMode: 2,
            openMode: 0
        },
        // We've imported your old cypress plugins here.
        // You may want to clean this up later by importing these.
        async setupNodeEvents(on, config) {
            setupPlugins(on, config);
            return config;
        },
        baseUrl: 'http://localhost:9000',
        specPattern: 'e2e-security/**/*.{js,jsx,ts,tsx}',
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
