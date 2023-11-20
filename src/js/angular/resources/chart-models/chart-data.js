import * as echarts from "echarts";

export class ChartData {
    /**
     * Defines the default multiplier for chart overhead. The space above the maximum value.
     */
    static get DEFAULT_MULTIPLIER() {
        return 1.2;
    }

    /**
     * Defines the default divisions for chart. Used to calculate chart ticks.
     */
    static get MAXIMUM_DIVISIONS() {
        return 10;
    }

    static get COLORS() {
        // Using the variables, e.g. 'var(--primary-color)' directly confuses some echarts color calculations
        return [
            ChartData.cssVar('--secondary-color'),
            ChartData.cssVar('--primary-color'),
            ChartData.cssVar('--tertiary-color'),
            ChartData.cssVar('--gray-color')
        ];
    }

    static get AREA_BAR_OPACITY() {
        return 0.5;
    }

    /**
     * Retrieve the value of a CSS variable.
     * @param varName variable name, including the -- prefix
     * @returns {string} current value of the variable
     */
    static cssVar(varName) {
        return getComputedStyle(document.documentElement).getPropertyValue(varName);
    }

    constructor(translateService, disableRangeUpdate, disableOldDataRemoval, filter) {
        this.filter = filter;
        this.disableRangeUpdate = disableRangeUpdate;
        this.disableOldDataRemoval = disableOldDataRemoval;
        this.translateService = translateService;
        this.refreshHandlers = [];
        this.initialChartSetup();
    }

    registerRefreshHandler(eventHandler) {
        this.refreshHandlers.push(eventHandler);
    }

    unregisterRefreshHandler(eventHandler) {
        const eventHandlerIndex = this.refreshHandlers.indexOf(eventHandler);
        if (eventHandlerIndex > -1) {
            this.refreshHandlers.splice(eventHandlerIndex, 1);
        }
    }

    initialChartSetup(resetData = true) {
        this.range = 150;
        this.chartOptions = this.getDefaultChartOptions(this.translateService);
        if (resetData) {
            this.dataHolder = this.createDataHolder()
            this.chartOptions.series = this.dataHolder;
            this.firstLoad = true;
        }
        this.chartSetup(this.chartOptions);
    }

    refresh(dataOnly = false) {
        if (!dataOnly) {
            this.chartSetup(this.chartOptions);
            this.updateRange(this.dataHolder);
        }
        this.refreshHandlers.forEach((handler) => handler(this.chartOptions));
    }

    /**
     * Sets the subtitle from a list of items that have a label and a value.
     * @param keyValues the values to set
     * @param itemsPerLine maximum items per line, 0 (the default) means unlimited
     */
    setSubTitle(keyValues, itemsPerLine = 0) {
        this.chartOptions.title.show = true;
        let subTitleText = '';
        keyValues.forEach((keyValue, i) => {
            if (Array.isArray(keyValue.value) && !keyValue.value.length) {
                return;
            }
            const values = Array.isArray(keyValue.value) ? keyValue.value.join('/') : keyValue.value;
            subTitleText += `{a|${keyValue.label}}`;
            if (values !== undefined) {
                subTitleText += `{b|${values}}`;
            }
            if (i + 1 < keyValues.length) {
                if (itemsPerLine > 0 && (i + 1) % itemsPerLine === 0) {
                    subTitleText += '\n';
                } else {
                    subTitleText += '{a| \u00B7 }'; // middle dot
                }
            }
        });
        this.chartOptions.title.text = subTitleText;
    }

    /**
     * Provides chart options if custom setup needs to be done
     * @param chartOptions
     */
    chartSetup(chartOptions) {
    }

    /**
     * Returns the data holder array for the chart data.
     * Must be implemented.
     */
    createDataHolder() {
        throw new Error('Must implement data holder creation');
    }

    /**
     * Adds data to the data holder
     * @param timestamp time of the data
     * @param newData the new data
     */
    addData(timestamp, newData) {
        this.removeOldData(this.dataHolder, this.range);
        this.addNewData(this.dataHolder, timestamp, newData, this.isFirstLoad());
        this.updateRange(this.dataHolder);
        if (this.firstLoad) {
            this.firstLoad = false;
        }
        this.refresh(true);
    }

    /**
     * Removes data from the data holder that is obsolete based on range property
     * @param dataHolder data holder
     * @param range the number of entries to keep
     */
    removeOldData(dataHolder, range) {
        if (this.disableOldDataRemoval) {
            return;
        }
        if (dataHolder[0].data.length > range) {
            dataHolder.forEach((data) => data.data.shift());
        }
    }

    /**
     * Adds data to data holder
     * Must be implemented.
     * @param dataHolder
     * @param timestamp
     * @param data
     * @param isFirstLoad
     */
    addNewData(dataHolder, timestamp, data, isFirstLoad) {
    }

    setSelectedSeries(selectedSeries) {
        this.selectedSeries = selectedSeries;
    }

