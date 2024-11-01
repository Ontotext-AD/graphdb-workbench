angular
    .module('graphdb.framework.core.directives.rdfresourcesearch.rdfresourcesearch', [])
    .directive('rdfResourceSearch', rdfResourceSearchDirective);

rdfResourceSearchDirective.$inject = ['$rootScope'];

function rdfResourceSearchDirective($rootScope) {
    return {
        templateUrl: 'js/angular/core/directives/rdfresourcesearch/templates/rdfResourceSearchTemplate.html',
        restrict: 'AE',
        scope: {
            onOpen: '&'
        },
        link: function ($scope, element) {
            // =========================
            // Public variables
            // =========================
            $scope.showRdfSearchInput = false;

            // =========================
            // Public functions
            // =========================

            $scope.showInput = () => {
                $scope.showRdfSearchInput = true;
                element.find('.view-res-input').focus();
                window.addEventListener('mousedown', onWindowClick);
                $scope.onOpen();
                $rootScope.$broadcast('rdfResourceSearchExpanded');
            };

            $scope.onKeyDown = (event) => {
                if (event.key === 'Escape') {
                    $scope.hideInput();
                }
            };

            $scope.hideInput = () => {
                window.removeEventListener('mousedown', onWindowClick);
                $scope.showRdfSearchInput = false;
            };

            // =========================
            // Private functions
            // =========================

            const onWindowClick = (event) => {
                if (!(event.target.id === "search-box" || $(event.target).closest("#search-box").length)) {
                    $scope.$apply(() => $scope.hideInput());
                }
            };

            // =========================
            // Subscriptions
            // =========================
            const removeAllSubscribers = () => {
                window.addEventListener('mousedown', onWindowClick);
            };

            // Deregister the watcher when the scope/directive is destroyed
            $scope.$on('$destroy', removeAllSubscribers);
        }
    };
}
