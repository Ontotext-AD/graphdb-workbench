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
        const [blue, orange, green, grey] = ClusterHealthChart.COLORS;
        return [{
            key: this.translateService.instant('resources.cluster_health.in_sync'),
            color: blue,
            values: []
        }, {
            key: this.translateService.instant('resources.cluster_health.syncing'),
            color: green,
            values: []
        }, {
            key: this.translateService.instant('resources.cluster_health.out_sync'),
            color: orange,
            values: []
        }, {
            key: this.translateService.instant('resources.cluster_health.disconnected'),
            color: grey,
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

        const subTitleKeyValues = [{
            label: this.translateService.instant('resource.cluster_health.leader_elections'),
            value: data.term
        }, {
            label: this.translateService.instant('resource.cluster_health.recoveries'),
            value: data.failureRecoveriesCount
        }, {
            label: this.translateService.instant('resource.cluster_health.failed_transactions'),
            value: data.failedTransactionsCount
        }];

        this.setSubTitle(subTitleKeyValues);
    }
}
