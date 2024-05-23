import * as angular from 'angular';

const modules = [];

angular
    .module('graphdb.framework.import.directives.validate-uri', modules)
    .directive('validateUri', validateUri);

validateUri.$inject = ['UriUtils'];

function validateUri(UriUtils) {
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function (scope, element, attr, ctrl) {
            ctrl.$parsers.unshift(function (value) {
                const valid = UriUtils.isValidIri(value, value.toString());
                ctrl.$setValidity('validateUri', valid);
                return value;
            });
        }
    };
}
