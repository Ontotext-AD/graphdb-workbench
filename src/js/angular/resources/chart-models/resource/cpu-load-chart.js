import {ChartData} from "../chart-data";

export class CpuLoadChart extends ChartData {
    constructor(translateService, themeService) {
        super(translateService, themeService, false, false);
    }

    chartSetup(chartOptions) {
        const cpuLoadChartOptions = {
            yAxis: {
                axisLabel: {
                    formatter: '{value} %'
                },
                min: 0,
                max: function (value) {
                    return Math.round(value.max > 50 ? 100 : value.max * 2);
                }
            },
            tooltip: {
                valueFormatter: function (value) {
                    return value + '%'
                }
            }
        }
        _.merge(chartOptions, cpuLoadChartOptions);
    }

    createDataHolder() {
        return [{
            name: this.translateService.instant('resource.system.cpu_load.label'),
            type: 'line',
            showSymbol: false,
            smooth: true,
            data: []
        }];
    }

    translateLabels() {
        const [cpuSeries] = this.dataHolder;
        cpuSeries.name = this.translateService.instant('resource.system.cpu_load.label');
    }

    addNewData(dataHolder, timestamp, data) {
        dataHolder[0].data.push({
            value: [
                timestamp,
                this.formatValue(data.cpuLoad)
            ]
        });
    }

    formatValue(cpuLoad) {
        return +parseFloat(cpuLoad).toFixed(4);
    }

    updateRange(dataHolder) {
    }
}
