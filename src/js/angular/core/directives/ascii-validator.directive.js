/**
 * @ngdoc directive
 * @name asciiValidator
 * @restrict A
 * @module graphdb.framework.core.directives.ascii-validator
 * @description
 * A custom AngularJS directive that validates if an input string contains only printable ASCII characters,
 * excluding spaces. Printable ASCII characters range from ASCII code 33 (`!`) to ASCII code 126 (`~`).
 *
 * **Usage:**
 * ```html
 * <input type="text" ng-model="inputText" ascii-validator>
 * ```
 *
 * @requires ngModel
 */
angular.module('graphdb.framework.core.directives.ascii-validator', [])
    .directive('asciiValidator', function () {
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function(scope, element, attrs, ngModel) {
            function validateAscii(value) {
                // Regular expression for printable ASCII characters excluding space (ASCII codes 33-126)
                const asciiRegex = /^[\x21-\x7E]*$/;

                const isValid = asciiRegex.test(value);
                ngModel.$setValidity('asciiValidator', isValid);
                return value;
            }
            ngModel.$parsers.push(validateAscii);
            ngModel.$formatters.push(validateAscii);
        }
    };
});
