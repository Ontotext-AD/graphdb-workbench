# graphdb-workbench
The web application for GraphDB APIs

[![Build Status](https://jenkins.ontotext.com/buildStatus/icon?job=graphdb-workbench-pipeline)]
### Setup Environment

* Checkout or clone the project.
* Enter the project directory and execute `npm install` in order to install all 
needed dependencies locally.

## Development

### Developers guide

https://ontotext-ad.github.io/graphdb-workbench/developers-guide

### Dev server

Running `npm run start` will bundle application and vendor code in memory and start a webpack 
development server and proxy requests to `localhost:7200` (default).

## Testing

### Acceptance/functional tests

Cypress is used as a framework for writing functional tests which cover concrete UI components as
well as whole acceptance scenarios. The tests are executed against a GraphDB version as defined in
`package.json#versions.graphdb` which is run in a docker container.

> Some tests may require a GraphDB Enterprise Edition license file. The file must be named graphdb.license
and put in the `test-cypress/fixtures` folder. In case you don't have such license, you can ignore the
failing tests.


There are two options for running the tests. One is a headless execution and the second is through
the Cypress's dashboard application. Follow the steps described below: 
* Ensure a GraphDB instance is running on `localhost:7200`. One can be run by executing 
`docker-compose up` in the `graphdb-workbench/test-cypress` folder. Check path directory which is set with **-Dgraphdb.workbench.importDirectory** property when server is started. The folder with this path have to contains all files from "fixture/graphdb-import" 

* In `graphdb-workbench` folder execute `npm run start` to build and run the workbench web 
application. In result, it is published and served by webpack's web dev server.
* In terminal, go in `graphdb-workbench/test-cypress` folder and choose one of the options below: 
    * Execute `npm run test` - this will run the test suite in a headless mode and the outcome log
will be seen in the terminal.
    * Execute `npm run start` or the equivalent `npx cypress open` - this will open the Cypress's
dashboard application through which the tests can be run one by one or altogether and observing the
outcome in the dashboard.
      
> There is a separate acceptance tests suite containing some flaky tests which often fail on CI. 
> That's why these are moved in the `integration-flaky` suite which is doesn't run on CI and is
> responsibility of the developer to run them manually before the commit.
> 
> The flaky test suite can be run similarly to the normal test suite but using following commands:
> `npm run start:flaky` for browser mode or `npm run test:flaky` for a headless mode.

## Release and publish
The workbench is regularly published as a package in the NPM registry.

### Build

Application can be built by executing the `npm run build` command. In result, the application is 
bundled, less files are processed and the code is minified. The result of the build command is 
emitted in the `/dist` folder. When the workbench is published, only the `/dist` folder gets 
published in the NPM registry. This is configured in `package.json#files` property.

## Deploying

### Standalone (Docker)

The repo includes sample Dockerfile that configures NGiNX for serving the workbench and proxying
requests to a GraphDB endpoint. This is configurable via the `GRAPHDB_URL` environment variable. 
Example:

`docker run -d -p 8080:80 -e GRAPHDB_URL=10.131.2.176:7200 graphdb-workbench`

#### Local development

For ease of use in local development with a locally running GraphDB at localhost:7200, there is also a 
Docker compose that can be built and started with `docker-compose up --build`. The compose requires 
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

## License
[LICENSE](licenses/LICENSE)
