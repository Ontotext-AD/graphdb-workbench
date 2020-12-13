angular
    .module('graphdb.framework.core.directives.languageselector.languageselector', [])
    .directive('languageSelector', languageSelector);

languageSelector.$inject = ['$translate'];

function languageSelector($translate) {
    return {
        templateUrl: 'js/angular/core/directives/languageselector/templates/languageSelector.html',
        restrict: 'E',
        link: function ($scope) {
            $scope.changeLanguage = function (langKey) {
                $translate.use(langKey);
            };
        }
    };
}
