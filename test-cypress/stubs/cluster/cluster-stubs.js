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

    static stubClusterGroupStatusAfterAdd() {
        cy.intercept('/rest/cluster/group/status', {
            fixture: '/cluster/4-nodes-cluster-group-status.json',
            statusCode: 200
        }).as('4-nodes-cluster-group-status');
    }

    static stubClusterGroupStatusAfterDelete() {
        cy.intercept('/rest/cluster/group/status', {
            fixture: '/cluster/2-nodes-cluster-group-status-deleted.json',
            statusCode: 200
        }).as('2-nodes-cluster-group-status-deleted');
    }

    static stubClusterGroupStatusAfterReplaceAndDelete() {
        cy.intercept('/rest/cluster/group/status', {
            fixture: '/cluster/3-nodes-cluster-group-status-after-replace.json',
            statusCode: 200
        }).as('3-nodes-cluster-group-status-after-replace');
    }

    static stubClusterGroupStatusAfterReplace() {
        cy.intercept('/rest/cluster/group/status', {
            fixture: '/cluster/2-nodes-cluster-group-status.json',
            statusCode: 200
        }).as('2-nodes-cluster-group-status');
    }

    static stubDeleteUnusedLocation(uri) {
        cy.intercept(`rest/locations?uri=${uri}`, {
            body: `Successfully removed location '${uri}'`,
            statusCode: 200,
            method: 'DELETE'
        }).as('delete-location');
    }

    static stubClusterWithRecoveryStatusGroupStatus(recoveryStatus) {
        cy.intercept('/rest/cluster/group/status', {
            fixture: `/cluster/3-nodes-cluster-group-status-${recoveryStatus}`,
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

    static stubAddNodesByList(nodes) {
        const response = {};
        nodes.forEach((node) => {
            response[node] = "Node was successfully added in the cluster.";
        });

        cy.intercept({
            method: 'PATCH',
            url: '/rest/cluster/httpConfig'
        }, (req) => {
            req.reply({
                statusCode: 200,
                body: response
            });
        }).as('response-add-nodes');
    }

    static stubDeleteNodesByList(nodes) {
        const response = {};
        nodes.forEach((node) => {
            response[node] = "Cluster was deleted on this node.";
        });

        cy.intercept({
            method: 'PATCH',
            url: '/rest/cluster/httpConfig'
        }, (req) => {
            req.reply({
                statusCode: 200,
                body: response
            });
        }).as('response-delete-nodes');
    }

    static stubReplaceNodesByList(added, removed) {
        const response = {};
        added.forEach((node) => {
            response[node] = "Node was successfully added in the cluster.";
        });
        added.forEach((node) => {
            response[node] = "Node was successfully removed from the cluster.";
        });

        cy.intercept({
            method: 'PATCH',
            url: '/rest/cluster/httpConfig'
        }, (req) => {
            req.reply({
                statusCode: 200,
                body: response
            });
        }).as('response-replace-nodes');
    }

    static stubClusterConfigByList(nodes) {
        const clusterConfig = {
            "electionMinTimeout": 8000,
            "electionRangeTimeout": 6000,
            "heartbeatInterval": 2000,
            "messageSizeKB": 64,
            "verificationTimeout": 1500,
            "transactionLogMaximumSizeGB": 50.0,
            "nodes": nodes
        };

        cy.intercept('GET', '/rest/cluster/config', {
            body: clusterConfig,
            statusCode: 200
        }).as('cluster-config-list');
    }

    static stubCreateClusterByList(nodes) {
        const clusterConfig = {
            "electionMinTimeout": 8000,
            "electionRangeTimeout": 6000,
            "heartbeatInterval": 2000,
            "messageSizeKB": 64,
            "verificationTimeout": 1500,
            "transactionLogMaximumSizeGB": 50.0,
            "nodes": nodes
        };

        cy.intercept('/rest/cluster/httpConfig', {
            body: clusterConfig,
            statusCode: 201
        }).as('2-nodes-cluster-created');
    }

}
