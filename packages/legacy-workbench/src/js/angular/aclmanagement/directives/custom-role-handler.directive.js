/**
 * @ngdoc directive
 * @name customRoleHandler
 * @restrict A
 * @require ngModel
 * @description
 * The `customRoleHandler` directive is used to automatically add or remove the 'CUSTOM_' prefix
 * from the model value bound to an input field. It ensures that the prefix is present in the model
 * for consistency but is removed when displaying the value in the view for better user experience.
 *
 * The directive also includes validation to check if the view value starts with 'CUSTOM_' or '!CUSTOM_'.
 * If the value starts with either of these prefixes, a warning property will be set in ngModel.
 *
 * Length validation is also included. If the input is less than 2 symbols, it is considered invalid (excluding "\*").
 *
 * Special cases:
 * - If the role starts with '!', '!CUSTOM_' is used instead.
 * - If the role is '*', it is considered a special value and is not prefixed.
 * - The negation '!' is not valid with '\*'; thus, '!*' is considered invalid.
 *
 * @usage
 * <input type="text" ng-model="yourModel.role" custom-role-handler>
 *
 * @example
 * In the controller:
 * $scope.yourModel = {
 * role: 'CUSTOM_Admin', // Displays as 'Admin'
 * anotherRole: '!CUSTOM_Manager', // Displays as '!Manager'
 * specialRole: '*', // Displays as '*'
 * };
 *
 * In the template:
 * <input type="text" ng-model="yourModel.role" custom-role-handler>
 * <textarea type="text" ng-model="yourModel.anotherRole" custom-role-handler>
 *
 * @usage
 * ```html
 * <textarea type="text" ng-model="role" custom-role-handler>
 * ```
 *
 * @param {Object} ngModelCtrl AngularJS model controller instance.
 * @param {string} [restrict="A"] Restrict usage to attributes only.
 * @scope
 */
angular.module('graphdb.framework.aclmanagement.directives', [])
    .directive('customRoleHandler', function () {
        return {
            restrict: 'A',
            require: 'ngModel',
            link: function (scope, element, attrs, ngModelCtrl) {
                const customPrefix = "CUSTOM_";
                const negatedCustomPrefix = "!CUSTOM_";
                const subscriptions = [];

                function handleCustomPrefix(value, addPrefix) {
                    if (!value || value === '*') {
                        return value;
                    }
                    const negated = value.startsWith('!');
                    const prefix = negated ? negatedCustomPrefix : customPrefix;
                    if (addPrefix) {
                        return prefix + value.replace(/^!/, '');
                    }
                    return negated ? '!' + value.replace(prefix, '') : value.replace(prefix, '');
                }

                function hasCustomOrNegatedPrefix(value) {
                    return value.toUpperCase().startsWith(customPrefix) || value.toUpperCase().startsWith(negatedCustomPrefix);
                }

                // Set up ngModel formatters and parsers for input element
                ngModelCtrl.$parsers.push(function (viewValue) {
                    ngModelCtrl.$warning = !!(viewValue && hasCustomOrNegatedPrefix(viewValue));
                    return viewValue;
                });

                ngModelCtrl.$formatters.push(function(modelValue) {
                    return handleCustomPrefix(modelValue, false);
                });

                ngModelCtrl.$parsers.push(function(viewValue) {
                    return handleCustomPrefix(viewValue, true);
                });

                // Angular always runs the $validators second (after either the $parsers or $formatters)
                ngModelCtrl.$validators.customRoleValidator = function (value) {
                    if (!value) {
                        return true;
                    }
                    const strippedValue = value.replace(/^(!CUSTOM_|CUSTOM_)/, '');
                    return strippedValue === '*' || strippedValue.length >= 2;
                };

                const unsubscribeListeners = () => {
                    subscriptions.forEach((subscription) => subscription());
                };
                subscriptions.push(scope.$on('$destroy', unsubscribeListeners));
            }
        };
    });
