import 'angular/core/services';
import 'angular/core/directives';
import 'angular/utils/uri-utils';
import 'angular/rest/rdfrank.rest.service';
import 'ng-tags-input/build/ng-tags-input.min';
import {mapNamespacesResponse} from "../rest/mappers/namespaces-mapper";
import {decodeHTML} from "../../../app";

const rdfRankApp = angular.module('graphdb.framework.rdfrank', [
    'ngRoute',
    'ngTagsInput',
    'graphdb.framework.utils.uriutils',
    'graphdb.framework.rest.rdfrank.service'
]);

rdfRankApp.controller('RDFRankCtrl', ['$scope', '$rootScope', '$interval', 'toastr', '$repositories', '$licenseService', '$timeout', 'ClassInstanceDetailsService', 'UriUtils', 'RDF4JRepositoriesRestService', 'RdfRankRestService', '$translate',
    function ($scope, $rootScope, $interval, toastr, $repositories, $licenseService, $timeout, ClassInstanceDetailsService, UriUtils, RDF4JRepositoriesRestService, RdfRankRestService, $translate) {

        let timer;

        function cancelTimer() {
            if (timer) {
                $interval.cancel(timer);
            }
        }

        $scope.pluginName = 'rdfrank';

        $scope.setPluginIsActive = function (isPluginActive) {
            $scope.pluginIsActive = isPluginActive;
        };

        const refreshStatus = function () {
            RdfRankRestService.getStatus()
                .success(function (data) {
                    $scope.currentRankStatus = data;
                }).error(function (data) {
                    toastr.error(getError(data));
                });
        };

        const loadNamespaces = () => {
            RDF4JRepositoriesRestService.getNamespaces($repositories.getActiveRepository())
                .then(mapNamespacesResponse)
                .then((namespacesModel) => {
                    $scope.namespaces = namespacesModel;
                })
                .catch((response) => {
                    const msg = getError(response);
                    toastr.error(msg, $translate.instant('error.getting.namespaces.for.repo'));
                });
        };

        const refreshPage = function () {
            refreshStatus();
            refreshFilteringStatus();
            refreshFilteringConfig();
        };

        const updateFilterList = function () {
            return {
                INCLUDED_PREDICATES: {name: 'Included Predicates', predicate: 'includedPredicates', placeholderKey: 'rdfrank.include.predicates', fieldNameKey: 'rdfrank.include.label'},
                INCLUDED_GRAPHS: {name: 'Included Graphs', predicate: 'includedGraphs', placeholderKey: 'rdfrank.include.graphs', fieldNameKey: 'rdfrank.include.label'},
                EXCLUDED_PREDICATES: {name: 'Excluded Predicates', predicate: 'excludedPredicates', placeholderKey: 'rdfrank.exclude.predicates', fieldNameKey: 'rdfrank.exclude.label'},
                EXCLUDED_GRAPHS: {name: 'Excluded Graphs', predicate: 'excludedGraphs', placeholderKey: 'rdfrank.exclude.graphs', fieldNameKey: 'rdfrank.exclude.label'}
            };
        };

        $scope.checkForPlugin = function () {
            $scope.pluginFound = false;

            $scope.setLoader(true);
            RdfRankRestService.checkRdfRankPluginEnabled()
                .success(function (data) {
                    $scope.pluginFound = (data === true);
                    if ($scope.pluginFound) {
                        loadNamespaces();
                        refreshPage();
                    } else {
                        $scope.loading = false;
                    }
                })
                .error(function (data) {
                    toastr.error(getError(data));
                }).finally(function () {
                $scope.setLoader(false);
            });
        };

        const refreshFilteringStatus = function () {
            RdfRankRestService.checkFilteringEnabled()
                .success(function (data) {
                    $scope.filteringEnabled = data;
                }).error(function (data) {
                    toastr.error(getError(data));
                });
        };

        const refreshFilteringConfig = function () {
            Object.values($scope.filterLists).forEach(function (list) {
                RdfRankRestService.filter(list.predicate)
                    .success(function (data) {
                        return list.elements = data;
                    }).error(function (data) {
                        toastr.error(getError(data));
                    });
            });
            RdfRankRestService.includeExplicit()
                .success(function (data) {
                    $scope.includeExplicit = data;
                }).error(function (data) {
                    toastr.error(getError(data));
                });
            RdfRankRestService.includeImplicit()
                .success(function (data) {
                    $scope.includeImplicit = data;
                }).error(function (data) {
                    toastr.error(getError(data));
                });
        };

        $scope.rdfStatus = {
            CANCELED: 'CANCELED',
            COMPUTED: 'COMPUTED',
            COMPUTING: 'COMPUTING',
            EMPTY: 'EMPTY',
            ERROR: 'ERROR',
            OUTDATED: 'OUTDATED',
            CONFIG_CHANGED: 'CONFIG_CHANGED'
        };

        $scope.filterLists = updateFilterList();

        $scope.setLoader = function (loader, message) {
            $timeout.cancel($scope.loaderTimeout);
            if (loader) {
                $scope.loaderTimeout = $timeout(function () {
                    $scope.loader = loader;
                    $scope.loaderMessage = message;
                }, 300);
            } else {
                $scope.loader = false;
            }
        };

        $scope.getLoaderMessage = function () {
            return $scope.loaderMessage || $translate.instant('common.loading');
        };

        $scope.computeRank = function () {
            $scope.setLoader(true, $translate.instant('rdfrank.full.computation'));

            RdfRankRestService.compute().success(function () {
                $scope.currentRankStatus = $scope.rdfStatus.COMPUTING;
            }).error(function (data) {
                toastr.error(getError(data));
            }).finally(function () {
                $scope.setLoader(false);
            });
        };

        $scope.computeIncrementalRank = function () {
            $scope.setLoader(true, $translate.instant('rdfrank.incremental.computation'));

            RdfRankRestService.computeIncremental().success(function () {
                $scope.currentRankStatus = $scope.rdfStatus.COMPUTING;
            }).error(function (data) {
                toastr.error(getError(data));
            }).finally(function () {
                $scope.setLoader(false);
            });
        };

        $scope.interruptComputation = function () {
            $scope.setLoader(true, $translate.instant('index.interrupt'));

            RdfRankRestService.interrupt().success(function () {
                refreshStatus();
            }).error(function (data) {
                toastr.error(getError(data));
            }).finally(function () {
                $scope.setLoader(false);
            });
        };

        $scope.getDegradedReason = function () {
            return $repositories.getDegradedReason();
        };

        $scope.$on('repositoryIsSet', function () {
            cancelTimer();
            if (!$licenseService.isLicenseValid() ||
                !$repositories.getActiveRepository() ||
                    $repositories.isActiveRepoOntopType() ||
                        $repositories.isActiveRepoFedXType()) {
                return;
            }
            $scope.checkForPlugin();
            pullStatus();
        });

        $scope.toggleFiltering = function () {
            RdfRankRestService.toggleFiltering(!$scope.filteringEnabled).success(function () {
                refreshStatus();
                refreshFilteringStatus();
                refreshFilteringConfig();
            }).error(function (data) {
                toastr.error(getError(data));
            }).finally(function () {
                $scope.setLoader(false);
            });
        };

        $scope.toggleIncludeExplicit = function () {
            RdfRankRestService.toggleIncludeExplicit(!$scope.includeExplicit).success(function () {
                refreshStatus();
                refreshFilteringConfig();
            }).error(function (data) {
                toastr.error(getError(data));
            }).finally(function () {
                $scope.setLoader(false);
            });
        };

        $scope.toggleIncludeImplicit = function () {
            RdfRankRestService.toggleIncludeImplicit(!$scope.includeImplicit).success(function () {
                refreshStatus();
                refreshFilteringConfig();
            }).error(function (data) {
                toastr.error(getError(data));
            }).finally(function () {
                $scope.setLoader(false);
            });
        };

        const _addToList = function (list, iri) {
            const data = {
                iri: iri
            };
            RdfRankRestService.updateFilter(list.predicate, data)
                .success(function () {
                    refreshStatus();
                    refreshFilteringConfig();
                }).error(function (data) {
                    toastr.error(getError(data));
                    refreshFilteringConfig();
                });
        };

        $scope.addToList = function (list, iri) {
            let iriText = iri.text.toString();
            iriText = UriUtils.expandPrefix(iriText, $scope.namespaces);
            if (UriUtils.isValidIri(iri, iriText) && iriText !== "") {
                _addToList(list, iriText);
            } else {
                refreshFilteringConfig();
                const errorMessage = decodeHTML($translate.instant('not.valid.iri', {value: iri.text.toString()}));
                toastr.error(errorMessage);
            }
        };

        const _deleteFromList = function (list, iri) {
            const data = {
                iri: iri
            };
            RdfRankRestService.deleteFilter(list.predicate, data)
                .success(function () {
                    refreshStatus();
                    refreshFilteringConfig();
                }).error(function (data) {
                    toastr.error(getError(data));
                });
        };

        $scope.deleteFromList = function (list, iri) {
            _deleteFromList(list, iri.text, $scope.namespaces);
        };

        const pullStatus = function () {
            timer = $interval(function () {
                $scope.$broadcast('checkIsActive');
                if ($scope.pluginFound) {
                    refreshStatus();
                }
            }, 5000);
        };

        const languageChangedSubscription = $rootScope.$on('$translateChangeSuccess', () => {
            $scope.filterLists = updateFilterList();
        });

        $scope.$on('$destroy', function () {
            languageChangedSubscription();
            cancelTimer();
        });

        const init = function () {
            if (!$licenseService.isLicenseValid() ||
                !$repositories.getActiveRepository() ||
                    $repositories.isActiveRepoOntopType() ||
                        $repositories.isActiveRepoFedXType()) {
                return;
            }
            $scope.checkForPlugin();
            pullStatus();
            updateFilterList();
        };

        init();
    }]);
