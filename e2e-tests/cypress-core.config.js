import { defineConfig } from 'cypress';
import setupPlugins from './plugins/index.js';

const isCoverage = process.env.COVERAGE === 'true';

const loadCodeCoverage = async (on, config) => {
    const mod = await import('@bahmutov/cypress-code-coverage/plugin');
    const plugin = ('default' in mod) ? mod.default : mod;
    plugin(on, config);
};

export default defineConfig({
    projectId: 'v35btb',
    fixturesFolder: 'fixtures',
    video: false,
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
            if (isCoverage) {
                await loadCodeCoverage(on, config);
            }
            return config;
        },
        baseUrl: 'http://localhost:9000',
        specPattern: ['e2e-legacy/repository/**', 'e2e-legacy/import/**', 'e2e-legacy/sparql-editor/**', 'e2e-legacy/monitor/**', 'e2e-legacy/cluster/**', 'e2e-legacy/ttyg/**'],
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
