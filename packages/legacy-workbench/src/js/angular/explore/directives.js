import 'angular/utils/uri-utils';

const exploreDirectives = angular.module('graphdb.framework.explore.directives', [
    'graphdb.framework.utils.uriutils'
]);

exploreDirectives.directive('uri', ['UriUtils', function (UriUtils) {
    return {
        require: 'ngModel',
        link: function (scope, elem, attr, ngModel) {

            //For DOM -> model validation
            ngModel.$parsers.unshift(function (value) {
                if (!angular.isUndefined(value) && value.length > 0) {
                    const isValidUri = UriUtils.validateRdfUri(value);
                    ngModel.$setValidity('searchStr', isValidUri);
                    return isValidUri ? value : undefined;
                } else {
                    ngModel.$setValidity('searchStr', true);
                    return value;
                }
            });

            //For model -> DOM validation
            ngModel.$formatters.unshift(function (value) {
                if (!angular.isUndefined(value)) {
                    ngModel.$setValidity('searchStr', UriUtils.validateRdfUri);
                }
                return value;
            });
        }
    };
}]);
