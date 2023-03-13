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

const _ = require("lodash");
module.exports = (on, config) => {
    // `on` is used to hook into various events Cypress emits
    // `config` is the resolved Cypress config
    on('task', {
        failed: require('cypress-failed-log/src/failed')()
    });

    require('cypress-terminal-report/src/installLogsPrinter')(on, {
        logToFilesOnAfterRun: true,
        printLogsToConsole: 'onFail',
        outputRoot: config.projectRoot + '/logs/',
        outputTarget: {
            'cypress-logs|txt': 'txt'
        }
    });

    // keep only the videos for the failed specs
    const _ = require('lodash');
    const del = require('del');
    on('after:spec', (spec, results) => {
        if (results && results.video) {
            // Do we have failures for any retry attempts?
            const failures = _.some(results.tests, (test) => {
                return _.some(test.attempts, {state: 'failed'});
            });
            if (!failures) {
                // delete the video if the spec passed and no tests retried
                return del(results.video);
            }
        }
    });
};
