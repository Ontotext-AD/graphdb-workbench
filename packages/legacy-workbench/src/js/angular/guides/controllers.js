import 'angular/guides/guides.service';
import 'angular/core/directives/paginations';
import {GuideUtils} from "./guide-utils";
import {GuideLevel} from "./model/guides";

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

    // =========================
    // Public variables
    // =========================
    $scope.guides = [];
    $scope.pageSizeOptions = [10, 20, 50, 100];
    $scope.page = 1;
    $scope.pageSize = $scope.pageSizeOptions[0];
    $scope.translationSubscription = undefined;

    // =========================
    // Public functions
    // =========================

    $scope.startGuide = (guide) => {
        GuidesService.startGuide(guide);
    };

    $scope.changePagination = () => {
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

    // =========================
    // Private functions
    // =========================

    const init = () => {
        loadGuides()
            .then(translateNameAndDescriptions);
    };

    const loadGuides = () => {
        return GuidesService.getGuides()
            .then((guides) => {
                $scope.guides = $filter('orderBy')(guides, 'guideOrder');
                updateGuide();
                $scope.matchedElements = $scope.guides;
                $scope.changePagination();
            });
    };

    const updateGuide = () => {
        $scope.guides.forEach((guide) => {
            switch (guide.guideLevel) {
                case undefined:
                case GuideLevel.BEGINNER:
                    guide.guideLevelLabel = 'view.guides.level.beginner';
                    break;
                case GuideLevel.INTERMEDIATE:
                    guide.guideLevelLabel = 'view.guides.level.intermediate';
                    break;
                default: // GuideLevel.ADVANCED and above
                    guide.guideLevelLabel = 'view.guides.level.advanced';
            }
        });
    };

    const translateNameAndDescriptions = () => {
        $scope.guides.forEach((guide) => {
            guide.translatedGuideName = GuideUtils.translateLocalMessage($translate, $interpolate, guide.guideName);
            guide.translatedGuideDescription = GuideUtils.translateLocalMessage($translate, $interpolate, guide.guideDescription);
        });
    };

    // =========================
    // Subscriptions
    // =========================
    const subscriptions = [];

    const removeAllSubscribers = () => {
        subscriptions.forEach((subscription) => subscription());
    };

    subscriptions.push($rootScope.$on('$translateChangeSuccess', translateNameAndDescriptions));
    subscriptions.push($scope.$on('$destroy', removeAllSubscribers));

    init();
}
