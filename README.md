# graphdb-workbench
The web application for GraphDB APIs

[![Build Status](https://jenkins.ontotext.com/buildStatus/icon?job=graphdb-workbench-pipeline)]
### Setup Environment

* Clone the project or check it out from version control.
* Open a terminal, navigate to the project's root directory, and run `npm install` to install all required dependencies. 
The `api` project is built automatically in the postinstall script.

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

## License

[LICENSE](licenses/LICENSE)
