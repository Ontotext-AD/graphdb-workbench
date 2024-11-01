import 'angular/core/services/workbench-context.service';

angular
    .module('graphdb.framework.core.directives.rdfresourcesearch.rdfresourcesearch', ['graphdb.core.services.workbench-context'])
    .directive('rdfResourceSearch', rdfResourceSearchDirective);

rdfResourceSearchDirective.$inject = ['$rootScope', 'AutocompleteRestService', 'RDF4JRepositoriesRestService', '$repositories', '$licenseService', 'WorkbenchContextService'];

function rdfResourceSearchDirective($rootScope, AutocompleteRestService, RDF4JRepositoriesRestService, $repositories, $licenseService, WorkbenchContextService) {
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

            // TODO maybe we can remove it
            const onSelectedRepositoryNamespacesUpdated = (repositoryNamespaces) => {
                $scope.getNamespacesPromise = repositoryNamespaces;
                $scope.namespaces = repositoryNamespaces;
            };

            // TODO maybe we can remove it
            const onAutocompleteEnabledUpdated = (autocompleteEnabled) => {
                $scope.getAutocompletePromise = autocompleteEnabled;
            };

            // =========================
            // Subscriptions
            // =========================
            const subscriptions = [];

            subscriptions.push(WorkbenchContextService.onAutocompleteEnabledUpdated(onAutocompleteEnabledUpdated));
            subscriptions.push(WorkbenchContextService.onSelectedRepositoryNamespacesUpdated(onSelectedRepositoryNamespacesUpdated));

            const removeAllSubscribers = () => {
                window.addEventListener('mousedown', onWindowClick);
                subscriptions.forEach((subscription) => subscription());
            };

            // Deregister the watcher when the scope/directive is destroyed
            $scope.$on('$destroy', removeAllSubscribers);
        }
    };
}
