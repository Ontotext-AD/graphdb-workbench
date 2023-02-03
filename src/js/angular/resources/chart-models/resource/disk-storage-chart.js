import {ChartData} from "../chart-data";

export class DiskStorageChart extends ChartData {
    constructor(translateService, chartOptions) {
        super(translateService, chartOptions, true, true);
    }
    chartSetup(chartOptions) {
        const diskStorageChartOptions = {
            type: 'multiBarHorizontalChart',
            stacked: true,
            showControls: false,
            color: d3.scale.category10().range(),
            xAxis: {
                showMaxMin: false,
                tickFormat: function (d) {
                    return d;
                }
            },
            yAxis: {
                showMaxMin: false,
                tickFormat: function (d) {
                    return (d * 100).toFixed(2) + '%';
                }
            },
            yDomain: [0, 1]
        };
        Object.assign(chartOptions.chart, diskStorageChartOptions);
    }

    createDataHolder() {
        return [{
            key: this.translateService.instant('resource.storage.used'),
            values: []
        }, {
            key: this.translateService.instant('resource.storage.free'),
            values: []
        }];
    }

    addNewData(dataHolder, timestamp, data, isFirstLoad) {
        const storageData = data.storageMemory;
        const [used, free] = dataHolder;

        if (isFirstLoad) {
            used.values.push([this.translateService.instant('resource.storage.data'), 0]);
            used.values.push([this.translateService.instant('resource.storage.work'), 0]);
            used.values.push([this.translateService.instant('resource.storage.logs'), 0]);
            free.values.push([this.translateService.instant('resource.storage.data'), 1]);
            free.values.push([this.translateService.instant('resource.storage.work'), 1]);
            free.values.push([this.translateService.instant('resource.storage.logs'), 1]);
        }

        used.values[0][1] = storageData.dataDirUsed / (storageData.dataDirUsed + storageData.dataDirFree);
        used.values[1][1] = storageData.workDirUsed / (storageData.workDirUsed + storageData.workDirFree);
        used.values[2][1] = storageData.logsDirUsed / (storageData.logsDirUsed + storageData.logsDirFree);
        free.values[0][1] = storageData.dataDirFree / (storageData.dataDirUsed + storageData.dataDirFree);
        free.values[1][1] = storageData.workDirFree / (storageData.workDirUsed + storageData.workDirFree);
        free.values[2][1] = storageData.logsDirFree / (storageData.logsDirUsed + storageData.logsDirFree);
    }
}
