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
 * The directive can also be configured to exclude certain substrings or protocols from valid URLs,
 * and to control whether empty input values are considered valid.
 *
 * @example
 * <pre>
 *   <form name="myForm">
 *     <!-- Basic URL validation -->
 *     <input type="text" name="urlField" ng-model="url" validate-url/>
 *     <div ng-show="myForm.urlField.$error.validUrl">
 *       Invalid URL format.
 *     </div>
 *
 *     <!-- URL validation excluding a specific substring -->
 *     <input type="text" name="urlFieldWithExclusion" ng-model="url" validate-url exclude="/repositories"/>
 *     <div ng-show="myForm.urlFieldWithExclusion.$error.validUrl">
 *       Invalid URL format or contains excluded substring.
 *     </div>
 *
 *     <!-- URL validation excluding a specific protocol -->
 *     <input type="text" name="urlFieldWithProtocolExclusion" ng-model="url" validate-url exclude-protocol="ftp"/>
 *     <div ng-show="myForm.urlFieldWithProtocolExclusion.$error.validUrl">
 *       Invalid URL format or uses an excluded protocol.
 *     </div>
 *
 *     <!-- URL validation that does not allow empty values -->
 *     <input type="text" name="urlFieldNoEmpty" ng-model="url" validate-url allow-empty="false"/>
 *     <div ng-show="myForm.urlFieldNoEmpty.$error.validUrl">
 *       Invalid URL format or empty value not allowed.
 *     </div>
 *
 *     <!-- URL validation with both substring and protocol exclusions, and empty values not allowed -->
 *     <input type="text" name="urlFieldFullValidation" ng-model="url" validate-url exclude="/repositories" exclude-protocol="ftp" allow-empty="false"/>
 *     <div ng-show="myForm.urlFieldFullValidation.$error.validUrl">
 *       Invalid URL format, contains excluded substring, uses an excluded protocol, or empty value not allowed.
 *     </div>
 *   </form>
 * </pre>
 *
 * @usage
 * This directive can be added as an attribute to any input field where URL validation is required.
 * It will automatically validate the input value.
 *
 * Optional attributes:
 * - `exclude`: A string specifying a substring that must not be present in the URL.
 * - `exclude-protocol`: A comma-separated list of protocols (e.g., `ftp,http`) that must not be used in the URL.
 * - `allow-empty`: A boolean attribute (`true` by default). If set to `false`, empty values are considered invalid.
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
                // Check if empty values should be allowed
                if (ctrl.$isEmpty(viewValue)) {
                    return attr.allowEmpty !== 'false';
                }

                if (!UrlUtils.isValidUrl(viewValue)) {
                    return false;
                }

                if (attr.exclude && !UrlUtils.doesNotContain(viewValue, attr.exclude)) {
                    return false;
                }

                if (attr.excludeProtocol) {
                    const excludedProtocols = attr.excludeProtocol.split(',');
                    if (!UrlUtils.doesNotUseProtocol(viewValue, excludedProtocols)) {
                        return false;
                    }
                }
                return true;
            };
        }
    };
}
