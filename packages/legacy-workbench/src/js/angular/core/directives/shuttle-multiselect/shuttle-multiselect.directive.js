import {cloneDeep} from "lodash";

angular
    .module('graphdb.framework.core.directives.shuttle-multiselect', [])
    .directive('shuttleMultiselect', ShuttleMultiselect);

ShuttleMultiselect.$inject = [];

function ShuttleMultiselect() {
    return {
        restrict: 'E',
        scope: {
            /**
             * The list of options to be displayed in the shuttle.
             * @type {{label: string, id: string}[]}
             */
            options: '=',
            /**
             * The list of selected options.
             * @type {{label: string, id: string}[]}
             */
            selected: '=',
            /**
             * availableOptionsTitle
             * availableOptionsFilter
             * selectedOptionsTitle
             * selectedOptionsCount
             * selectTooltip
             * selectAllLabel
             * selectAllTooltip
             * deselectTooltip
             * deselectAllLabel
             * deselectAllTooltip
             */
            labels: '='
        },
        templateUrl: 'js/angular/core/directives/shuttle-multiselect/templates/shuttle-multiselect.html',
        link: function ($scope) {

            // =========================
            // Private variables
            // =========================

            const subscriptions = [];

            // =========================
            // Public variables
            // =========================

            $scope.searchLeft = '';
            $scope.availableOptions = [];
            $scope.selectedOptions = [];

            // =========================
            // Public functions
            // =========================

            $scope.selectOption = (option) => {
                $scope.selectedOptions.push(option);
                $scope.availableOptions = $scope.availableOptions.filter((opt) => opt !== option);
                updateSelected();
            };

            $scope.selectAll = () => {
                $scope.selectedOptions = $scope.selectedOptions.concat($scope.availableOptions);
                $scope.availableOptions = [];
                updateSelected();
            };

            $scope.deselectOption = (option) => {
                $scope.availableOptions.push(option);
                $scope.selectedOptions = $scope.selectedOptions.filter((opt) => opt !== option);
                updateSelected();
            };

            $scope.deselectAll = () => {
                $scope.availableOptions = $scope.availableOptions.concat($scope.selectedOptions);
                $scope.selectedOptions = [];
                updateSelected();
            };

            // =========================
            // Private functions
            // =========================

            const updateSelected = () => {
                $scope.selected = [...$scope.selectedOptions];
            };

            // =========================
            // Subscriptions
            // =========================

            const removeAllSubscribers = () => {
                subscriptions.forEach((subscription) => subscription());
            };

            // Deregister the watcher when the scope/directive is destroyed
            $scope.$on('$destroy', removeAllSubscribers);

            const onInit = () => {
                $scope.selectedOptions = cloneDeep($scope.selected);
                // If there are selected options, filter them out from the available options
                if ($scope.selectedOptions.length) {
                    $scope.availableOptions = $scope.options
                        .filter(
                            (option) => !$scope.selectedOptions
                                .find((selectedOption) => selectedOption.id === option.id));
                } else {
                    $scope.availableOptions = cloneDeep($scope.options);
                }
            }
            onInit();
        }
    };
}
