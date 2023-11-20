import {ChartData} from "../chart-data";

export class DiskStorageChart extends ChartData {
    constructor($translate) {
        super($translate, true, true);
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
                    return (value * 100).toFixed(2) + '%';
                }
            },
            xAxis: {
                type: 'value',
                min: 0,
                max: 1,
                splitNumber: 2,
                axisLabel: {
                    formatter: function (value) {
                        return (value * 100).toFixed(2) + '%';
                    }
                }
            },
            yAxis: {
                type: 'category',
                data: [this.translateService.instant('resource.storage.logs'),
                    this.translateService.instant('resource.storage.work'),
                    this.translateService.instant('resource.storage.data')]
            },
            legend: {
                itemStyle: {
                    // Keeps the colors in the legend solid
                    opacity: 1
                }
            }
        };
        _.merge(chartOptions, diskStorageChart);
    }

    createDataHolder() {
        return [
            this.createDataHolderForItem('resource.storage.used', ChartData.COLORS[1]),
            this.createDataHolderForItem('resource.storage.free', ChartData.COLORS[0])
        ];
    }

    /**
     * Creates an item for the data holder.
     * @param {string} translationKey the translation key of the item
     * @param {string} color the color of the item
     * @return {object} the item data object
     */
    createDataHolderForItem(translationKey, color) {
        return {
            name: this.translateService.instant(translationKey),
            type: 'bar',
            stack: true,
            showSymbol: false,
            smooth: true,
            barCategoryGap: '10%',
            color: color,
            itemStyle: {
                // Semi-transparent color of the bar
                opacity: ChartData.AREA_BAR_OPACITY
            },
            label: {
                show: true,
                color: 'black',
                opacity: 1,
                formatter: function ({value}) {
                    return (value * 100).toFixed(2) + '%';
                }
            },
            emphasis: {
                // Solid color of the bar and white text on hover (emphasis)
                itemStyle: {
                    color: color,
                    opacity: 1
                },
                label: {
                    color: 'white'
                }
            },
            data: []
        };
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
