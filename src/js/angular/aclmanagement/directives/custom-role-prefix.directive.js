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
            // Function to add or remove the custom prefix
            function handleCustomPrefix(value, addPrefix) {
                if (!value || value === '*') {
                    return value;
                }
                const negated = value.startsWith('!');
                const prefix = negated ? '!CUSTOM_' : 'CUSTOM_';
                if (addPrefix) {
                    return prefix + value.replace(/^!/, '');
                }
                return negated ? '!' + value.replace(prefix, '') : value.replace(prefix, '');
            }

            // Check if the element is an input or textarea and has ngModel associated with it
            if ((element[0].tagName === 'INPUT' || element[0].tagName === 'TEXTAREA') && attrs.ngModel) {
                const ngModelCtrl = element.controller('ngModel');

                // Set up ngModel formatters and parsers for input element
                ngModelCtrl.$formatters.push(function(modelValue) {
                    return handleCustomPrefix(modelValue, false);
                });

                ngModelCtrl.$parsers.push(function(viewValue) {
                    return handleCustomPrefix(viewValue, true);
                });
            }
        }
    };
}
