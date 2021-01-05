import 'angular/core/services';
import 'angular/core/directives';
import 'angular/utils/uri-utils';
import 'angular/rest/rdfrank.rest.service';
import 'ng-tags-input/build/ng-tags-input.min';

const rdfRankApp = angular.module('graphdb.framework.rdfrank', [
    'ngRoute',
    'ngTagsInput',
    'graphdb.framework.utils.uriutils',
    'graphdb.framework.rest.rdfrank.service'
]);

rdfRankApp.controller('RDFRankCtrl', ['$scope', '$interval', 'toastr', '$repositories', '$timeout', 'ClassInstanceDetailsService', 'UriUtils', 'RDF4JRepositoriesRestService', 'RdfRankRestService',
    function ($scope, $interval, toastr, $repositories, $timeout, ClassInstanceDetailsService, UriUtils, RDF4JRepositoriesRestService, RdfRankRestService) {

        const refreshStatus = function () {
            RdfRankRestService.getStatus()
                .success(function (data) {
                    $scope.currentRankStatus = data;
                }).error(function (data) {
                    toastr.error(getError(data));
                });
        };

        const initNamespaces = function () {
            RDF4JRepositoriesRestService.getNamespaces($scope.getActiveRepository())
                .success(function (data) {
                    const nss = _.map(data.results.bindings, function (o) {
                        return {'uri': o.namespace.value, 'prefix': o.prefix.value};
                    });
                    $scope.namespaces = _.sortBy(nss, function (n) {
                        return n.uri.length;
                    });
                }).error(function (data) {
                    toastr.error('Cannot get namespaces for repository. View will not work properly; ' + getError(data));
                });
        };

        const refreshPage = function () {
            refreshStatus();
            refreshFilteringStatus();
            refreshFilteringConfig();
        };

        const checkForPlugin = function () {
            $scope.pluginFound = false;

            $scope.setLoader(true);
            RdfRankRestService.checkRdfRankPluginEnabled()
                .success(function (data) {
                    $scope.pluginFound = (data === true);
                    if ($scope.pluginFound) {
                        initNamespaces();
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
                        list.elements = data;

                        list.elements = list.elements.map(function (elem) {
                            return foldPrefix(elem, $scope.namespaces);
                        });
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

        $scope.filterLists = {
            INCLUDED_PREDICATES: {name: 'Included Predicates', predicate: 'includedPredicates'},
            INCLUDED_GRAPHS: {name: 'Included Graphs', predicate: 'includedGraphs'},
            EXCLUDED_PREDICATES: {name: 'Excluded Predicates', predicate: 'excludedPredicates'},
            EXCLUDED_GRAPHS: {name: 'Excluded Graphs', predicate: 'excludedGraphs'}
        };

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
            return $scope.loaderMessage || 'Loading...';
        };

        $scope.computeRank = function () {
            $scope.setLoader(true, 'Requesting rank full computation...');

            RdfRankRestService.compute().success(function () {
                $scope.currentRankStatus = $scope.rdfStatus.COMPUTING;
            }).error(function (data) {
                toastr.error(getError(data));
            }).finally(function () {
                $scope.setLoader(false);
            });
        };

        $scope.computeIncrementalRank = function () {
            $scope.setLoader(true, 'Requesting rank incremental computation...');

            RdfRankRestService.computeIncremental().success(function () {
                $scope.currentRankStatus = $scope.rdfStatus.COMPUTING;
            }).error(function (data) {
                toastr.error(getError(data));
            }).finally(function () {
                $scope.setLoader(false);
            });
        };

        $scope.interruptComputation = function () {
            $scope.setLoader(true, 'Interrupting index...');

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
            if (!$repositories.getActiveRepository() || $repositories.isActiveRepoOntopType()) {
                return;
            }
            checkForPlugin();
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
            if (UriUtils.isValidIri(iri.text)) {
                _addToList(list, expandPrefix(iri.text, $scope.namespaces));
            } else {
                refreshFilteringConfig();
                toastr.error('\'' + iri.text + '\' is not a valid IRI');
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
            _deleteFromList(list, expandPrefix(iri.text, $scope.namespaces));
        };

        const pullStatus = function () {
            const timer = $interval(function () {
                if ($scope.pluginFound) {
                    refreshStatus();
                }
            }, 5000);

            $scope.$on('$destroy', function () {
                $interval.cancel(timer);
            });
        };

        function expandPrefix(str, namespaces) {
            const ABS_URI_REGEX = /^<?(http|urn).*>?/;
            if (!ABS_URI_REGEX.test(str)) {
                const uriParts = str.split(':');
                const uriPart = uriParts[0];
                const localName = uriParts[1];
                if (!angular.isUndefined(localName)) {
                    const expandedUri = ClassInstanceDetailsService.getNamespaceUriForPrefix(namespaces, uriPart);
                    if (expandedUri) {
                        return expandedUri + localName;
                    }
                }
            }
            return str;
        }

        function foldPrefix(iri, namespaces) {
            const localPart = ClassInstanceDetailsService.getLocalName(iri);
            const iriPart = iri.replace(new RegExp(localPart + '$', 'i'), '');
            const folded = ClassInstanceDetailsService.getNamespacePrefixForUri(namespaces, iriPart);

            return folded === '' ? iri : folded + ':' + localPart;
        }

        const init = function() {
            if (!$repositories.getActiveRepository() || $repositories.isActiveRepoOntopType()) {
                return;
            }
            checkForPlugin();
            pullStatus();
        };

        init();
    }]);
