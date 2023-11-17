import {ChartData} from "../chart-data";

export class FileDescriptorsChart extends ChartData {
    constructor(translateService, themeService, filter) {
        super(translateService, themeService, false, false, filter);
    }

    chartSetup(chartOptions) {
        const fileDescriptorsChartOptions = {
            yAxis: {
                axisLabel: {
                    formatter: (value) => {
                        return this.formatNumber(value);
                    }
                },
                min: 0
            },
            tooltip: {
                valueFormatter: (value) => {
                    return this.formatNumber(value);
                }
            }
        }
        _.merge(chartOptions, fileDescriptorsChartOptions);
    }

    createDataHolder() {
        return [{
            name: this.translateService.instant('resource.system.file_descriptors.open'),
            type: 'line',
            areaStyle: {},
            showSymbol: false,
            smooth: true,
            color: ChartData.COLORS[1],
            data: []
        }];
    }

    translateLabels() {
        const [fileDescriptorSeries] = this.dataHolder;
        fileDescriptorSeries.name = this.translateService.instant('resource.system.file_descriptors.open');
        this.configureSubtitle()
    }

    addNewData(dataHolder, timestamp, data) {
        this.latestData = {
            maxFileDescriptors: data.maxFileDescriptors,
            openFileDescriptors: data.openFileDescriptors
        }

        this.configureSubtitle();

        if (!data.openFileDescriptors) {
            return;
        }

        dataHolder[0].data.push({
            value: [
                timestamp,
                data.openFileDescriptors
            ]
        });
    }

    configureSubtitle() {
        let subTitleKeyValues;
        if (this.latestData.openFileDescriptors) {
            subTitleKeyValues = [{
                label: this.translateService.instant('resource.system.file_descriptors.max'),
                value: this.formatNumber(this.latestData.maxFileDescriptors)
            }];
        } else {
            subTitleKeyValues = [{
                label: this.translateService.instant('resource.system.file_descriptors.only_unix')
            }];
        }
        this.setSubTitle(subTitleKeyValues);
    }

    updateRange(dataHolder) {
        super.updateRange(dataHolder, 2);
    }
}
