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

const fs = require('fs');
const retryTracker = {};
const { GenericContainer, Network, Wait} = require("testcontainers");
const path = require('path');
const dotenv = require('dotenv');
dotenv.config({path: '/workbench/.env'});
const videosToDelete = [];

let currentGraphDbContainer;
let currentWorkbenchContainer;
let network;
let workbenchImagePromise = null;

function getWorkbenchImage() {
    if (!workbenchImagePromise) {
        console.info('Building Workbench image for the first time...');
        const dockerfileDir = '/app';
        const dockerfileName = 'workbench.Dockerfile';
        workbenchImagePromise = GenericContainer
            .fromDockerfile(dockerfileDir, dockerfileName)
            .build();
    }
    return workbenchImagePromise;
}

module.exports = (on, config) => {
    require('@bahmutov/cypress-code-coverage/task')(on, config);
    on('file:preprocessor', require('@bahmutov/cypress-code-coverage/use-browserify-istanbul'));

    // `on` is used to hook into various events Cypress emits
    // `config` is the resolved Cypress config
    on('task', {
        failed: require('cypress-failed-log/src/failed')(),
        /*
         *    Managing Docker Containers:
         *    - It defines custom Cypress tasks to start and stop Docker containers for GraphDB and Workbench.
         *
         *    a. GraphDB Container Management:
         *       - The "startGraphDb" task:
         *         * Checks if a GraphDB container is already running. If so, it returns its connection details.
         *         * If no container is running, it ensures that a Docker network is started.
         *         * Launches a new GraphDB container using a specified Docker image and version.
         *         * Sets up environment variables to configure GraphDB (e.g., import directory, logging level, etc.).
         *         * Exposes the required port (7200) and binds a host directory to the container for data import.
         *         * Attaches the container to the created Docker network and assigns a network alias ("graphdb").
         *         * Stores the container reference in a Map for later retrieval and cleanup.
         *         * Returns the container's host, mapped port, and container ID.
         *
         *       - The "stopGraphDb" task:
         *         * Retrieves the container from the Map using the provided container ID.
         *         * Stops the container and removes its reference from the Map.
         *         * Resets the current container variable.
         *
         *    b. Workbench Container Management:
         *       - The "startWorkbench" task:
         *         * Similar to GraphDB, it checks for an existing Workbench container and returns its details if available.
         *         * If no container exists, it builds a Workbench Docker image from a Dockerfile, passing the GraphDB URL as a build argument.
         *         * Launches the Workbench container with exposed ports using a free port provided via the Cypress configuration.
         *         * Connects the container to the same Docker network and assigns a network alias ("workbench").
         *         * Stores and returns the container details (host, mapped port, container ID).
         *
         *       - The "stopWorkbench" task:
         *         * Stops the Workbench container using its container ID and cleans up the reference.
         */
        startGraphDb: async () => {
            if (currentGraphDbContainer) {
                return {
                    host: currentGraphDbContainer.getHost(),
                    port: currentGraphDbContainer.getFirstMappedPort(),
                    containerId: currentGraphDbContainer.getId(),
                };
            }
            console.info('Starting GraphDB container')

            const gdbVersion = process.env.GDB_VERSION;
            const image = `docker-registry.ontotext.com/graphdb:${gdbVersion}`;
            if (!network) {
                network = await new Network().start();
            }

            const importPath = path.resolve(__dirname, '../fixtures/graphdb-import');
            const license = path.resolve(__dirname, '../fixtures/graphdb.license');

            const licenseExists = fs.existsSync(license);
            console.info(`License file ${license} exists: ${licenseExists}`);

            const container = await new GenericContainer(image)
                .withEnvironment({GDB_JAVA_OPTS: "-Dgraphdb.workbench.importDirectory=/opt/home/import-data/ " +
                        "-Dgraphdb.jsonld.whitelist=https://w3c.github.io/json-ld-api/tests/* " +
                        "-Dgraphdb.stats.default=disabled " +
                        "-Dgraphdb.foreground= "
                    // "-Dgraphdb.logger.root.level=ERROR"
                })
                .withExposedPorts(7200)
                .withWaitStrategy(Wait.forLogMessage(/Started/))
                .withCopyDirectoriesToContainer([
                    {
                        source: importPath,
                        target: "/opt/home/import-data/",
                    }
                ])
                .withCopyFilesToContainer([
                    {
                        source: license,
                        target: "/opt/graphdb/home/conf/graphdb.license",
                    }
                ])
                .withNetworkAliases("graphdb")
                .withNetwork(network)
                .start();

            currentGraphDbContainer = container;
            console.info('Started GraphDB container ' + currentGraphDbContainer.getId())
            return {
                host: container.getHost(),
                port: container.getFirstMappedPort(),
                containerId: container.getId(),
            };
        },

        stopGraphDb: async () => {
            console.info('Stopping GraphDB container ' + currentGraphDbContainer.getId())
            const container = currentGraphDbContainer;
            if (container) {
                await container.stop();
                currentGraphDbContainer = null;
                console.info('GraphDB container stopped.')
            }
            return null;
        },
        startWorkbench: async ({ graphdbPort }) => {
            if (currentWorkbenchContainer) {
                return {
                    host: currentWorkbenchContainer.getHost(),
                    port: currentWorkbenchContainer.getFirstMappedPort(),
                    containerId: currentWorkbenchContainer.getId(),
                };
            }
            console.info('Starting Workbench container');

            const isDocker = process.env.IS_DOCKER === 'true';
            const host = isDocker ? '172.17.0.1' : 'localhost';

            console.info("GRAPHDB_URL "+`http://${host}:${graphdbPort}`);
            console.info("WORKBENCH_PORT "+`${config.env.freePort}`);

            // const containerImage = await GenericContainer.fromDockerfile('/app', 'workbench.Dockerfile')
            //     .withBuildArgs({"GRAPHDB_URL": `http://${host}:${graphdbPort}`})
            //     .build();

            const containerImage = await getWorkbenchImage();

            const container = await containerImage
                .withExposedPorts({container: 80, host: config.env.freePort})
                .withEnvironment({ GRAPHDB_URL: `http://${host}:${graphdbPort}`})
                .withNetworkAliases("workbench")
                .withNetwork(network)
                .start();

            currentWorkbenchContainer = container;
            console.info('Started Workbench container ' + currentWorkbenchContainer.getId())
            return {
                host: container.getHost(),
                port: container.getFirstMappedPort(),
                containerId: container.getId(),
            };
        },

        stopWorkbench: async () => {
            console.info('Stopping Workbench container ' + currentWorkbenchContainer.getId())
            const container = currentWorkbenchContainer;
            if (container) {
                await container.stop();
                currentWorkbenchContainer = null;
                console.info('Workbench container stopped.')
            }
            return null;
        }
    });

    require('cypress-terminal-report/src/installLogsPrinter')(on, {
        logToFilesOnAfterRun: true,
        printLogsToConsole: 'onFail',
        printLogsToFile: 'always',
        outputRoot: config.projectRoot + 'cypress/logs/',
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
                // fs.rmSync(results.video, { recursive: true, force: true });
                // return null;
                videosToDelete.push(results.video);
            }
        }
    });

    on('after:run', async () => {
        console.log('Cleaning up videos for passed specs...');
        videosToDelete.forEach((videoPath) => {
            try {
                fs.rmSync(videoPath, { recursive: true, force: true });
            } catch (e) {
                console.error(`  - Failed to delete ${videoPath}: ${e.message}`);
            }
        });

        if(network) {
            network.stop();
        }

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
    return config;
};
