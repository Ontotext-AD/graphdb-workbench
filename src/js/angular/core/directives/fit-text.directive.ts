// This is a rework of the ng-FitText.js which can be found here https://github.com/patrickmarabeas/ng-FitText.js
import * as angular from 'angular';
import {debounce} from "lodash";
angular
    .module('graphdb.framework.core.directives.fittext', [])
    .directive('fitText', fitTextDirective);

fitTextDirective.$inject = ['$timeout'];

function fitTextDirective($timeout) {
    return {
        restrict: 'A',
        scope: {
            min: '=',
            max: '='
        },
        link: function (scope, element, attrs) {

            const config = {
                'debounce': debounce,
                'delay': 100,
                'loadDelay': 10,
                'compressor': 1,
                'min': attrs.fitTextMin || 'inherit',
                'max': attrs.fitTextMax || 'inherit',
                'calcSize': 10,
                'lines': 1
            };

            const parent = element.parent();
            const domElem = element[0];
            const domElemStyle = domElem.style;
            const computed = window.getComputedStyle(element[0], null);
            const newlines = element.children().length || config.lines;
            const minFontSize = config.min === 'inherit' ? computed['font-size'] : config.min;
            const maxFontSize = config.max === 'inherit' ? computed['font-size'] : config.max;
            const lineHeight = computed['line-height'];
            const display = computed['display'];
            let resizePromise;

            function calculate() {
                const ratio = (config.calcSize * newlines) / domElem.offsetWidth / newlines;
                return Math.max(Math.min(getMaxFontSize(ratio), parseFloat(maxFontSize)), parseFloat(minFontSize));
            }

            function getMaxFontSize(ratio) {
                const paddingLeft = parseFloat(getComputedStyle(parent[0]).paddingLeft);
                const paddingRight = parseFloat(getComputedStyle(parent[0]).paddingRight);

                return (parent[0].offsetWidth - (paddingLeft + paddingRight)) * ratio * config.compressor;
            }

            function resize() {
                if (domElem.offsetHeight * domElem.offsetWidth === 0) {
                    return;
                }

                // Preset standard values for making the size calculation
                domElemStyle.fontSize = config.calcSize + 'px';
                domElemStyle.lineHeight = '1';
                domElemStyle.display = 'inline-block';

                // Set usage values
                domElemStyle.fontSize = calculate() + 'px';
                domElemStyle.lineHeight = lineHeight;
                domElemStyle.display = display;
            }

            function resizer() {
                if (resizePromise) {
                    $timeout.cancel(resizePromise);
                }

                resizePromise = $timeout(function () {
                    resize();
                }, config.loadDelay);
            }

            scope.$watch(function () {
                return [
                    parent[0].offsetWidth,
                    element[0].offsetWidth
                ].join('_');
            }, function () {
                resizer();
            });

            $(window).on('resize', config.debounce(function () {
                scope.$apply(resizer)
            }, config.delay));

            scope.$on('$destroy', function () {
                if (resizePromise) {
                    $timeout.cancel(resizePromise);
                }
                $(window).off('resize');
            });
        }
    };
}
