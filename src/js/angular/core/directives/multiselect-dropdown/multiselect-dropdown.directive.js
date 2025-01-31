/**
 * @function multiselectDropdown
 * @description
 * A directive for rendering a multi-select dropdown.
 *
 * This directive displays a list of options with checkboxes that allows users
 * to select multiple items. Each option should be an instance of the
 * SelectOptionsModel, which encapsulates the display label, value,
 * selection state, and any additional data. Clicking the toggle button opens/closes
 * the dropdown; clicking outside the dropdown closes it.
 *
 * @example
 * ### HTML Usage:
 * ```html
 * <multiselect-dropdown
 *   ng-model="selectedOptions"
 *   options="myOptions"
 *   dropdown-label="'Choose Items'">
 * </multiselect-dropdown>
 * ```
 *
 * ### Controller Example:
 * ```javascript
 * angular.module('myApp', [])
 *   .controller('ExampleController', function($scope) {
 *     $scope.myOptions = [
 *       new SelectOptionsModel({ label: 'Option A', value: 'A' }),
 *       new SelectOptionsModel({ label: 'Option B', value: 'B' }),
 *       new SelectOptionsModel({ label: 'Option C', value: 'C' })
 *     ];
 *   });
 * ```
 *
 * @param {Array.<SelectOptionsModel>} options - The array of options displayed in the dropdown.
 * @param {string=} [dropdownLabel='Select...'] - (Optional) The placeholder text if no items are selected.
 *
 * @returns {Object} The directive definition object.
 */
angular.module('graphdb.framework.core.directives.multiselect-dropdown', [])
    .directive('multiselectDropdown', ['$translate', function ($translate) {
        return {
            restrict: 'E',
            require: 'ngModel',
            scope: {
                options: '=',
                dropdownLabel: '=?'
            },
            templateUrl: 'js/angular/core/directives/multiselect-dropdown/templates/multiselect-dropdown.html',
            link: function($scope, element, attrs, ngModel) {
                // =========================
                // Public variables
                // =========================
                $scope.isOpen = false;

                // =========================
                // Private methods
                // =========================
                // Close the dropdown if the user clicks outside it.
                const handleDocumentClick = (event) => {
                    if (!element[0].contains(event.target)) {
                        $scope.$apply(() => {
                            $scope.isOpen = false;
                        });
                    }
                };

                const updateModel = () => {
                    const selected = $scope.options.filter(function(option) {
                        return option.selected;
                    });
                    ngModel.$setViewValue(selected);
                }

                // =========================
                // Public methods
                // =========================
                $scope.toggleDropdown = function () {
                    $scope.isOpen = !$scope.isOpen;
                };

                /**
                 * Toggle the selection state of an option.
                 * @param {SelectOptionsModel} option
                 */
                $scope.toggleSelection = function (option) {
                    option.selected = !option.selected;
                    updateModel();
                };

                /**
                 * Build the display text for the dropdown toggle.
                 * Iterates the options and joins the labels of selected options.
                 * @returns {string}
                 */
                $scope.getSelectedText = function () {
                    const selectedOptions = $scope.options.filter((option) => option.selected);
                    if (selectedOptions.length === 0) {
                        return $scope.dropdownLabel || $translate.instant('common.select');
                    }
                    return selectedOptions.map((option) => option.label).join(', ');
                };

                /**
                 * If ngModel provides an initial value, update the corresponding option selections.
                 */
                ngModel.$render = function () {
                    if (angular.isArray(ngModel.$viewValue)) {
                        $scope.options.forEach(function(option) {
                            option.selected = ngModel.$viewValue.some(function(selectedOption) {
                                return selectedOption.value === option.value;
                            });
                        });
                    }
                };

                // =========================
                // Subscriptions
                // =========================
                document.addEventListener('click', handleDocumentClick);
                $scope.$on('$destroy', () => {
                    document.removeEventListener('click', handleDocumentClick);
                });
            }
        };
    }]);
