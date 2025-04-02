import {Stubs} from "../stubs";
import {REPOSITORIES_URL} from "../../support/repository-commands";
import {RepositoriesStub} from "../repositories-stub";

export class RepositoriesStubs extends Stubs {
    static stubRepositories(withDelay = 0, fixture = '/repositories/get-repositories.json') {
        RepositoriesStubs.stubGetQueryResponse('/rest/repositories/all', fixture, 'get-all-repositories', withDelay);
    }

    static spyGetRepositories() {
        cy.intercept('GET', '/rest/repositories/all').as('getRepositories');
    }

    static stubLocations(withDelay = 0) {
        RepositoriesStubs.stubQueryResponse('/rest/locations', '/repositories/get-locations.json', 'get-locations', withDelay);
    }

    static spyCreateLocation() {
        cy.intercept('POST', '/rest/locations').as('createLocation');
    }

    static spyDeleteLocation() {
        cy.intercept('DELETE', '/rest/locations?**').as('deleteLocation');
    }

    static stubEditOntopResponse(repositoryId) {
        this.interceptRepository(repositoryId, 200);
    }

    static stubGetRepositoryConfig(repositoryId, fixture = '/repositories/get-repository-config.json', widthDelay = 0) {
        RepositoriesStubs.stubQueryResponse(`/rest/repositories/${repositoryId}`, fixture, 'get-repository-config');
    }

    static getFixtureParams() {
        return {
            "propertiesFile": {
                "name": "propertiesFile",
                "label": "JDBC properties file",
                "value": "repositories/ontop/ontop_jdbc.properties"
            },
            "lensesFile": {
                "name": "lensesFile",
                "label": "Lenses file",
                "value": ""
            },
            "isShacl": {
                "name": "isShacl",
                "label": "Enable SHACL validation",
                "value": "false"
            },
            "owlFile": {
                "name": "owlFile",
                "label": "Ontology file",
                "value": ""
            },
            "member": {
                "name": "member",
                "label": "FedX repo members",
                "value": []
            },
            "constraintFile": {
                "name": "constraintFile",
                "label": "Constraint file",
                "value": ""
            },
            "obdaFile": {
                "name": "obdaFile",
                "label": "OBDA or R2RML file",
                "value": "repositories/ontop/university-complete.obda"
            },
            "dbMetadataFile": {
                "name": "dbMetadataFile",
                "label": "DB metadata file",
                "value": ""
            }
        };
    }

    static interceptRepository(id, statusCode, extraParams = {}) {
        cy.intercept(`${REPOSITORIES_URL}/${id}?location=`, {
            statusCode,
            body: {
                "id": id,
                "title": "",
                "type": "ontop",
                "sesameType": "graphdb:OntopRepository",
                "location": "",
                "hostName": "localhost",
                "params": { ...this.getFixtureParams(), ...extraParams }
            }
        });
    }

    static stubRepoCreationEndpoints(repositoryId) {
        cy.intercept(REPOSITORIES_URL + '/all', {
            statusCode: 200,
            body: {
                "": [
                    {
                        "id": repositoryId,
                        "title": "",
                        "uri": "http://address:5423/repositories/ontop",
                        "externalUrl": "http://address:5423/repositories/ontop",
                        "local": true,
                        "type": "ontop",
                        "sesameType": "graphdb:OntopRepository",
                        "location": "",
                        "readable": true,
                        "writable": true,
                        "unsupported": false,
                        "state": "ACTIVE"
                    }
                ]
            }
        }).as('getMockRepositories');

        cy.intercept(`${REPOSITORIES_URL}/${repositoryId}/restart?location=*`, {
            statusCode: 200,
            body: {}
        }).as('restartRepository');

        RepositoriesStub.stubBaseEndpoints(repositoryId, [{
            "type": "literal",
            "value": "http://jena.apache.org/ARQ/function/aggregate#"
        }]);
    }

    static stubSaveOntopResponse(repositoryId) {
        cy.intercept(`${REPOSITORIES_URL}/ontop/jdbc-properties?driverType=*`, {
            statusCode: 200,
            body: {
                "id": repositoryId,
                "title": "",
                "type": "ontop",
                "sesameType": "graphdb:OntopRepository",
                "location": "",
                "hostName": "localhost",
                "driverClass": "postgresql",
                "params": this.getFixtureParams()
            }
        }).as('saveChanges');

        cy.intercept(`/rest/repositories/${repositoryId}`, { statusCode: 200 });
    }
}
