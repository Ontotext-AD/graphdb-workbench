import * as angular from 'angular';

type TooltipPosition = {
    left?: number;
    top?: number;
    direction?: number;
};

angular
    .module('graphdb.framework.core.directives.angular-tooltips', [])
    .directive('gdbTooltip', directive);

directive.$inject = ['$timeout', '$compile'];

/**
 * Based on directive from https://github.com/intellipharm-pty-ltd/angular-tooltips
 * Modified to reposition itself and to accept different triggers
 */
function directive($timeout, $compile) {
    return {
        restrict: 'A',
        scope: {
            gdbTooltip: '@',
            fixedPosition: '=',
            titleClass: '@',
            showTrigger: '=',
            hideTrigger: '='
        },
        link: function ($scope, element, attrs) {
            let showTrigger = 'mouseenter';
            let hideTrigger = 'mouseleave';

            if (attrs.showTrigger) {
                showTrigger = attrs.showTrigger;
            }
            if (attrs.hideTrigger) {
                hideTrigger = attrs.hideTrigger;
            }

            // adds the tooltip to the body
            $scope.createTooltip = function (event) {
                if (attrs.gdbTooltip) {
                    // create the tooltip
                    $scope.tooltipElement = angular.element('<div>').addClass('angular-tooltip').addClass($scope.titleClass);

                    // append to the body
                    angular.element(document).find('body').append($scope.tooltipElement);

                    // update the contents and position
                    $scope.updateTooltip(attrs.gdbTooltip);

                    // fade in
                    $scope.tooltipElement.addClass('angular-tooltip-fade-in');
                }
            };

            function setPosition(oldPosition: TooltipPosition = {}) {
                const pos = $scope.calculatePosition($scope.tooltipElement, $scope.getDirection());
                $scope.tooltipElement.addClass('angular-tooltip-' + pos.direction).css(pos);

                if (oldPosition.left !== pos.left || oldPosition.top !== pos.top) {
                    setPosition(pos);
                }
            }

            $scope.updateTooltip = function (title) {
                // insert html into tooltip
                $scope.tooltipElement.html(title);

                // compile html contents into angularjs
                $compile($scope.tooltipElement.contents())($scope);

                // calculate and set the position of the tooltip
                setPosition();

                // stop the standard tooltip from being shown
                $timeout(function () {
                    element.removeAttr('ng-attr-title');
                    element.removeAttr('title');
                });
            };

            // if the title changes the update the tooltip
            $scope.$watch('gdb-tooltip', function (newTitle) {
                if ($scope.tooltipElement) {
                    $scope.updateTooltip(newTitle);
                }
            });

            // removes all tooltips from the document to reduce ghosts
            $scope.removeTooltip = function () {
                const tooltip = angular.element(document.querySelectorAll('.angular-tooltip'));
                tooltip.remove();
            };

            // gets the current direction value
            $scope.getDirection = function () {
                return element.attr('tooltip-placement') || 'top';
            };

            // calculates the position of the tooltip
            $scope.calculatePosition = function (tooltip, direction) {
                const tooltipBounding = tooltip[0].getBoundingClientRect();
                const elBounding = element[0].getBoundingClientRect();
                const scrollLeft = window.scrollX || document.documentElement.scrollLeft;
                const scrollTop = window.scrollY || document.documentElement.scrollTop;
                const arrowPadding = 12;
                const pos: TooltipPosition = {};
                let newDirection = null;

                // calculate the left position
                if ($scope.stringStartsWith(direction, 'left')) {
                    pos.left = elBounding.left - tooltipBounding.width - (arrowPadding / 2) + scrollLeft;
                } else if ($scope.stringStartsWith(direction, 'right')) {
                    pos.left = elBounding.left + elBounding.width + (arrowPadding / 2) + scrollLeft;
                } else if ($scope.stringContains(direction, 'left')) {
                    pos.left = elBounding.left - tooltipBounding.width + arrowPadding + scrollLeft;
                } else if ($scope.stringContains(direction, 'right')) {
                    pos.left = elBounding.left + elBounding.width - arrowPadding + scrollLeft;
                } else {
                    pos.left = elBounding.left + (elBounding.width / 2) - (tooltipBounding.width / 2) + scrollLeft;
                }

                // calculate the top position
                if ($scope.stringStartsWith(direction, 'top')) {
                    pos.top = elBounding.top - tooltipBounding.height - (arrowPadding / 2) + scrollTop;
                } else if ($scope.stringStartsWith(direction, 'bottom')) {
                    pos.top = elBounding.top + elBounding.height + (arrowPadding / 2) + scrollTop;
                } else if ($scope.stringContains(direction, 'top')) {
                    pos.top = elBounding.top - tooltipBounding.height + arrowPadding + scrollTop;
                } else if ($scope.stringContains(direction, 'bottom')) {
                    pos.top = elBounding.top + elBounding.height - arrowPadding + scrollTop;
                } else {
                    pos.top = elBounding.top + (elBounding.height / 2) - (tooltipBounding.height / 2) + scrollTop;
                }

                // check if the tooltip is outside the bounds of the window
                if ($scope.fixedPosition) {
                    if (pos.left < scrollLeft) {
                        newDirection = direction.replace('left', 'right');
                    } else if ((pos.left + tooltipBounding.width) > (window.innerWidth + scrollLeft)) {
                        newDirection = direction.replace('right', 'left');
                    }

                    if (pos.top < scrollTop) {
                        newDirection = direction.replace('top', 'bottom');
                    } else if ((pos.top + tooltipBounding.height) > (window.innerHeight + scrollTop)) {
                        newDirection = direction.replace('bottom', 'top');
                    }

                    if (newDirection) {
                        return $scope.calculatePosition(tooltip, newDirection);
                    }
                }

                // pos.left += 'px';
                // pos.top += 'px';
                // pos.direction = direction;

                return {
                    left: pos.left + 'px',
                    top: pos.top + 'px',
                    direction: pos.direction
                };
            };

            $scope.stringStartsWith = function (searchString, findString) {
                return searchString.substr(0, findString.length) === findString;
            };

            $scope.stringContains = function (searchString, findString) {
                return searchString.indexOf(findString) !== -1;
            };
            if (attrs.gdbTooltip) {
                // attach events to show tooltip
                element.on(showTrigger, $scope.createTooltip);
                element.on(hideTrigger, $scope.removeTooltip);
            } else {
                // remove events
                element.off(showTrigger, $scope.createTooltip);
                element.off(hideTrigger, $scope.removeTooltip);
            }

            element.on('destroy', $scope.removeTooltip);
            $scope.$on('$destroy', $scope.removeTooltip);
        }
    };
}
