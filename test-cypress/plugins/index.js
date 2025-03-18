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

const { GenericContainer } = require("testcontainers");
const path = require('path');

let graphDBContainer;

const del = require('del');

module.exports = async (on, config) => {

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

    on('before:spec', async (spec, results) => {
        console.log('========================= Starting spec ==========================');
        graphDBContainer = await new GenericContainer("docker-registry.ontotext.com/graphdb:11.0.0-TR15")
            .withExposedPorts(7200)
            .withEnvironment("GDB_JAVA_OPTS", "-Dgraphdb.workbench.importDirectory=/opt/home/import-data/ -Dgraphdb.jsonld.whitelist=https://w3c.github.io/json-ld-api/tests/* -Dgraphdb.stats.default=disabled -Dgraphdb.foreground= -Dgraphdb.logger.root.level=ERROR")
            .withBindMounts([{
                source: path.join(__dirname,"../fixtures/graphdb-import"),
                target: "/opt/home/import-data/"
            }])
            .start();
    });

    // keep only the videos for the failed specs
    on('after:spec', async (spec, results) => {
        console.log('========================= Ending spec ==========================');

        if (graphDBContainer) {
            console.log("Stopping GraphDB Testcontainer...");
            await graphDBContainer.stop();
        }

        if (results && results.video) {
            // Do we have failures for any retry attempts?
            const failures = results.tests.some((test) => {
                return test.attempts.some((attempt) => attempt.state === 'failed');
            });
            if (!failures) {
                // delete the video if the spec passed and no tests retried
                return del(results.video);
            }
        }
    });
};

// process.on("exit", async () => {
//     if (graphDBContainer) {
//         console.log("Stopping GraphDB Testcontainer...");
//         await graphDBContainer.stop();
//     }
// });
