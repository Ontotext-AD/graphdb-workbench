import {ChartData} from "../chart-data";

export class FileDescriptorsChart extends ChartData {
    constructor(translateService) {
        super(translateService, false, false);
    }

    chartSetup(chartOptions) {
        chartOptions.chart.yAxis.tickFormat = (d) => FileDescriptorsChart.formatNumber(d);
        chartOptions.chart.color = [chartOptions.chart.color[1]];
    }

    createDataHolder() {
        return [{
            key: this.translateService.instant('resource.system.file_descriptors.open'),
            area: 'true',
            values: []
        }];
    }
    addNewData(dataHolder, timestamp, data) {
        if (!data.openFileDescriptors) {
            const subTitleKeyValues = [{
                label: this.translateService.instant('resource.system.file_descriptors.only_unix')
            }];
            this.setSubTitle(subTitleKeyValues);
            return;
        }
        dataHolder[0].values.push([timestamp, data.openFileDescriptors]);
        const subTitleKeyValues = [{
            label: this.translateService.instant('resource.system.file_descriptors.max'),
            value: FileDescriptorsChart.formatNumber(data.maxFileDescriptors)
        }];
        this.setSubTitle(subTitleKeyValues);
    }
    updateRange(dataHolder) {
        super.updateRange(dataHolder, 2);
    }
}
