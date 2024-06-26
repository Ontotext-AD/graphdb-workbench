/**
 * @ngdoc directive
 * @name lengthValidator
 * @restrict A
 * @module graphdb.framework.core.directives.length-validator
 * @description
 * A custom AngularJS directive that validates the length of an input string.
 * The directive ensures that the string length falls within a specified range,
 * using the `min-length` and `max-length` attributes.
 *
 * If no `min-length` is provided, the minimum length is set to 0.
 * If no `max-length` is provided, the maximum length is set to Infinity.
 *
 * **Usage:**
 * ```html
 * <input type="text" ng-model="inputText" length-validator min-length="5" max-length="10">
 * ```
 *
 * @param {number} minLength (optional) The minimum length of the input string. Defaults to 0 if not provided.
 * @param {number} maxLength (optional) The maximum length of the input string. Defaults to Infinity if not provided.
 * @requires ngModel
 */
angular.module('graphdb.framework.core.directives.length-validator', [])
    .directive('lengthValidator', function () {
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function(scope, element, attrs, ngModel) {
            function validateLength(value) {
                const minLength = attrs.minLength ? parseInt(attrs.minLength, 10) : 0;
                const maxLength = attrs.maxLength ? parseInt(attrs.maxLength, 10) : Infinity;
                const isValid = value && value.length >= minLength && value.length <= maxLength;
                ngModel.$setValidity('lengthValidator', isValid);
                return value;
            }
            ngModel.$parsers.push(validateLength);
            ngModel.$formatters.push(validateLength);
        }
    };
});
