# graphdb-workbench
The web application for GraphDB APIs


## Development

Running `npm run start:dev` will start webpack development server which servers the files from src/ and proxy requests 
to localhost:7200 (default)


The repo includes sample Dockerfile which can be build and started using `docker-compose up --build`. 
The compose requires to create `.env` file in the root directory of the project where the `HOST_IP` environment variable 
must be specified, e.g. `HOST_IP=10.131.2.176`.