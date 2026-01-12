import * as echarts from 'echarts';
import {ChartData} from './chart-models/chart-data';

/**
 * Chart themes registration and retrieval
 * Allows for setting a custom theme for Echarts
 */
export class ChartThemes {
    static LIGHT_THEME = 'gwLight';
    static DARK_THEME = 'gwDark';

    static initThemes() {
        const gwDarkTheme = ChartThemes.getGwDarkTheme();
        const gwLightTheme = ChartThemes.getGwLightTheme();
        echarts.registerTheme(ChartThemes.DARK_THEME, gwDarkTheme);
        echarts.registerTheme(ChartThemes.LIGHT_THEME, gwLightTheme);
    }

    static getGwLightTheme() {
        return {
            tooltip: {
                backgroundColor: `color-mix(in srgb, ${ChartData.cssVar('--gw-tooltip-background')}, transparent 10%)`,
                textStyle: {
                    color: ChartData.cssVar('--gw-tooltip-color'),
                },
                borderWidth: 0,
            },
        };
    }

    static getGwDarkTheme() {
        return {
            ...ChartThemes.getEchartsDarkTheme(),
            tooltip: {
                backgroundColor: `color-mix(in srgb, ${ChartData.cssVar('--gw-tooltip-background')}, transparent 10%)`,
                textStyle: {
                    color: ChartData.cssVar('--gw-tooltip-color'),
                },
                borderWidth: 0,
            },
        };
    }

    /**
     * Echarts dark theme
     * Not all styling options are included
     */
    static getEchartsDarkTheme() {
        const contrastColor = '#B9B8CE';
        const backgroundColor = '#100C2A';
        const axisCommon = function() {
            return {
                axisLine: {
                    lineStyle: {
                        color: contrastColor,
                    },
                },
                splitLine: {
                    lineStyle: {
                        color: '#484753',
                    },
                },
                splitArea: {
                    areaStyle: {
                        color: ['rgba(255,255,255,0.02)', 'rgba(255,255,255,0.05)'],
                    },
                },
                minorSplitLine: {
                    lineStyle: {
                        color: '#20203B',
                    },
                },
            };
        };
        const colorPalette = [
            '#4992ff',
            '#7cffb2',
            '#fddd60',
            '#ff6e76',
            '#58d9f9',
            '#05c091',
            '#ff8a45',
            '#8d48e3',
            '#dd79ff',
        ];
        const theme = {
            darkMode: true,

            color: colorPalette,
            backgroundColor: backgroundColor,
            axisPointer: {
                lineStyle: {
                    color: '#817f91',
                },
                crossStyle: {
                    color: '#817f91',
                },
                label: {
                    // TODO Contrast of label backgorundColor
                    color: '#fff',
                },
            },
            legend: {
                textStyle: {
                    color: contrastColor,
                },
            },
            textStyle: {
                color: contrastColor,
            },
            title: {
                textStyle: {
                    color: '#EEF1FA',
                },
                subtextStyle: {
                    color: '#B9B8CE',
                },
            },
            toolbox: {
                iconStyle: {
                    borderColor: contrastColor,
                },
            },
            dataZoom: {
                borderColor: '#71708A',
                textStyle: {
                    color: contrastColor,
                },
                brushStyle: {
                    color: 'rgba(135,163,206,0.3)',
                },
                handleStyle: {
                    color: '#353450',
                    borderColor: '#C5CBE3',
                },
                moveHandleStyle: {
                    color: '#B0B6C3',
                    opacity: 0.3,
                },
                fillerColor: 'rgba(135,163,206,0.2)',
                emphasis: {
                    handleStyle: {
                        borderColor: '#91B7F2',
                        color: '#4D587D',
                    },
                    moveHandleStyle: {
                        color: '#636D9A',
                        opacity: 0.7,
                    },
                },
                dataBackground: {
                    lineStyle: {
                        color: '#71708A',
                        width: 1,
                    },
                    areaStyle: {
                        color: '#71708A',
                    },
                },
                selectedDataBackground: {
                    lineStyle: {
                        color: '#87A3CE',
                    },
                    areaStyle: {
                        color: '#87A3CE',
                    },
                },
            },
            visualMap: {
                textStyle: {
                    color: contrastColor,
                },
            },
            timeline: {
                lineStyle: {
                    color: contrastColor,
                },
                label: {
                    color: contrastColor,
                },
                controlStyle: {
                    color: contrastColor,
                    borderColor: contrastColor,
                },
            },
            calendar: {
                itemStyle: {
                    color: backgroundColor,
                },
                dayLabel: {
                    color: contrastColor,
                },
                monthLabel: {
                    color: contrastColor,
                },
                yearLabel: {
                    color: contrastColor,
                },
            },
            timeAxis: axisCommon(),
            logAxis: axisCommon(),
            valueAxis: axisCommon(),
            categoryAxis: axisCommon(),

            line: {
                symbol: 'circle',
            },
            graph: {
                color: colorPalette,
            },
            gauge: {
                title: {
                    color: contrastColor,
                },
            },
            candlestick: {
                itemStyle: {
                    color: '#FD1050',
                    color0: '#0CF49B',
                    borderColor: '#FD1050',
                    borderColor0: '#0CF49B',
                },
            },
        };

        theme.categoryAxis.splitLine.show = false;
        return theme;
    }
}
