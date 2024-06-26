/**
 * @ngdoc directive
 * @name propIndeterminate
 * @module graphdb.framework.core.directives.prop-indeterminate
 * @restrict A
 *
 * @description
 * The `propIndeterminate` directive updates the `indeterminate` property of an HTMLInputElement.
 * It allows for a third state in addition to checked and unchecked, where it's unclear whether the item is toggled on or off.
 * This directive sets the `indeterminate` property via JavaScript, as it cannot be set using an HTML attribute.
 *
 * @param {string} propIndeterminate - The value to be set to the indeterminate property of the element.
 *
 * @example
 * <input type="checkbox" prop-indeterminate="true">
 */

const modules = [];

angular
    .module('graphdb.framework.core.directives.prop-indeterminate', modules)
    .directive('propIndeterminate', propIndeterminate);

propIndeterminate.$inject = [];

function propIndeterminate() {
    return {
        restrict: 'A',
        scope: {
            propIndeterminate: '='
        },
        link: ($scope, element, attributes) => {
            const indeterminateChanged = () => {
                element.prop('indeterminate', !!$scope.propIndeterminate);
            };

            // =========================
            // Subscriptions
            // =========================
            const subscriptions = [];

            subscriptions.push($scope.$watch('propIndeterminate', indeterminateChanged));

            const removeAllSubscribers = () => {
                subscriptions.forEach((subscription) => subscription());
            };

            // Deregister the watchers when the scope/directive is destroyed
            $scope.$on('$destroy', removeAllSubscribers);
        }
    };
}
