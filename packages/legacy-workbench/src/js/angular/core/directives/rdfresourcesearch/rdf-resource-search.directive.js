import 'angular/core/services/workbench-context.service';
import {NamespacesListModel} from "../../../models/namespaces/namespaces-list";

const modules = ['graphdb.core.services.workbench-context', 'graphdb.framework.core.services.rdf4j.repositories'];
angular
    .module('graphdb.framework.core.directives.rdfresourcesearch.rdfresourcesearch', modules)
    .directive('rdfResourceSearch', rdfResourceSearchDirective);

rdfResourceSearchDirective.$inject = [
    '$rootScope',
    'AutocompleteRestService',
    'RDF4JRepositoriesRestService',
    '$repositories',
    '$licenseService',
    '$translate',
    '$jwtAuth',
    'toastr',
    'WorkbenchContextService',
    'RDF4JRepositoriesService'];

function rdfResourceSearchDirective(
    $rootScope,
    AutocompleteRestService,
    RDF4JRepositoriesRestService,
    $repositories,
    $licenseService,
    $translate,
    $jwtAuth,
    toastr,
    WorkbenchContextService,
    RDF4JRepositoriesService) {
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
                loadNamespaces()
                    .then((repositoryNamespaces) => {
                        $scope.repositoryNamespaces = repositoryNamespaces;
                        $scope.showRdfSearchInput = true;
                        element.find('.view-res-input').focus();
                        window.addEventListener('mousedown', onWindowClick);
                        $scope.onOpen();
                        $rootScope.$broadcast('rdfResourceSearchExpanded');
                    })
                    .catch((error) => {
                        const msg = getError(error);
                        toastr.error(msg, $translate.instant('error.getting.namespaces.for.repo'));
                    });
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

            const loadNamespaces = () => {
                const activeRepository = $repositories.getActiveRepository();
                if (!activeRepository || !$jwtAuth.canReadRepo(activeRepository)) {
                    return Promise.resolve(new NamespacesListModel());
                }
                return RDF4JRepositoriesService.getNamespaces(activeRepository);
            };

            const onAutocompleteEnabledUpdated = (autocompleteEnabled) => {
                $scope.isAutocompleteEnabled = autocompleteEnabled;
            };

            // =========================
            // Subscriptions
            // =========================
            const subscriptions = [];

            subscriptions.push(WorkbenchContextService.onAutocompleteEnabledUpdated(onAutocompleteEnabledUpdated));

            const removeAllSubscribers = () => {
                window.addEventListener('mousedown', onWindowClick);
                subscriptions.forEach((subscription) => subscription());
            };

            // Deregister the watcher when the scope/directive is destroyed
            $scope.$on('$destroy', removeAllSubscribers);
        }
    };
}
