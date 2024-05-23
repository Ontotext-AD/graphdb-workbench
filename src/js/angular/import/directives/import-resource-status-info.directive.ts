import * as angular from 'angular';

const modules = [];

angular
    .module('graphdb.framework.import.directives.import-resource-status-info', modules)
    .directive('importResourceStatusInfo', importResourceStatusInfoDirective);

importResourceStatusInfoDirective.$inject = ['$rootScope', '$document'];

function importResourceStatusInfoDirective($rootScope, $document) {
    return {
        restrict: 'E',
        templateUrl: 'js/angular/import/templates/import-resource-status-info.html',
        scope: {
            resource: '='
        },
        link: ($scope) => {
            const subscribers = [];

            // =========================
            // Public variables
            // =========================
            $scope.popoverTemplate = 'resourceStatusInfoTemplate.html';
            $scope.popoverIsOpen = false;
            $scope.context = $scope.resource.importResource.context;
            $scope.replaceGraphs = $scope.resource.importResource.replaceGraphs;
            $scope.baseUrl = decodeURIComponent($scope.resource.importResource.baseURI);
            $scope.forceSerial = $scope.resource.importResource.forceSerial;
            $scope.importedOn = $scope.resource.importResource.importedOn;
            $scope.parserSettings = $scope.resource.importResource.parserSettings;
            $scope.hasReplacedGraphs = $scope.resource.importResource.numReplacedGraphs > 0;
            $scope.hasAddedStatements = $scope.resource.importResource.addedStatements > 0;
            $scope.hasRemovedStatements = $scope.resource.importResource.removedStatements > 0;

            // =========================
            // Public functions
            // =========================
            $scope.open = () => {
                $scope.closeAllDialogs();
                $scope.popoverIsOpen = true;
            };

            $scope.closeAllDialogs = () => {
                $rootScope.$broadcast('closePopovers');
            };

            $scope.close = () => {
                $scope.popoverIsOpen = false;
            };

            const handleEscapeKeyPress = (event) => {
                if (event.key === 'Escape') {
                    $scope.$apply(() => {
                        $scope.close();
                    });
                }
            };

            const removeAllSubscribers = () => {
                subscribers.forEach((subscriber) => subscriber());
            };

            // =========================
            // Subscriptions
            // =========================

            subscribers.push($scope.$on('closePopovers', $scope.close));
            $document.on('keydown', handleEscapeKeyPress);

            $scope.$on('$destroy', () => {
                $document.off('keydown', handleEscapeKeyPress);
                removeAllSubscribers();
            });
        }
    };
}
