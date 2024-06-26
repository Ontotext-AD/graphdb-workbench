/**
 * This AngularJS directive validates whether an input value is a valid URI (IRI).
 *
 * @directive validateUri
 * @restrict A (Attribute)
 * @requires ngModel
 *
 * @example
 * <input type="text" name="url" ng-model="url" validate-uri>
 */
const modules = [];

angular
    .module('graphdb.framework.import.directives.validate-uri', modules)
    .directive('validateUri', validateUri);

validateUri.$inject = ['UriUtils'];

/**
 * @function validateUri
 * @param {UriUtils} UriUtils - Service for URI validation.
 */
function validateUri(UriUtils) {
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function (scope, element, attr, ctrl) {
            ctrl.$parsers.unshift(function (value) {
                ctrl.$setValidity('validateUri', true);
                if (!ctrl.$isEmpty(value)) {
                    const valid = UriUtils.isValidIri(value, value.toString());
                    ctrl.$setValidity('validateUri', valid);
                }
                return value;
            });
        }
    };
}
