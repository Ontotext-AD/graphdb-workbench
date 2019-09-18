import 'angular/core/services';

const importDirectives = angular.module('graphdb.framework.impex.import.directives', []);

importDirectives.directive('validateUri', ['UtilService', function (UtilService) {
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function (scope, element, attr, ctrl) {
            ctrl.$parsers.unshift(function (value) {
                var valid = true;

                if (scope.target === 'named') {
                    valid = UtilService.isValidIri(value);
                }

                ctrl.$setValidity('validateUri', valid);

                return value;
            });
        }
    }
}]);// defined in workbench-core.js

importDirectives.directive('filesTable', function () {
    return {
        restrict: 'A',
        templateUrl: 'js/angular/import/templates/filesTable.html',
    }
});

importDirectives.directive('filesOntoLoader', function () {
    return {
        link: function (scope, element, attr) {
            scope.$watch('file.status', function () {
                if (scope.file.status == 'IMPORTING' || scope.file.status == 'UPLOADING') {
                    if (!$(element).has("object").length > 0) {
                        $(element).append('<object width="' + attr.size + '" height="' + attr.size + '" data="js/angular/templates/loader/ot-loader.svg">Loading...</object>');
                    }
                }
            });
        }
    };
});
