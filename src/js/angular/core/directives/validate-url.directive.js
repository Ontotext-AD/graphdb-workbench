/**
 * @ngdoc directive
 * @name validateUrl
 * @module graphdb.framework.core.directives.validate-url
 * @restrict A
 *
 * @description
 * This directive validates the URL input field based on a specified pattern.
 * It ensures that the input URL adheres to standard URL formats and provides
 * visual feedback to the user if the URL is invalid.
 *
 * @example
 * <pre>
 *   <form name="myForm">
 *     <input type="text" name="urlField" ng-model="url" url-validator/>
 *     <div ng-show="myForm.urlField.$error.validUrl">
 *       Invalid URL format.
 *     </div>
 *   </form>
 * </pre>
 *
 * @usage
 * This directive can be added as an attribute to any input field where URL validation is required.
 * It will automatically validate the input value.
 */

import {UrlUtils} from "../../utils/url-utils";

const modules = [];

angular
    .module('graphdb.framework.core.directives.validate-url', modules)
    .directive('validateUrl', validateUrl);

function validateUrl() {
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function (scope, element, attr, ctrl) {
            ctrl.$validators.validUrl = function (modelValue, viewValue) {
                if (ctrl.$isEmpty(modelValue)) {
                    // consider empty models to be valid
                    return true;
                }
                return UrlUtils.isValidUrl(viewValue);
            };
        }
    };
}
