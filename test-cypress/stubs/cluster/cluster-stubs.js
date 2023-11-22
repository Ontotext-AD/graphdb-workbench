import {Stubs} from "../stubs";

export class ClusterStubs extends Stubs {
    static stubNoClusterGroupStatus() {
        cy.intercept('/rest/cluster/group/status', {
            fixture: '/cluster/no-cluster-group-status.json',
            statusCode: 404
        }).as('no-cluster-group-status');
    }

    static stubClusterGroupStatus() {
        cy.intercept('/rest/cluster/group/status', {
            fixture: '/cluster/3-nodes-cluster-group-status.json',
            statusCode: 200
        }).as('3-nodes-cluster-group-status');
    }

    static stubNoClusterNodeStatus() {
        cy.intercept('/rest/cluster/node/status', {
            fixture: '/cluster/no-cluster-node-status.json',
            statusCode: 404
        }).as('no-cluster-node-status');
    }

    static stubClusterNodeStatus() {
        cy.intercept('/rest/cluster/node/status', {
            fixture: '/cluster/cluster-node-status.json',
            statusCode: 200
        }).as('cluster-node-status');
    }

    static stubNoClusterConfig() {
        cy.intercept('/rest/cluster/config', {
            statusCode: 404
        }).as('no-cluster-config');
    }

    static stubClusterConfig() {
        cy.intercept('/rest/cluster/config', {
            fixture: '/cluster/cluster-config.json',
            statusCode: 200
        }).as('cluster-config');
    }

    static stubCreateCluster() {
        cy.intercept('/rest/cluster/config', {
            fixture: '/cluster/3-nodes-cluster-created.json',
            statusCode: 201
        }).as('3-nodes-cluster-created');
    }

    static stubDeleteCluster() {
        cy.intercept('/rest/cluster/config?force=false', {
            fixture: '/cluster/delete-cluster.json',
            statusCode: 200,
            method: 'DELETE'
        }).as('delete-cluster');
    }

    static stubReplaceNodes() {
        cy.intercept('/rest/cluster/config/node', {
            fixture: '/cluster/replace-nodes.json',
            statusCode: 200,
            method: 'PATCH'
        }).as('replace-nodes');
    }
}
