import {decodeHTML} from "../../../../../app";

angular
    .module('graphdb.framework.core.directives.rdfresourcesearch.rdfresourcesearch', [])
    .directive('rdfResourceSearch', rdfResourceSearchDirective);

rdfResourceSearchDirective.$inject = ['$rootScope', '$timeout',
    'AutocompleteRestService', 'RDF4JRepositoriesRestService',
    'RepositoriesRestService', '$repositories', '$location', '$licenseService', 'toastr', '$translate'];

function rdfResourceSearchDirective($rootScope, $timeout,
                                    AutocompleteRestService, RDF4JRepositoriesRestService,
                                    RepositoriesRestService, $repositories, $location, $licenseService, toastr, $translate) {
    return {
        templateUrl: 'js/angular/core/directives/rdfresourcesearch/templates/rdfResourceSearchTemplate.html',
        restrict: 'AE',
        link: function ($scope, element) {


            // =========================
            // Private variables
            // =========================

            const hiddenXSUpClass = 'hidden-xs-up';

            // =========================
            // Public functions
            // =========================

            $scope.showInput = () => {
                createSearchInput()
                    .then(() => $rootScope.$broadcast('rdfResourceSearchExpanded'));
            };

            $scope.onKeyDown = function (event) {
                if (event.key === 'Escape') {
                    $scope.hideInput();
                }
            };

            $scope.hideInput = () => {
                element.find('.search-rdf-input').removeClass('show-rdf-search-box');
                element.find('.close-rdf-search-btn').addClass(hiddenXSUpClass);
                $timeout(function () {
                    element.find('.search-rdf-btn').removeClass(hiddenXSUpClass);
                    element.blur();
                    window.removeEventListener('mousedown', onWindowClick);
                }, 200);
            };

            // TODO: remove this from here, it controls the visibility of component and have to be in main template
            $scope.isNotLoading = function () {
                return !$scope.isLoadingLocation() || $scope.isLoadingLocation() && $location.url() === '/repository';
            };

            // TODO: remove this from here, it controls the visibility of component and have to be in main template
            $scope.getActiveRepository = () => {
                return $repositories.getActiveRepository();
            };

            // TODO: remove this from here, When tha page is home page and button is clicked then it is hided
            $scope.isHomePage = function () {
                return $location.url() === '/';
            };

            // =========================
            // Private functions
            // =========================

            const refreshRepositoryInfo = () => {
                if ($scope.getActiveRepository()) {
                    $scope.getNamespacesPromise = RDF4JRepositoriesRestService.getNamespaces(
                        $scope.getActiveRepository())
                        .success(function () {
                            checkAutocompleteStatus();
                        });
                }
            };

            const checkAutocompleteStatus = () => {
                if ($licenseService.isLicenseValid()) {
                    $scope.getAutocompletePromise = AutocompleteRestService.checkAutocompleteStatus();
                }
            };

            const onWindowClick = (event) => {
                if (!(event.target.id === "search-box" || $(event.target).closest("#search-box").length)) {
                    $scope.hideInput();
                }
            };

            const createSearchInput = () => {
                return new Promise((resolve) => {
                    element.find('.search-rdf-btn')
                        .addClass(hiddenXSUpClass);
                    element.find('.search-rdf-input').addClass('show-rdf-search-box');
                    $timeout(function () {
                        element.find('.close-rdf-search-btn').removeClass(hiddenXSUpClass);
                        element.find('search-resource-input .view-res-input').focus();
                        window.addEventListener('mousedown', onWindowClick);
                    }, 200);
                    if (!$scope.isHomePage()) {
                        element.find('.search-rdf-btn')
                            .addClass('hidden-xs-up');
                        element.find('.search-rdf-input').addClass('show-rdf-search-box');
                        $timeout(function () {
                            element.find('.close-rdf-search-btn').removeClass('hidden-xs-up');
                            element.find('search-resource-input .view-res-input').focus();
                            window.addEventListener('mousedown', onWindowClick);
                        }, 200);
                    } else {
                        $('#search-resource-input-home input').focus();
                        toastr.info(decodeHTML($translate.instant('search.resource.current.page.msg')), $translate.instant('search.resources.msg'), {
                            allowHtml: true
                        });
                    }
                    setTimeout(() => {
                        resolve(true);
                    });
                });
            };

            // =========================
            // Subscriptions
            // =========================
            const subscriptions = [];

            const removeAllSubscribers = () => {
                subscriptions.forEach((subscription) => subscription());
            };

            subscriptions.push($scope.$on('autocompleteStatus', checkAutocompleteStatus));

            // Rather then rely on securityInit we monitory repositoryIsSet which is guaranteed to be called
            // after security was initialized. This way we avoid a race condition when the newly logged in
            // user doesn't have read access to the active repository.
            subscriptions.push($scope.$on('repositoryIsSet', refreshRepositoryInfo));

            // Deregister the watcher when the scope/directive is destroyed
            $scope.$on('$destroy', removeAllSubscribers);
        }
    };
}
