import 'angular/guides/guides.service';
import 'angular/core/directives/paginations';
import {GuideUtils} from "./guide-utils";

const modules = [
    'ui.bootstrap',
    'graphdb.framework.guides.services',
    'graphdb.framework.core.directives.paginations'
];

angular
    .module('graphdb.framework.guides.controllers', modules)
    .controller('GuidesCtrl', GuidesCtrl);

GuidesCtrl.$inject = ['$scope', '$rootScope', 'GuidesService', '$filter', '$translate'];

function GuidesCtrl($scope, $rootScope, GuidesService, $filter, $translate) {

    $scope.guides = [];
    $scope.pageSizeOptions = [10, 20, 50, 100];
    $scope.page = 1;
    $scope.pageSize = $scope.pageSizeOptions[0];
    $scope.translationSubscription = undefined;

    $scope.init = function () {
        GuidesService.getGuides()
            .then(guides => {
                $scope.guides = $filter('orderBy')(guides, 'order');
                $scope.guides.forEach(guide => guide.name = GuideUtils.translateLocalMessage($translate, guide.title));
                $scope.matchedElements = $scope.guides;
                $scope.changePagination();
            });
    }

    $scope.startGuide = function (guideFileName) {
        GuidesService.startGuide(guideFileName);
    }

    if (!this.translationSubscription) {
        this.translationSubscription = $rootScope.$on('$translateChangeSuccess', () => {
            $scope.init();
        });
    }

    $scope.changePagination = function () {
        if (angular.isDefined($scope.guides)) {
            $scope.displayedGuides = $scope.guides.slice($scope.pageSize * ($scope.page - 1), $scope.pageSize * $scope.page);
        }
    };

    $scope.changePageSize = function (size) {
        $scope.page = 1;
        if (size) {
            $scope.pageSize = size;
        } else {
            $scope.pageSize = $scope.pageSizeOptions[0];
        }
        $scope.changePagination();
    };

    $scope.init();
}
