import {ChartData} from '../chart-data';

export class ClusterHealthChart extends ChartData {
    constructor(translateService) {
        super(translateService, true, false);
        this.nodesCount = 0;
    }
    chartSetup(chartOptions) {
        const clusterHealthChartOptions = {
            type: 'stackedAreaChart',
            interpolate: 'step-after',
            stacked: true,
            yAxis: {
                showMaxMin: false,
                tickFormat: function (d) {
                    return d;
                },
                tickValues: () => {
                    return d3.range(0, this.nodesCount + 1, 1);
                }
            }
        };
        Object.assign(chartOptions.chart, clusterHealthChartOptions);
    }

    getTitle() {
        return this.translateService.instant('resources.cluster_health.label');
    }

    createDataHolder() {
        return [{
            key: this.translateService.instant('resources.cluster_health.in_sync'),
            values: []
        }, {
            key: this.translateService.instant('resources.cluster_health.syncing'),
            color: '#ff5508',
            values: []
        }, {
            key: this.translateService.instant('resources.cluster_health.out_sync'),
            color: '#f52121',
            values: []
        }, {
            key: this.translateService.instant('resources.cluster_health.disconnected'),
            color: '#999999',
            values: []
        }];
    }
    addNewData(dataHolder, timestamp, data) {
        const nodesStatus = data.nodesStats;
        this.nodesCount = nodesStatus.nodesInCluster;
        const [nodesInSync, nodesSyncing, nodesOutOfSync, nodesDisconnected] = dataHolder;

        nodesInSync.values.push([timestamp, nodesStatus.nodesInSync]);
        nodesOutOfSync.values.push([timestamp, nodesStatus.nodesOutOfSync]);
        nodesDisconnected.values.push([timestamp, nodesStatus.nodesDisconnected]);
        nodesSyncing.values.push([timestamp, nodesStatus.nodesSyncing]);

        const subTitleValues = {
            leaderElections: data.term,
            failedRecoveries: data.failureRecoveriesCount,
            failedTransactions: data.failedTransactionsCount
        };
        this.setSubTitle(this.translateService.instant('resource.cluster_health.additional_data', subTitleValues));
    }
}
