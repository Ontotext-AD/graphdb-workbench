import {Stubs} from "../stubs";

export class RemoteLocationStubs extends Stubs {
    static stubAddRemoteLocation() {
        cy.intercept('POST', '/rest/locations', {
            fixture: '/remote-location/add-remote-location'
        }).as('add-remote-location');
    }

    static stubGetRemoteLocations(count) {
        cy.intercept('GET', '/rest/locations', {
            fixture: `/remote-location/get-${count}-remote-locations.json`,
            statusCode: 200
        }).as(`get-${count}-remote-locations`);
    }

    static stubGetOneRemoteLocations() {
        cy.intercept('GET', '/rest/locations', {
            fixture: '/remote-location/get-1-remote-locations.json'
        }).as('get-1-remote-locations');
    }

    static stubGetTwoRemoteLocations() {
        cy.intercept('GET', '/rest/locations', {
            fixture: '/remote-location/get-2-remote-locations.json'
        }).as('get-remote-locations');
    }

    static stubRemoteLocationCheck() {
        cy.intercept('GET', '/rest/info/rpc-address?location=*', {
            fixture: '/remote-location/remote-location-check'
        }).as('check-remote-location');
    }

    static stubRemoteLocationFilter() {
        cy.intercept('GET', '/rest/locations?filterClusterLocations=true', {
            fixture: '/remote-location/remote-location-check'
        }).as('check-remote-location');
    }

    static stubRemoteLocationStatusInCluster() {
        cy.intercept('GET', '/rest/locations/active', {
            fixture: '/remote-location/remote-location-status-in-cluster.json'
        }).as('remote-location-status-in-cluster');
    }

    static stubRemoteLocationStatusNotCluster() {
        cy.intercept('GET', '/rest/locations/active', {
            fixture: '/remote-location/remote-location-status-not-in-cluster.json'
        }).as('remote-location-status-not-in-cluster');
    }
}
