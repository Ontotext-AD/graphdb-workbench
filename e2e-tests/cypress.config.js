import { defineConfig } from 'cypress';
import setupPlugins from './plugins/index.js';
import webpackPreprocessor from '@cypress/webpack-preprocessor';

export default defineConfig({
    projectId: 'v35btb',
    fixturesFolder: 'fixtures',
    screenshotsFolder: 'report/screenshots',
    videosFolder: 'report/videos',
    video: true,
    screenshotOnRunFailure: true,
    trashAssetsBeforeRuns: true,
    defaultCommandTimeout: 10000,
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
            on('file:preprocessor', webpackPreprocessor({
                webpackOptions: {
                    resolve: {
                        extensions: ['.js', '.json'],
                        modules: ['node_modules', '.'],
                        fullySpecified: false,
                        alias: {
                            path: 'path-browserify'
                        },
                        fallback: {
                            // Provide empty mocks for Node.js core modules
                            path: false,
                            fs: false,
                            os: false,
                            crypto: false,
                            util: false,
                            buffer: false,
                            stream: false
                        }
                    },
                    module: {
                        rules: [
                            {
                                test: /\.js$/,
                                resolve: {
                                    fullySpecified: false
                                }
                            }
                        ]
                    },
                    target: 'web',
                }
            }));
            return setupPlugins(on, config);
        },
        baseUrl: 'http://localhost:9000',
        specPattern: './**/*.js',
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
