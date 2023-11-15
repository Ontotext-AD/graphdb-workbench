import {ChartData} from "../chart-data";

export class DiskStorageChart extends ChartData {
    constructor($translate, ThemeService) {
        super($translate, ThemeService, true, true);
    }

    chartSetup(chartOptions) {
        const diskStorageChart = {
            height: 250,
            tooltip: {
                trigger: 'axis',
                axisPointer: {
                    type: 'shadow',
                    label: null
                },
                valueFormatter: function (value) {
                    return (value * 100).toFixed(2) + '%'
                }
            },
            xAxis: {
                type: 'value',
                min: 0,
                max: 1,
                splitNumber: 2,
                axisLabel: {
                    formatter: function (value) {
                        return (value * 100).toFixed(2) + '%'
                    }
                }
            },
            yAxis: {
                type: 'category',
                data: [this.translateService.instant('resource.storage.logs'),
                    this.translateService.instant('resource.storage.work'),
                    this.translateService.instant('resource.storage.data')],
            },
        }
        _.merge(chartOptions, diskStorageChart);
    }

    createDataHolder() {
        return [{
            name: this.translateService.instant('resource.storage.used'),
            type: 'bar',
            stack: true,
            showSymbol: false,
            smooth: true,
            barCategoryGap: '10%',
            emphasis: {
                focus: 'series',
            },
            label: {
                show: true,
                formatter: function ({value}) {
                    return (value * 100).toFixed(2) + '%'
                }
            },
            color: ChartData.COLORS[1],
            data: []
        }, {
            name: this.translateService.instant('resource.storage.free'),
            type: 'bar',
            stack: true,
            showSymbol: false,
            smooth: true,
            label: {
                show: true,
                formatter: function ({value}) {
                    return (value * 100).toFixed(2) + '%'
                }
            },
            emphasis: {
                focus: 'series'
            },
            color: ChartData.COLORS[0],
            data: []
        }];
    }

    translateLabels() {
        const [used, free] = this.dataHolder;
        used.name = this.translateService.instant('resource.storage.used');
        free.name = this.translateService.instant('resource.storage.free');
        this.chartSetup(this.chartOptions);
        this.configureSubtitle();
    }

    addNewData(dataHolder, timestamp, data, isFirstLoad) {
        const currentData = data.storageMemory;
        const [used, free] = dataHolder;

        this.latestData = {
            data: {
                used: currentData.dataDirUsed,
                free: currentData.dataDirFree
            },
            work: {
                used: currentData.workDirUsed,
                free: currentData.workDirFree
            },
            logs: {
                used: currentData.logsDirUsed,
                free: currentData.logsDirFree
            }
        }

        this.configureSubtitle();

        const totalData = currentData.dataDirUsed + currentData.dataDirFree;
        const totalWork = currentData.workDirUsed + currentData.workDirFree;
        const totalLogs = currentData.logsDirUsed + currentData.logsDirFree;

        const usedData = currentData.dataDirUsed / totalData;
        const usedWork = currentData.workDirUsed / totalWork;
        const usedLogs = currentData.logsDirUsed / totalLogs;
        const freeData = currentData.dataDirFree / totalData;
        const freeWork = currentData.workDirFree / totalWork;
        const freeLogs = currentData.logsDirFree / totalLogs;
        used.data.push(usedLogs, usedWork, usedData)
        free.data.push(freeLogs, freeWork, freeData)
    }

    configureSubtitle() {
        const subTitleKeyValues = [{
            label: this.translateService.instant('resource.storage.subtitle.data'),
            value: [DiskStorageChart.formatBytesValue(this.latestData.data.used, null, this.selectedSeries), DiskStorageChart.formatBytesValue(this.latestData.data.free, null, this.selectedSeries)]
        }, {
            label: this.translateService.instant('resource.storage.subtitle.work'),
            value: [DiskStorageChart.formatBytesValue(this.latestData.work.used, null, this.selectedSeries), DiskStorageChart.formatBytesValue(this.latestData.work.free, null, this.selectedSeries)]
        }, {
            label: this.translateService.instant('resource.storage.subtitle.logs'),
            value: [DiskStorageChart.formatBytesValue(this.latestData.logs.used, null, this.selectedSeries), DiskStorageChart.formatBytesValue(this.latestData.logs.free, null, this.selectedSeries)]
        }];

        this.setSubTitle(subTitleKeyValues);
    }
}
