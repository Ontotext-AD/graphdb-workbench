const {defineConfig} = require('cypress');
const cypressSplit = require('cypress-split');

module.exports = (async () => {
    const {default: getPort} = await import('get-port');
    const freePort = await getPort();
    const isDocker = process.env.IS_DOCKER === 'true';
    const host = isDocker ? '172.17.0.1' : 'localhost';

    return defineConfig({
        projectId: 'v35btb',
        fixturesFolder: 'fixtures',
        screenshotsFolder: 'report/screenshots',
        videosFolder: 'report/videos',
        video: true,
        defaultCommandTimeout: 25000,
        numTestsKeptInMemory: 10,
        trashAssetsBeforeRuns: false,
        e2e: {
            retries: {
                runMode: 2,
                openMode: 0
            },
            // We've imported your old cypress plugins here.
            // You may want to clean this up later by importing these.
            setupNodeEvents(on, config) {
                cypressSplit(on, config);

                config.env.freePort = freePort
                console.info('baseUrl for this instance of Cypress: http://' + host + ':' + freePort);
                require('./plugins')(on, config);
                return config;
            },
            specPattern: 'e2e-legacy/**/cl*.spec.js',
            supportFile: 'support/e2e.js',
            reporter: "cypress-multi-reporters",
            reporterOptions: {
                configFile: 'cypress-reporter-config.json'
            }
        },
        env: {
            set_default_user_data: true,
            base: 'http://' + host + ':' + freePort
        }
    });
})();