    /**
     * Updates the chart axis range, based on maximum value in data holder
     * @param dataHolder
     * @param multiplier
     */
    updateRange(dataHolder, multiplier) {
        if (this.disableRangeUpdate) {
            return;
        }
        const [domainUpperBound] = ChartData.calculateMaxChartValueAndDivisions(dataHolder, multiplier, this.selectedSeries);
        this.chartOptions.yAxis.max = domainUpperBound;
    }

    isFirstLoad() {
        return this.firstLoad;
    }

    getDefaultChartOptions() {
        return {
            title: {
                show: false,
                text: '',
                left: 'center',
                textStyle: {
                    overflow: 'breakAll',
                    rich: {
                        a: {
                            fontWeight: 400,
                            fontSize: 14
                        },
                        b: {
                            color: ChartData.cssVar('--secondary-color'),
                            fontWeight: 400,
                            fontSize: 14
                        }
                    }
                }
            },
            animation: false,
            color: ChartData.COLORS,
            legend: {
                right: '15%',
                top: '6%',
                textStyle: {
                    overflow: 'truncate'
                },
                icon: 'circle'
            },
            tooltip: {
                trigger: 'axis',
                axisPointer: {
                    animation: false,
                    label: {
                        formatter: function (params) {
                            return echarts.time.format(params.value, '{HH}:{mm}:{ss}', false);
                        }
                    }
                }
            },
            grid: {
                containLabel: true,
                left: 40
            },
            xAxis: {
                type: 'time',
                splitLine: {
                    show: true
                },
                axisLabel: {
                    hideOverlap: true,
                    padding: 8,
                    formatter: {
                        hour: '{bold|{HH}:{mm}}',
                        minute: '{bold|{HH}:{mm}}',
                        second: '{HH}:{mm}:{ss}'
                    },
                    color: ChartData.cssVar('--gray-color-dark'),
                    rich: {
                        bold: {
                            fontWeight: 500
                        }
                    }
                }
            },
            yAxis: {
                type: 'value',
                splitLine: {
                    show: true
                },
                axisLabel: {
                    color: ChartData.cssVar('--gray-color-dark')
                },
                axisTick: {
                    lineStyle: {
                        type: 'solid'
                    }
                }
            },
            textStyle: {
                // Using the variable 'var(--main-font)' directly confuses echarts' font metrics algorithms
                fontFamily: ChartData.cssVar('--main-font'),
                fontWeight: 400
            }
        };
    }

    /**
     * Returns the maximum value in data holder
     * @param dataHolder
     * @param selectedSeries
     * @return {number}
     */
    static getMaxValueFromDataHolder(dataHolder, selectedSeries) {
        return Math.max(...dataHolder.filter((data) => {
            return !selectedSeries || (angular.isUndefined(selectedSeries[data.name]) || selectedSeries[data.name] === true);
        }).map((data) => ChartData.getMaxValueForDataSeries(data)));
    }

    /**
     * Returns the maximum value in specific data series
     * @param dataSeries
     * @return {number}
     */
    static getMaxValueForDataSeries(dataSeries) {
        return Math.max(...dataSeries.data.map((data) => data.value[1]));
    }

    /**
     * Calculated maximum value for chart axis and divisions width
     * @param dataHolder
     * @param multiplier
     * @param selectedSeries
     * @return {(number|number)[]}
     */
    static calculateMaxChartValueAndDivisions(dataHolder, multiplier, selectedSeries) {
        let maxDataValue;

        if (Array.isArray(dataHolder)) {
            maxDataValue = ChartData.getMaxValueFromDataHolder(dataHolder, selectedSeries);
        } else {
            maxDataValue = ChartData.getMaxValueForDataSeries(dataHolder);
        }
        const maxChartValue = Math.ceil(maxDataValue * (multiplier || ChartData.DEFAULT_MULTIPLIER)) || 1;
        const div = Math.ceil(maxChartValue / ChartData.MAXIMUM_DIVISIONS);
        return [maxChartValue, div];
    }

    /**
     * Returns a D3 range for chart axis based on maximum value and divisions width
     * @param dataHolder
     * @param multiplier
     * @param selectedSeries
     * @return {*}
     */
    static getIntegerRangeForValues(dataHolder, multiplier, selectedSeries) {
        const [maxChartValue, divisions] = ChartData.calculateMaxChartValueAndDivisions(dataHolder, multiplier, selectedSeries);
        return [maxChartValue, divisions];
    }

    static formatBytesValue(value, dataHolder, selectedSeries) {
        let maxChartValue = value;
        if (dataHolder) {
            maxChartValue = ChartData.getMaxValueFromDataHolder(dataHolder, selectedSeries)
        }

        const k = 1024;
        const i = Math.floor(Math.log(maxChartValue) / Math.log(k));
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

        const relativeValue = parseFloat(value) / Math.pow(k, i);
        return `${relativeValue.toFixed(2)} ${sizes[i]}`;
    }

    formatNumber(value) {
        if (angular.isUndefined(value) || !this.filter) {
            return;
        }
        // This may look strange, but I made it like this for consistency. When/if fixing it will be easier to find.
        return this.filter('currency')(value, '', 0);
    }
}
