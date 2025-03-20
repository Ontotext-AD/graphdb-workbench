const { defineConfig } = require('cypress');

module.exports = (async () => {
    const { default: getPort } = await import('get-port');
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
        e2e: {
            setupNodeEvents: async (on, config) => {
                config.env.freePort = freePort
                console.info('baseUrl for this instance of Cypress: http://' + host + ':' + freePort);
                return require('./plugins/index.js')(on, config);
            },
            specPattern: 'integration/**/*.{js,jsx,ts,tsx}',
            supportFile: 'support/index.js',
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
