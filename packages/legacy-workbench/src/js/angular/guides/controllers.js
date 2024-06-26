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

GuidesCtrl.$inject = ['$scope', '$rootScope', 'GuidesService', '$filter', '$translate', '$interpolate'];

function GuidesCtrl($scope, $rootScope, GuidesService, $filter, $translate, $interpolate) {

    $scope.guides = [];
    $scope.pageSizeOptions = [10, 20, 50, 100];
    $scope.page = 1;
    $scope.pageSize = $scope.pageSizeOptions[0];
    $scope.translationSubscription = undefined;

    $scope.init = function () {
        GuidesService.getGuides()
            .then(guides => {
                $scope.guides = $filter('orderBy')(guides, 'guideOrder');
                $scope.guides.forEach(guide => {
                    guide.translatedGuideName = GuideUtils.translateLocalMessage($translate, $interpolate, guide.guideName);
                    guide.translatedGuideDescription = GuideUtils.translateLocalMessage($translate, $interpolate, guide.guideDescription);
                    switch (guide.guideLevel) {
                        case undefined:
                        case 0:
                            guide.guideLevelLabel = 'view.guides.level.beginner';
                            break;
                        case 1:
                            guide.guideLevelLabel = 'view.guides.level.intermediate';
                            break;
                        default: // 2 and above
                            guide.guideLevelLabel = 'view.guides.level.advanced';
                    }
                });
                $scope.matchedElements = $scope.guides;
                $scope.changePagination();
            });
    };

    $scope.startGuide = function (guide) {
        GuidesService.startGuide(guide);
    };

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
