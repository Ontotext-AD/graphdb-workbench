import {ChartData} from '../chart-data';

export class ClusterHealthChart extends ChartData {
    constructor($translate) {
        super($translate, true, false);
        this.nodesCount = 0;
    }

    createDataHolder() {
        const inSyncColor = ChartData.cssVar('--gw-cluster-node-status-insync-background');
        const syncingColor = ChartData.cssVar('--gw-cluster-node-status-syncing-background');
        const outOfSyncColor = ChartData.cssVar('--gw-cluster-node-status-outofsync-background');
        const disconnectedColor = ChartData.cssVar('--gw-cluster-node-status-disconnected-background');
        return [{
            name: this.translateService.instant('resources.cluster_health.in_sync'),
            type: 'line',
            stack: 'nodes',
            showSymbol: false,
            step: 'middle',
            areaStyle: {},
            lineStyle: {
                width: 0,
            },
            color: inSyncColor,
            data: [],
        }, {
            name: this.translateService.instant('resources.cluster_health.syncing'),
            type: 'line',
            stack: 'nodes',
            showSymbol: false,
            step: 'middle',
            areaStyle: {},
            lineStyle: {
                width: 0,
            },
            color: syncingColor,
            data: [],
        }, {
            name: this.translateService.instant('resources.cluster_health.out_sync'),
            type: 'line',
            stack: 'nodes',
            showSymbol: false,
            step: 'middle',
            areaStyle: {},
            lineStyle: {
                width: 0,
            },
            color: outOfSyncColor,
            data: [],
        }, {
            name: this.translateService.instant('resources.cluster_health.disconnected'),
            type: 'line',
            stack: 'nodes',
            showSymbol: false,
            step: 'middle',
            areaStyle: {},
            lineStyle: {
                width: 0,
            },
            color: disconnectedColor,
            data: [],
        }];
    }
    addNewData(dataHolder, timestamp, data) {
        const nodesStatus = data.nodesStats;
        this.nodesCount = nodesStatus.nodesInCluster;
        const [nodesInSync, nodesSyncing, nodesOutOfSync, nodesDisconnected] = dataHolder;

        this.latestData = {
            nodesInSync: nodesStatus.nodesInCluster,
            nodesOutOfSync: nodesStatus.nodesOutOfSync,
            nodesDisconnected: nodesStatus.nodesDisconnected,
            nodesSyncing: nodesStatus.nodesSyncing,
            term: data.term,
            failureRecoveriesCount: data.failureRecoveriesCount,
            failedTransactionsCount: data.failedTransactionsCount,
        };

        nodesInSync.data.push({
            value: [
                timestamp,
                nodesStatus.nodesInSync,
            ],
        });
        nodesOutOfSync.data.push({
            value: [
                timestamp,
                nodesStatus.nodesOutOfSync,
            ],
        });
        nodesDisconnected.data.push({
            value: [
                timestamp,
                nodesStatus.nodesDisconnected,
            ],
        });
        nodesSyncing.data.push({
            value: [
                timestamp,
                nodesStatus.nodesSyncing,
            ],
        });

        this.configureSubtitle();
    }

    translateLabels() {
        const [nodesInSync, nodesSyncing, nodesOutOfSync, nodesDisconnected] = this.dataHolder;
        nodesInSync.name = this.translateService.instant('resources.cluster_health.in_sync');
        nodesSyncing.name = this.translateService.instant('resources.cluster_health.syncing');
        nodesOutOfSync.name = this.translateService.instant('resources.cluster_health.out_sync');
        nodesDisconnected.name = this.translateService.instant('resources.cluster_health.disconnected');
        this.configureSubtitle();
    }

    updateRange(dataHolder, multiplier) {
        this.chartOptions.yAxis.max = this.nodesCount;
        this.chartOptions.yAxis.splitNumber = this.nodesCount;
    }

    configureSubtitle() {
        const subTitleKeyValues = [{
            label: this.translateService.instant('resource.cluster_health.leader_elections'),
            value: this.latestData.term,
        }, {
            label: this.translateService.instant('resource.cluster_health.recoveries'),
            value: this.latestData.failureRecoveriesCount,
        }, {
            label: this.translateService.instant('resource.cluster_health.failed_transactions'),
            value: this.latestData.failedTransactionsCount,
        }];

        this.setSubTitle(subTitleKeyValues);
    }
}
