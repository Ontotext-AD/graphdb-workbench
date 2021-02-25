// ***********************************************************
// This example plugins/index.js can be used to load plugins
//
// You can change the location of this file or turn off loading
// the plugins file with the 'pluginsFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/plugins-guide
// ***********************************************************

// This function is called when a project is opened or re-opened (e.g. due to
// the project's config changing)

const webpack = require('@cypress/webpack-preprocessor');
const webpackOptions = require('../../webpack.config.dev');

module.exports = (on, config) => {
    // `on` is used to hook into various events Cypress emits
    // `config` is the resolved Cypress config
    on('task', {
        failed: require('cypress-failed-log/src/failed')()
    });

    const options = {
        // use the same Webpack options to bundle spec files as your app does "normally"
        // which should instrument the spec files in this project
        webpackOptions: webpackOptions,
        watchOptions: {},
    };
    on('file:preprocessor', webpack(options));
    // code coverage plugin sends collected results
    // using its own cy.tasks calls
    require('@cypress/code-coverage/task')(on, config);

    // IMPORTANT to return the config object
    // with the any changed environment variables
    return config;
};
