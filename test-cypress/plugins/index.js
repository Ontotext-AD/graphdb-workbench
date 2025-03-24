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

const del = require('del');
const { GenericContainer, Network, Wait} = require("testcontainers");
const path = require('path');

const graphDbContainers = new Map();
const workbenchContainers = new Map();
let currentGraphDbContainer;
let currentWorkbenchContainer;
let network;

module.exports = (on, config) => {
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
            const gdbVersion = '11.0.0-TR14';
            const image = `docker-registry.ontotext.com/graphdb:${gdbVersion}`;
            if (!network) {
                network = await new Network().start();
            }

            const container = await new GenericContainer(image)
                .withEnvironment(
                    "GDB_JAVA_OPTS",
                    "-Dgraphdb.workbench.importDirectory=/opt/home/import-data/ " +
                    "-Dgraphdb.jsonld.whitelist=https://w3c.github.io/json-ld-api/tests/* " +
                    "-Dgraphdb.stats.default=disabled " +
                    "-Dgraphdb.foreground= " +
                    "-Dgraphdb.logger.root.level=ERROR"
                )
                .withExposedPorts(7200)
                .withWaitStrategy(Wait.forLogMessage(/Started/))
                .withBindMounts([
                    {
                        source: path.join("../fixtures/graphdb-import"),
                        target: "/opt/home/import-data/"
                    }
                ])
                .withNetworkAliases("graphdb")
                .withNetwork(network)
                .start();

            graphDbContainers.set(container.getId(), container);
            currentGraphDbContainer = container;
            config.env.graphdbContainerId = container.getId();

            return {
                host: container.getHost(),
                port: container.getFirstMappedPort(),
                containerId: container.getId(),
            };
        },

        stopGraphDb: async ({ containerId }) => {
            const container = graphDbContainers.get(containerId);
            if (container) {
                await container.stop();
                graphDbContainers.delete(containerId);
                currentGraphDbContainer = null;
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

            const isDocker = process.env.IS_DOCKER === 'true';
            const host = isDocker ? '172.17.0.1' : 'localhost';

            const containerImage = await GenericContainer.fromDockerfile('../')
                .withBuildArgs({"GRAPHDB_URL": `http://${host}:${graphdbPort}`})
                .build();

            const container = await containerImage
                .withExposedPorts({container: 80, host: config.env.freePort})
                .withNetworkAliases("workbench")
                .withNetwork(network)
                .start();

            workbenchContainers.set(container.getId(), container);
            currentWorkbenchContainer = container;

            config.env.workbenchContainerId = container.getId();

            return {
                host: container.getHost(),
                port: container.getFirstMappedPort(),
                containerId: container.getId(),
            };
        },

        stopWorkbench: async ({ containerId }) => {
            const container = workbenchContainers.get(containerId);
            if (container) {
                await container.stop();
                workbenchContainers.delete(containerId);
                currentWorkbenchContainer = null;
            }
            return null;
        }
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
    on('after:spec', (spec, results) => {
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
    /*
     *  Cleanup of Docker Resources:
     *    - Defines an "after:run" hook which is triggered after all tests have completed.
     *    - This hook ensures that the Docker network (if it was created) is properly stopped,
     *      preventing resource leaks.
     *
     */
    on('after:run', () => {
        if(network) {
            network.stop();
        }
    });
};
