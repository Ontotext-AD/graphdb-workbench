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


## Jenkins Pipeline Documentation

This pipeline automates the build, test, and deployment process for the `graphdb-workbench` project.

### Overview

The pipeline is configured to execute the following steps:
- Install dependencies
- Build the project
- Run linting and tests
- Perform SonarQube analysis
- Execute Cypress tests for shared components and the Workbench

---

### Important

If new static folders are created in the `dist` folder to be published (or old ones are renamed), they must be added to the BE Spring Security configuration. Failure to do so will prevent the server from serving these resources, causing the Workbench to malfunction.

---

### Pipeline Details

#### Agent
The pipeline uses the `env.AGENT` variable to specify the build node.

#### Tools
- Node.js version `20.11.1`

#### Stages

1. **Build Info**  
   Logs the build agent and branch details.

2. **Install**  
   Installs project dependencies using:
   ```bash
   docker-compose run --rm npm run install:ci
   ```

3. **Build**  
   Builds the project using:
   ```bash
   docker-compose run --rm npm run build
   ```

4. **Lint**  
   Runs linting checks to ensure code quality:
   ```bash
   docker-compose run --rm npm run lint
   ```

5. **Test**  
   Executes unit and integration tests:
   ```bash
   docker-compose run --rm npm run test
   ```

6. **Shared-components Cypress Test**  
   Runs Cypress tests for shared components:
   ```bash
   sudo chown -R $(id -u):$(id -g) .
   npm run cy:run
   ```

7. **Workbench Cypress Test**  
   Executes Workbench-specific Cypress tests (excluding the `master` branch):
   ```bash
   docker-compose --no-ansi -f docker-compose-test.yaml build --force-rm --no-cache --parallel
   docker-compose --no-ansi -f docker-compose-test.yaml up --abort-on-container-exit --exit-code-from cypress
   ```

8. **Sonar**  
   Analyzes code quality with SonarQube:
   ```bash
   npm run sonar
   ```

---

### Notifications
Failure notifications are sent to the user who triggered the build.

---

## Release and publish

The workbench is regularly published as a package in the NPM registry.

### Jenkins Release Pipeline Documentation

This Jenkins pipeline facilitates the release process for the `graphdb-workbench` project. It automates versioning, building, and publishing to npm, ensuring a smooth release workflow.

### Overview

The pipeline includes the following steps:
- Prepare the release: switch branches, update versions, install dependencies, and build the project.
- Publish to npm: publish the project and Cypress tests to the npm registry.
- Post-release: commit and tag the release in Git.

---

### Pipeline Details

#### Agent
The pipeline runs on the `graphdb-jenkins-node`.

#### Tools
- Node.js version `20.11.1`

#### Parameters

1. **Branch**: The branch to check out for the release process.
- Default: `master`
- Quick filtering is enabled.
2. **ReleaseVersion**: The version to release (must be provided).

---

### Stages

#### 1. **Prepare**
- Checks out the specified branch.
- Updates the version using `npm version`.
- Installs dependencies and builds the project:
  ```bash
  npm run install:ci
  npm run build
  ```

#### 2. **Publish**
- Publishes the project and Cypress tests to the npm registry:
  ```bash
  echo //registry.npmjs.org/:_authToken=${NPM_TOKEN} > .npmrc && npm publish
  ```

---

### Post Actions

#### Success
- Commits the version changes to Git.
- Tags the release and pushes both the changes and tags to the remote repository:
  ```bash
  git commit -a -m 'Release ${ReleaseVersion}'
  git tag -a v${ReleaseVersion} -m 'Release v${ReleaseVersion}'
  git push --set-upstream origin ${branch} && git push --tags
  ```

#### Failure
- Sends an email notification to the user who triggered the build with details about the failure.

#### Always
- Resets `.npmrc` after publishing to ensure token security.
---

### Configuration

1. **Jenkins Setup**:
- Node.js tool configured (`nodejs-20.11.1`).
- NPM token stored as a Jenkins credential (`npm-token`).

2. **Environment Variables**:
- `CI`: Used for CI mode.
- `NODE_OPTIONS`: Set to `--openssl-legacy-provider` for compatibility.

3. **Timeout and Concurrency**:
- Builds are limited to a 15-minute timeout.
- Concurrent builds are disabled.

---

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
