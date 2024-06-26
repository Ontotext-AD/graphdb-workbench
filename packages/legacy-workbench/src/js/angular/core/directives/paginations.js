// Due to a problem in the uib-pagination library, the template needs to be recompiled, in order to set the first and last text in a new language
angular.module('graphdb.framework.core.directives.paginations', [])
    .directive('paginations', ["$translate", "$rootScope", "$compile", function ($translate, $rootScope, $compile) {
        return {
            link: function ($scope, element) {
                const template = '<uib-pagination class="nav navbar-right" ' +
                'total-items="matchedElements.length" ' +
                'items-per-page="pageSize" ' +
                'ng-model="page" ' +
                'ng-change="changePagination()" ' +
                'direction-links="false" ' +
                'boundary-links="true" ' +
                'max-size="5" ' +
                'rotate="true" ' +
                'first-text="{{\'paginator.first.page.label\' | translate}}" ' +
                'last-text="{{\'paginator.last.page.label\' | translate}}"></uib-pagination>';

                const recompileDirective = () => {
                    const compiledTemplate = $compile(template)($scope);
                    element.html(compiledTemplate);
                };

               recompileDirective();
               const languageChangedSubscription = $rootScope.$on('$translateChangeSuccess', recompileDirective);
               $scope.$on('$destroy', languageChangedSubscription);
            }
        };
    }]);
