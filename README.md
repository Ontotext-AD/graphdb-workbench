# graphdb-workbench
The web application for GraphDB APIs

[![Build Status](https://jenkins.ontotext.com/buildStatus/icon?job=graphdb-workbench-pipeline)]
### Setup Environment

* Clone the project or check it out from version control.
* Open a terminal, navigate to the project's root directory, and run `npm install:ci` to install all required dependencies. 
The `api` project is built automatically.

## Development

### Developers guide

https://ontotext-ad.github.io/graphdb-workbench/developers-guide

### Dev server

The workbench can be run in a development mode by executing `npm run start`. This will start each of the child applications
in watch mode and will proxy requests to a GraphDB instance running on `localhost:7200` (default).

## Testing

### Acceptance/functional tests


## Release and publish

The workbench is regularly published as a package in the NPM registry.

### Build


## Deploying


### Standalone (Docker)


#### Local development

For ease of use in local development with a locally running GraphDB at localhost:7200, there is also a
Docker compose that can be built and started with `docker-compose up --build`. The docker-compose requires
to have `.env` file in the root directory of the project where the `HOST_IP` environment variable
must be specified, e.g. `HOST_IP=10.131.2.176`. This is needed to proxy requests to locally running GraphDB.

### Using GraphDB distribution

GraphDB exposes a configuration param `-Dgraphdb.workbench.home` for overriding the bundled workbench.
This allows to easily point it to the `dist/` folder of the workbench after it has been bundled
with `npm run build`.

Note: Wrongly configuring the parameter will result in GraphDb responding with HTTP 404.

#### GraphDB Docker distribution

The Docker distribution of GraphDB can also be configured to serve custom workbench, the only difference
is that the workbench must be mounted, example:

```
docker run -d \
    -p 7200:7200 \
    -v /graphdb-workbench/dist:/workbench docker-registry.ontotext.com/graphdb-free:9.0.0 \
    -Dgraphdb.workbench.home=/workbench
```

Note: Instead of mounting the workbench, this can be done in a custom Docker image using the
GraphDB one as a base and then copy the custom workbench.

## CI

The CI pipeline is managed using a Jenkinsfile, which defines the stages for building, testing, and analyzing the project.

The CI pipeline uses a Docker Compose utility setup to ensure independence from the Node.js version installed on the Jenkins agent.

The **Jenkinsfile** defines the CI pipeline for building, testing, and analyzing the **GraphDB Workbench** project. Below is an overview of the workflow:

| **Stage**        | **Purpose**                                          | **Tools/Commands**                     |
|------------------|------------------------------------------------------|----------------------------------------|
| **Build Info**   | Logs environment details for traceability            |                                        |
| **Install**      | Installs dependencies and builds packages            | `npm run install:ci`, `docker-compose` |
| **Build**        | Builds the project                                   | `npm run buid`, `docker-compose`       |
| **Lint**         | Performs lint checks                                 | `npm run lint`, `docker-compose`       |
| **Test**         | Runs unit tests                                      | `npm run test`, `docker-compose`       |
| **Cypress Test** | Executes end-to-end tests                            | `npm run cy:run`,                      |
| **Sonar**        | Performs static code analysis to ensure code quality | `npm run sonar`                        |

Note: If any stage fails, the pipeline is marked as failed, but proceeds to the next stage.

## License

[LICENSE](licenses/LICENSE)
