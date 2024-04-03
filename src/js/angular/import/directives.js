import 'angular/core/services';
import 'angular/utils/uri-utils';

const importDirectives = angular.module('graphdb.framework.impex.import.directives', [
    'graphdb.framework.utils.uriutils'
]);

importDirectives.directive('validateUri', ['UriUtils', function (UriUtils) {
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
}]);

importDirectives.directive('filesTable', function () {
    return {
        restrict: 'A',
        templateUrl: 'js/angular/import/templates/filesTable.html'
    };
});

importDirectives.directive('filesOntoLoader', function () {
    return {
        link: function (scope, element, attr) {
            scope.$watch('file.status', function () {
                if (scope.file.status === 'IMPORTING' || scope.file.status === 'UPLOADING') {
                    if (!$(element).has('object').length > 0) {
                        $(element).append('<object width="' + attr.size + '" height="' + attr.size + '" data="js/angular/templates/loader/ot-loader.svg?v=[AIV]{version}[/AIV]">{{\'common.loading\' | translate}}</object>');
                    }
                }
            });
        }
    };
});
