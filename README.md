# graphdb-workbench
The web application for GraphDB APIs

[![Build Status](https://travis-ci.com/Ontotext-AD/graphdb-workbench.svg?branch=master)](https://travis-ci.com/Ontotext-AD/graphdb-workbench)

### Setup Environment

* Checkout or clone the project.
* Enter the project directory and execute `npm install` in order to install all 
needed dependencies locally.

## Development

### Dev server

Running `npm run start:dev` will start webpack development server which servers 
the files from `src/` and proxy requests to `localhost:7200` (default).

### LESS preprocessor

Some of the workbench CSS stylesheets are preprocessed using the [LESS](http://lesscss.org/)
library. The tool used for running the LESS preprocessor is `less-watch-compiler`.
In development mode it can be run in a watch mode by executing `npm run less:watch`. 
Or for one time processing by executing `npm run less:preprocess`.

## Tests

Unit tests can be run by executing `npm test`. 

> It's important to be noted that angular components in the application and the 
tests are built as AMD modules and all new tests must follow the same style. 

Requirejs is used as a module loader. The test framework is Jasmine with Karma 
as test launcher. Karma is configured to watch source and tests files for 
changes and continuously re-executing the tests.

## Workbench standalone

The repo includes sample Dockerfile which can be build and started using `docker-compose up --build`. 
The compose requires to create `.env` file in the root directory of the project where the `HOST_IP` environment variable 
must be specified, e.g. `HOST_IP=10.131.2.176`.

### License
[LICENSE](licenses/LICENSE)
