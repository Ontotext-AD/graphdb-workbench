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
        return ['#003663', '#E84E0F', '#02A99A', '#999999'];
    }

    constructor(translateService, themeService, disableRangeUpdate, disableOldDataRemoval, filter) {
        this.secondaryColor = this.extractSecondaryColorFromTheme(themeService);
        this.filter = filter;
        this.disableRangeUpdate = disableRangeUpdate;
        this.disableOldDataRemoval = disableOldDataRemoval;
        this.translateService = translateService;
        this.refreshHandlers = [];
        this.initialChartSetup();
    }

    extractSecondaryColorFromTheme(themeService) {
        const hue = themeService.getThemeDefinition().variables['secondary-color-hue'];
        const lightness = themeService.getThemeDefinition().variables['secondary-color-lightness'];
        const saturation = themeService.getThemeDefinition().variables['secondary-color-saturation'];
        return `hsl(${hue}, ${saturation}, ${lightness})`;
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

    setSubTitle(keyValues, splitAtThird = true) {
        this.chartOptions.title.show = true;
        let subTitleText = '';
        keyValues.forEach((keyValue, i) => {
            if (Array.isArray(keyValue.value) && !keyValue.value.length) {
                return;
            }
            const values = Array.isArray(keyValue.value) ? keyValue.value.join('/') : keyValue.value;
            subTitleText += `{a|${keyValue.label}}`
            if (values !== undefined) {
                subTitleText += `{b|${values}}`
            }
            if (splitAtThird && i === 1) {
                subTitleText += '\n';
            } else {
                subTitleText += ' ';
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

    getDefaultChartOptions(translateService) {
        return {
            title: {
                show: false,
                text: '',
                right: '10%',
                textStyle: {
                    overflow: 'breakAll',
                    rich: {
                        lineHeight: 24,
                        overflow: 'breakAll',
                        a: {
                            align: 'right;',
                            fontWeight: 400,
                            fontSize: 14
                        },
                        b: {
                            color: this.secondaryColor,
                            fontSize: 14,
                            fontWeight: 400
                        },
                    }
                }
            },
            animation: false,
            color: ChartData.COLORS,
            legend: {
                right: '15%',
                top: '6%',
                textStyle: {
                    overflow: 'truncate',
                },
                tooltip: {
                    show: true
                },
                icon: 'circle'
            },
            tooltip: {
                trigger: 'axis',
                axisPointer: {
                    animation: false,
                    label: {
                        formatter: function (params) {
                            return new Date(params.value).toLocaleTimeString();
                        },
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
                    formatter: function (value) {
                        return new Date(value).toLocaleTimeString();
                    }
                }
            },
            yAxis: {
                type: 'value',
                splitLine: {
                    show: true
                },
                axisTick: {
                    lineStyle: {
                        type: 'solid'
                    }
                }
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
