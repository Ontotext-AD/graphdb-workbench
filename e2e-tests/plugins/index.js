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

const deleteSync = require('del').deleteSync;
const retryTracker = {};

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

    on('after:spec', (spec, results) => {
        // Retry tracking
        if (!retryTracker.flaky) {
            retryTracker.flaky = {};
        }

        if (!retryTracker.broken) {
            retryTracker.broken = {};
        }

        results.tests.forEach((test) => {
            const title = test.title.join(' ');
            const attempts = test.attempts.length;
            const retries = attempts - 1;

            if (retries < 1) {
                return;
            }

            if (test.state === 'passed') {
                retryTracker.flaky[title] = retries;
            }

            if (test.state === 'failed') {
                retryTracker.broken[title] = retries;
            }
        });

        // Video cleanup
        if (results && results.video) {
            const failures = results.tests.some((test) =>
                test.attempts.some((attempt) => attempt.state === 'failed')
            );
            if (!failures) {
                return deleteSync(results.video);
            }
        }
    });

    on('after:run', () => {
        const { flaky = {}, broken = {} } = retryTracker;

        const printGroup = (label, group) => {
            const entries = Object.entries(group);
            if (entries.length === 0) {
                return;
            }

            console.log(`\n ${label} (${entries.length}):`);
            entries.forEach(([name, retry]) => {
                console.log(`  * ${name}`);
                console.log(`    ↪ retried ${retry} time(s), total runs: ${retry + 1}`);
            });
        };

        if (Object.keys(flaky).length === 0 && Object.keys(broken).length === 0) {
            console.log('\n========================================   Retry  Summary   ========================================\n️ [PASS] No retried tests!\n====================================================================================================\n');
            return;
        }

        console.log('\n========================================   Retry  Summary   ========================================');
        printGroup('[WARNING] Flaky tests', flaky);
        printGroup('[FAIL] Broken tests', broken);
        console.log('====================================================================================================\n');
    });
};
