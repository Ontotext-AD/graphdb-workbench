angular
    .module('graphdb.framework.aclmanagement.directives', [])
    .directive('customRolePrefix', customRolePrefixDirective);

/**
 * @ngdoc directive
 * @name customRolePrefix
 * @module app
 * @restrict A
 * @description
 * The `customRolePrefix` directive is used to automatically add or remove the 'CUSTOM_' prefix
 * from the model value bound to an input field. It ensures that the prefix is present in the model
 * for consistency but is removed when displaying the value in the edit view for better user experience.
 *
 * The directive also includes validation to check if the view value starts with 'CUSTOM_' or '!CUSTOM_'.
 * If the value starts with either of these prefixes, a warning property will be set in ngModel.
 *
 * Special cases:
 * - If the role starts with '!', '!CUSTOM_' is used instead.
 * - If the role is '*', it is considered a special value and is not prefixed.
 * - The negation '!' is not valid with '*'; thus, '!*' is considered invalid.
 *
 * @usage
 * <input type="text" ng-model="yourModel.role" custom-role-prefix>
 * <!-- For non-input elements -->
 * <td custom-role-prefix>{{yourModel.role}}</td>
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
 * <input type="text" ng-model="yourModel.role" custom-role-prefix>
 * <input type="text" ng-model="yourModel.anotherRole" custom-role-prefix>
 * <td custom-role-prefix>{{yourModel.specialRole}}</td>
 *
 * @return {Object} Directive definition object with restrict, require, and link properties.
 */
function customRolePrefixDirective() {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            const customPrefix = "CUSTOM_";
            const negatedCustomPrefix = "!CUSTOM_";
            const subscriptions = [];

            // Function to add or remove the custom prefix
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

            function hasCustomOrNegatedPrefix(tag) {
                return tag.startsWith(customPrefix) || tag.startsWith(negatedCustomPrefix);
            }

            // Check if the element is an input, textarea, or tags-input and has ngModel associated with it
            const isNgTagsInput = element[0].nodeName.toLowerCase() === 'tags-input';

            if ((element[0].tagName === 'INPUT' || element[0].tagName === 'TEXTAREA' || isNgTagsInput) && attrs.ngModel) {
                const ngModelCtrl = element.controller('ngModel');

                if (isNgTagsInput) {
                    ngModelCtrl.$parsers.push(function (viewValue) {
                        if (Array.isArray(viewValue)) {
                            ngModelCtrl.$warning = viewValue.some((tag) => hasCustomOrNegatedPrefix(tag));
                        }
                        return viewValue;
                    });

                    subscriptions.push(scope.$watch(attrs.ngModel, function (newVal) {
                        if (Array.isArray(newVal)) {
                            ngModelCtrl.$warning = newVal.some((tag) => hasCustomOrNegatedPrefix(tag));
                        }
                    }, true));
                } else {
                    // Validation for single input or textarea
                    ngModelCtrl.$parsers.push(function (viewValue) {
                        ngModelCtrl.$warning = !!(viewValue && hasCustomOrNegatedPrefix(viewValue));
                        return viewValue;
                    });

                    // Set up ngModel formatters and parsers for input element
                    ngModelCtrl.$formatters.push(function(modelValue) {
                        return handleCustomPrefix(modelValue, false);
                    });

                    ngModelCtrl.$parsers.push(function(viewValue) {
                        return handleCustomPrefix(viewValue, true);
                    });
                }
            }

            const unsubscribeListeners = () => {
                subscriptions.forEach((subscription) => subscription());
            };

            subscriptions.push(scope.$on('$destroy', unsubscribeListeners));
        }
    };
}
