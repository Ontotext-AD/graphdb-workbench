/**
 * @ngdoc directive
 * @name validateDuplicateUrl
 * @module graphdb.framework.core.directives.validate-duplicate-url
 * @restrict A
 *
 * @description
 * This directive validates an input field for duplicate URLs. It checks whether the input URL
 * exists within a provided list of excluded or duplicate URLs and marks the input as invalid if a match is found.
 *
 * The directive requires an array of URLs to be passed using the `excluded-urls` attribute.
 * If the input URL is found within this array, a `duplicateUrl` error is added to the form control.
 *
 * This directive works in conjunction with other validators such as `validate-url` for format validation.
 *
 * @example
 * <pre>
 *   <form name="myForm">
 *     <!-- Basic URL duplicate validation -->
 *     <input type="text" name="urlField" ng-model="url" validate-duplicate-url excluded-urls="existingUrls"/>
 *     <div ng-show="myForm.urlField.$error.duplicateUrl">
 *       URL already exists.
 *     </div>
 *   </form>
 * </pre>
 *
 * @usage
 * This directive can be added as an attribute to any input field where duplicate URL validation is required.
 * It will automatically validate the input value against the provided list of excluded URLs.
 *
 * @param {Array} excludedUrls - An array of URLs to check against for duplicates.
 * @returns {boolean} Whether the URL is valid. It returns `true` if the URL is not in the `excludedUrls` array and `false` if it is.
 */
angular
    .module('graphdb.framework.core.directives.validate-duplicate-url', [])
    .directive('validateDuplicateUrl', validateDuplicateUrl);

function validateDuplicateUrl() {
    return {
        restrict: 'A',
        require: 'ngModel',
        scope: {
            excludedUrls: '='
        },
        link: function (scope, element, attr, ctrl) {
            ctrl.$validators.duplicateUrl = function (modelValue, viewValue) {
                if (scope.excludedUrls && scope.excludedUrls.includes(viewValue)) {
                    ctrl.$setValidity('duplicateUrl', false);
                    return false;
                } else {
                    ctrl.$setValidity('duplicateUrl', true);
                }
                return true;
            };
        }
    };
}
