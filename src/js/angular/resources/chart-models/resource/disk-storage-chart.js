import {ChartData} from "../chart-data";

export class DiskStorageChart extends ChartData {
    constructor(translateService) {
        super(translateService, true, true);
    }
    chartSetup(chartOptions) {
        const diskStorageChartOptions = {
            type: 'multiBarHorizontalChart',
            height: 250,
            stacked: true,
            showControls: false,
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

    translateLabels(dataHolder) {
        if (!dataHolder) {
            return;
        }
        super.translateLabels(dataHolder);
        const [used, free] = dataHolder;
        if (!used.values.length || !free.values.length) {
            return;
        }
        used.values[0][0] = this.translateService.instant('resource.storage.data');
        used.values[1][0] = this.translateService.instant('resource.storage.work');
        used.values[2][0] = this.translateService.instant('resource.storage.logs');
        free.values[0][0] = this.translateService.instant('resource.storage.data');
        free.values[1][0] = this.translateService.instant('resource.storage.work');
        free.values[2][0] = this.translateService.instant('resource.storage.logs');
    }

    createDataHolder() {
        return [{
            key: this.translateService.instant('resource.storage.used'),
            color: this.chartOptions.chart.color[1],
            values: []
        }, {
            key: this.translateService.instant('resource.storage.free'),
            color: this.chartOptions.chart.color[0],
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

        const subTitleKeyValues = [{
            label: this.translateService.instant('resource.storage.subtitle.data'),
            value: [DiskStorageChart.formatBytesValue(storageData.dataDirUsed), DiskStorageChart.formatBytesValue(storageData.dataDirFree)]
        }, {
            label: this.translateService.instant('resource.storage.subtitle.work'),
            value: [DiskStorageChart.formatBytesValue(storageData.workDirUsed), DiskStorageChart.formatBytesValue(storageData.workDirFree)]
        }, {
            label: this.translateService.instant('resource.storage.subtitle.logs'),
            value: [DiskStorageChart.formatBytesValue(storageData.logsDirUsed), DiskStorageChart.formatBytesValue(storageData.logsDirFree)]
        }];
        this.setSubTitle(subTitleKeyValues);

        const totalData = storageData.dataDirUsed + storageData.dataDirFree;
        const totalWork = storageData.workDirUsed + storageData.workDirFree;
        const totalLogs = storageData.logsDirUsed + storageData.logsDirFree;

        used.values[0][1] = storageData.dataDirUsed / totalData;
        used.values[1][1] = storageData.workDirUsed / totalWork;
        used.values[2][1] = storageData.logsDirUsed / totalLogs;
        free.values[0][1] = storageData.dataDirFree / totalData;
        free.values[1][1] = storageData.workDirFree / totalWork;
        free.values[2][1] = storageData.logsDirFree / totalLogs;
    }
}
