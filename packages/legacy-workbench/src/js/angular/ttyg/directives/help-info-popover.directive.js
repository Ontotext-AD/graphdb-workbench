/**
 * @name helpInfoPopover
 * @restrict E
 * @scope
 *
 * @description
 * Custom element directive for showing a help info popover on hover. The content is
 * passed in through the `helpInfo` attribute and rendered using an external template.
 *
 * @param {Object} helpInfo - The help information to be displayed in the popover.
 *
 * @example
 * <help-info-popover help-info="myHelpData"></help-info-popover>
 *
 * @returns {Object} Directive definition object
 */
angular.module('graphdb.framework.core.directives.help-info-popover', [])
    .directive('helpInfoPopover', function() {
        return {
            restrict: 'E',
            scope: {
                helpInfo: '=',
            },
            templateUrl: 'js/angular/ttyg/templates/modal/helpInfoPopoverTemplate.html',
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
            },
        };
    });
