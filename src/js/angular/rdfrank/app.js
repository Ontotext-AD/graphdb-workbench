import 'angular/core/services';
import 'angular/core/directives';

const rdfRankApp = angular.module('graphdb.framework.rdfrank', ['ngRoute']);

rdfRankApp.config(['$routeProvider', '$menuItemsProvider', function ($routeProvider, $menuItemsProvider) {
    $routeProvider.when('/rdfrank', {
        templateUrl: 'pages/rdfrank.html',
        controller: 'RDFRankCtrl',
        title: 'RDF Rank',
        helpInfo: 'RDF Rank is an algorithm that identifies the more important or more popular ' +
        'entities in the repository by examining their interconnectedness. The popularity of entities' +
        ' can then be used to order the query results.'
    });

    $menuItemsProvider.addItem({label: 'Setup', href: '#', order: 5, role: 'IS_AUTHENTICATED_FULLY', icon: "icon-settings"});
    $menuItemsProvider.addItem({
        label: 'RDF Rank',
        href: 'rdfrank',
        order: 45,
        parent: 'Setup',
        role: "IS_AUTHENTICATED_FULLY"
    });
}]);

rdfRankApp.controller('RDFRankCtrl', ['$scope', '$http', '$interval', 'toastr', '$repositories', '$modal', '$timeout', 'ClassInstanceDetailsService', 'UtilService',
    function ($scope, $http, $interval, toastr, $repositories, $modal, $timeout, ClassInstanceDetailsService, UtilService) {

        var refreshStatus = function () {
            $http.get('rest/rdfrank/status')
                .success(function (data, status, headers, config) {
                    $scope.currentRankStatus = data;
                }).error(function (data, status, headers, config) {
                toastr.error(getError(data));
            });
        };

        var initNamespaces = function () {
            $http.get('repositories/' + $scope.getActiveRepository() + '/namespaces').success(function (data) {
                var nss = _.map(data.results.bindings, function (o) {
                    return {"uri": o.namespace.value, "prefix": o.prefix.value}
                });
                $scope.namespaces = _.sortBy(nss, function (n) {
                    return n.uri.length
                });

            }).error(function (data) {
                toastr.error('Cannot get namespaces for repository. View will not work properly; ' + getError(data));
            });
        };

        var checkForPlugin = function () {
            $scope.pluginFound = false;

            if (!$repositories.getActiveRepository()) {
                return;
            }

            $scope.setLoader(true);
            $http.get('rest/rdfrank/pluginFound')
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

        var refreshFilteringStatus = function () {
            $http.get('rest/rdfrank/filtering')
                .success(function (data, status, headers, config) {
                    $scope.filteringEnabled = data;
                }).error(function (data, status, headers, config) {
                toastr.error(getError(data));
            });
        };

        var refreshFilteringConfig = function () {
            Object.values($scope.filterLists).forEach(function (list) {
                $http.get('rest/rdfrank/filtering/' + list.predicate)
                    .success(function (data, status, headers, config) {
                        list.elements = data;

                        list.elements = list.elements.map(function (elem) {
                            return foldPrefix(elem, $scope.namespaces);
                        });

                    }).error(function (data, status, headers, config) {
                    toastr.error(getError(data));
                });
            });
            $http.get('rest/rdfrank/includeExplicit')
                .success(function (data, status, headers, config) {
                    $scope.includeExplicit = data;
                }).error(function (data, status, headers, config) {
                toastr.error(getError(data));
            });
            $http.get('rest/rdfrank/includeImplicit')
                .success(function (data, status, headers, config) {
                    $scope.includeImplicit = data;
                }).error(function (data, status, headers, config) {
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

            $http.post('rest/rdfrank/compute').success(function (data, status, headers, config) {
                $scope.currentRankStatus = $scope.rdfStatus.COMPUTING
            }).error(function (data) {
                toastr.error(getError(data));
            }).finally(function () {
                $scope.setLoader(false);
            });
        };

        $scope.computeIncrementalRank = function () {
            $scope.setLoader(true, 'Requesting rank incremental computation...');

            $http.post('rest/rdfrank/computeIncremental').success(function (data, status, headers, config) {
                $scope.currentRankStatus = $scope.rdfStatus.COMPUTING
            }).error(function (data) {
                toastr.error(getError(data));
            }).finally(function () {
                $scope.setLoader(false);
            });
        };

        $scope.interruptComputation = function () {
            $scope.setLoader(true, 'Interrupting index...');

            $http.post('rest/rdfrank/interrupt').success(function () {
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
            if (!$repositories.getActiveRepository()) {
                return;
            }
            checkForPlugin();
        });

        $scope.toggleFiltering = function () {
            $http.post('rest/rdfrank/filtering?enabled=' + !$scope.filteringEnabled).success(function () {
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
            $http.post('rest/rdfrank/includeExplicit?enabled=' + !$scope.includeExplicit).success(function () {
                refreshStatus();
                refreshFilteringConfig();
            }).error(function (data) {
                toastr.error(getError(data));
            }).finally(function () {
                $scope.setLoader(false);
            });
        };

        $scope.toggleIncludeImplicit = function () {
            $http.post('rest/rdfrank/includeImplicit?enabled=' + !$scope.includeImplicit).success(function () {
                refreshStatus();
                refreshFilteringConfig();
            }).error(function (data) {
                toastr.error(getError(data));
            }).finally(function () {
                $scope.setLoader(false);
            });
        };

        var _addToList = function (list, iri) {
            var data = {
                iri: iri
            };
            $http.put('rest/rdfrank/filtering/' + list.predicate, data)
                .success(function (data, status, headers, config) {
                    refreshStatus();
                    refreshFilteringConfig()
                }).error(function (data, status, headers, config) {
                toastr.error(getError(data));
                refreshFilteringConfig()
            });
        };

        $scope.addToList = function (list, iri) {
            if (UtilService.isValidIri(iri.text)) {
                _addToList(list, expandPrefix(iri.text, $scope.namespaces));
            } else {
                refreshFilteringConfig();
                toastr.error('\'' + iri.text + '\' is not a valid IRI')
            }
        };

        var _deleteFromList = function (list, iri) {
            var data = {
                iri: iri
            };
            $http.delete('rest/rdfrank/filtering/' + list.predicate, {
                data: data,
                headers: {"Content-Type": "application/json;charset=utf-8"}
            })
                .success(function (data, status, headers, config) {
                    refreshStatus();
                    refreshFilteringConfig()
                }).error(function (data, status, headers, config) {
                toastr.error(getError(data));
            });
        };

        $scope.deleteFromList = function (list, iri) {
            _deleteFromList(list, expandPrefix(iri.text, $scope.namespaces));
        };

        var pullStatus = function () {
            var timer = $interval(function () {
                if ($scope.pluginFound) {
                    refreshStatus();
                }
            }, 5000);

            $scope.$on("$destroy", function (event) {
                $interval.cancel(timer);
            });
        };

        var refreshPage = function () {
            refreshStatus();
            refreshFilteringStatus();
            refreshFilteringConfig();
        };

        function expandPrefix(str, namespaces) {
            var ABS_URI_REGEX = /^<?(http|urn).*>?/;
            if (!ABS_URI_REGEX.test(str)) {
                var uriParts = str.split(':'),
                    uriPart = uriParts[0],
                    localName = uriParts[1];
                if (!angular.isUndefined(localName)) {
                    var expandedUri = ClassInstanceDetailsService.getNamespaceUriForPrefix(namespaces, uriPart);
                    if (expandedUri) {
                        return expandedUri + localName;
                    }
                }
            }
            return str;
        }

        function foldPrefix(iri, namespaces) {
            var localPart = ClassInstanceDetailsService.getLocalName(iri);
            var iriPart = iri.replace(new RegExp(localPart + '$', 'i'), '');
            var folded = ClassInstanceDetailsService.getNamespacePrefixForUri(namespaces, iriPart);

            return folded === '' ? iri : folded + ':' + localPart;
        }

        if ($repositories.getActiveRepository()) {
            checkForPlugin();
        }

        $scope.$on('repositoryIsSet', function () {
            if (!$repositories.getActiveRepository()) {
                return;
            }
            checkForPlugin();
        });

        pullStatus();

    }]);
