const modules = [];

angular
    .module('graphdb.framework.import.import-resource-status-info', modules)
    .directive('importResourceStatusInfo', importResourceStatusInfoDirective);

importResourceStatusInfoDirective.$inject = ['$rootScope'];

function importResourceStatusInfoDirective($rootScope) {
    return {
        restrict: 'E',
        templateUrl: 'js/angular/import/templates/import-resource-status-info.html',
        scope: {
            resource: '='
        },
        link: ($scope) => {
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

            // =========================
            // Subscriptions
            // =========================
            $scope.$on('closePopovers', $scope.close);

            const removeAllSubscribers = () => {
                $scope.$off('closePopovers', $scope.close);
            };

            $scope.$on('$destroy', removeAllSubscribers);
        }
    };
}
