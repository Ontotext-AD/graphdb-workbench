# graphdb-workbench
The web application for GraphDB APIs


## Development

Running `npm run start:dev` will start webpack development server which servers the files from src/ and proxy requests 
to localhost:7200 (default)

Unit tests can be run by executing `npm test`. It's important to be noted that the angular components in the application 
and the tests are build as AMD modules using Requirejs as module loader. The test framework is Jasmine and Karma as test 
launcher. Karma is configured to watch source and tests for changes and continuously re-executing the tests.


The repo includes sample Dockerfile which can be build and started using `docker-compose up --build`. 
The compose requires to create `.env` file in the root directory of the project where the `HOST_IP` environment variable 
must be specified, e.g. `HOST_IP=10.131.2.176`.
