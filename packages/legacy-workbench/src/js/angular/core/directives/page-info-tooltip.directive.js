/**
 * @ngdoc directive
 * @name pageInfoTooltip
 * @restrict E
 * @scope
 * @element ANY
 * @description
 * The `pageInfoTooltip` directive creates a tooltip that shows context-specific information
 * when the user hovers over the element. The directive listens for `mouseenter` and `mouseleave`
 * events and toggles the popover's visibility.
 *
 * - The directive uses `uib-popover-template` to load and display the content of the tooltip.
 * - It tracks whether the popover is open using `$scope.isPopoverOpen`.
 * - Event listeners are added to manage the popover's open/close state on hover.
 * - All event listeners are cleaned up when the directive's scope is destroyed to avoid memory leaks.
 *
 * @example
 * Usage example in HTML:
 * <h1>
 *     {{title}}
 *     <page-info-tooltip></page-info-tooltip>
 * </h1>
 *
 * @returns {Object} The directive definition object with link function.
 */
angular.module('graphdb.framework.core.directives.page-info-tooltip', [])
    .directive('pageInfoTooltip', function() {
        return {
            restrict: 'E',
            templateUrl: 'js/angular/templates/pageInfoTooltip.html',
            link: function($scope, element) {
                // Track whether the popover is open
                $scope.isPopoverOpen = false;

                const mouseEnterHandler = () => {
                    $scope.$apply(() => {
                        $scope.isPopoverOpen = true;
                    });
                };

                const mouseLeaveHandler = () => {
                    $scope.$apply(() => {
                        $scope.isPopoverOpen = false;
                    });
                };

                // =========================
                // Events
                // =========================
                element.on('mouseenter', mouseEnterHandler);
                element.on('mouseleave', mouseLeaveHandler);

                // Clean up the event listeners on scope destroy
                $scope.$on('$destroy', function() {
                    element.off('mouseenter', mouseEnterHandler);
                    element.off('mouseleave', mouseLeaveHandler);
                });
            }
        };
    });
