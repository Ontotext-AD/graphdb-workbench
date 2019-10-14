import YASR from 'lib/yasr.bundled';

angular
    .module('graphdb.framework.similarity.controllers.list', [])
    .controller('SimilarityCtrl', SimilarityCtrl);

SimilarityCtrl.$inject = ['$scope', '$http', '$interval', 'toastr', '$repositories', 'ModalService', '$modal', '$timeout', 'SimilarityRestService', 'ClassInstanceDetailsService', 'AutocompleteRestService', 'productInfo'];

function SimilarityCtrl($scope, $http, $interval, toastr, $repositories, ModalService, $modal, $timeout, SimilarityRestService, ClassInstanceDetailsService, AutocompleteRestService, productInfo) {

    const PREFIX = 'http://www.ontotext.com/graphdb/similarity/';
    const PREFIX_PREDICATION = 'http://www.ontotext.com/graphdb/similarity/psi/';
    const PREFIX_INSTANCE = PREFIX + 'instance/';
    const ANY_PREDICATE = PREFIX_PREDICATION + 'any';

    const literalForQuery = function (literal) {
        return '"' + literal + '"';
    };

    const iriForQuery = function (iri) {
        return '<' + iri + '>';
    };

    $scope.info = productInfo;
    $scope.pluginDisabled = false;

    $scope.getActiveRepository = function () {
        return $repositories.getActiveRepository();
    };


    $scope.checkPluginEnabled = function () {
        if (!$scope.getActiveRepository()) {
            return;
        }
        SimilarityRestService.checkPluginEnabled()
            .done(function (data) {
                $scope.pluginDisabled = data.indexOf('false') > 0;
            })
            .fail(function (data) {
                toastr.error(getError(data), 'Could not check plugin enabled!');
            });
    };

    $scope.enabledSimilarityPlugin = function () {
        SimilarityRestService.enableSimilarityPlugin()
            .done(function () {
                $scope.pluginDisabled = false;
                $scope.getSimilarityIndexes();
            })
            .fail(function (data) {
                toastr.error(getError(data), 'Could not enable plugin!');
            });
    };

    SimilarityRestService.getSearchQueries().success(function (data) {
        $scope.searchQueries = data;
    }).error(function (data) {
        const msg = getError(data);
        toastr.error(msg, 'Could not get search queries');
    });

    $scope.encodeURIComponent = function (param) {
        return encodeURIComponent(param);
    };

    // get similarity indexes
    $scope.getSimilarityIndexes = function () {
        if (!$scope.getActiveRepository() || $scope.pluginDisabled) {
            return;
        }
        SimilarityRestService.getIndexes()
            .success(function (data) {
                $scope.similarityIndexes = data;
            })
            .error(function (data) {
                const msg = getError(data);
                toastr.error(msg, 'Could not get indexes');
            });
    };

    $scope.pullList = function () {
        if (!$scope.getActiveRepository() || $scope.pluginDisabled) {
            return;
        }
        $scope.getSimilarityIndexes();
        const timer = $interval(function () {
            if ($('#indexes-table').attr('aria-expanded') !== 'false') {
                $scope.getSimilarityIndexes();
            }
        }, 5000);
        $scope.$on('$destroy', function () {
            $interval.cancel(timer);
        });
    };

    $scope.$on('repositoryIsSet', function () {
        $scope.checkPluginEnabled();
        $scope.pullList();
    });
    if ($scope.getActiveRepository()) {
        $scope.checkPluginEnabled();
        $scope.pullList();
    }

    let yasr;

    $scope.$watch(function () {
        return $repositories.getActiveRepository();
    }, function () {
        if ($scope.getActiveRepository()) {
            $http.get('repositories/' + $scope.getActiveRepository() + '/namespaces').success(function (data) {
                $scope.getNamespacesPromise = ClassInstanceDetailsService.getNamespaces($scope.getActiveRepository());
                $scope.getAutocompletePromise = AutocompleteRestService.checkAutocompleteStatus();
                $scope.usedPrefixes = {};
                data.results.bindings.forEach(function (e) {
                    $scope.usedPrefixes[e.prefix.value] = e.namespace.value;
                });
                yasr = YASR(document.getElementById('yasr'), { // eslint-disable-line new-cap
                    //this way, the URLs in the results are prettified using the defined prefixes
                    getUsedPrefixes: $scope.usedPrefixes,
                    persistency: false,
                    hideHeader: true
                });
            }).error(function (data) {
                toastr.error(getError(data), 'Cannot get namespaces for repository. View will not work properly;');
            });
        }
    });

    $scope.loading = false;

    $scope.selected = undefined;
    $scope.searchType = 'searchTerm';
    $scope.resultType = 'termResult';

    $scope.$watch('searchType', function () {
        $scope.empty = true;
    });

    $scope.goToSimilarityIndex = function (index) {
        if (!('BUILT' === index.status || 'OUTDATED' === index.status)) {
            return;
        }
        $scope.empty = true;
        if ($scope.selected !== index) {
            $scope.lastSearch = undefined;
            $scope.selected = index;
        }
        if (index.type === 'text') {
            $scope.searchType = 'searchTerm';
        } else if (index.type === 'predication') {
            $scope.searchType = 'searchEntity';
        }
        if (index.type === 'text' || index.type === 'predication') {
            $('#indexes-table').collapse('hide');
        }
    };

    const toggleOntoLoader = function (showLoader) {
        const yasrInnerContainer = angular.element(document.getElementById('yasr-inner'));
        const resultsLoader = angular.element(document.getElementById('results-loader'));
        /* Angular b**it. For some reason the loader behaved strangely with ng-show not always showing */
        if (showLoader) {
            $scope.loading = true;
            yasrInnerContainer.addClass('opacity-hide');
            resultsLoader.removeClass('opacity-hide');
        } else {
            $scope.loading = false;
            yasrInnerContainer.removeClass('opacity-hide');
            resultsLoader.addClass('opacity-hide');
        }
    };

    $scope.performSearch = function (index, uri, searchType, resultType, parameters) {

        toggleOntoLoader(true);

        // this is either the search term or the iri for the subject
        let termOrSubject = uri;

        $scope.lastSearch = {};
        $scope.lastSearch.type = searchType;

        if (searchType === 'searchEntityPredicate') {
            termOrSubject = $scope.psiSubject;
            $scope.lastSearch.predicate = uri;
        }

        if (searchType === 'searchTerm') {
            termOrSubject = literalForQuery(termOrSubject);
        } else {
            termOrSubject = iriForQuery(termOrSubject);
        }

        $scope.lastSearch.termOrSubject = termOrSubject;

        const headers = {Accept: 'application/sparql-results+json'};
        let sparqlQuery;
        if (searchType === 'searchAnalogical') {
            sparqlQuery = ($scope.selected.analogicalQuery) ? $scope.selected.analogicalQuery : $scope.searchQueries['analogical'];
        } else {
            sparqlQuery = ($scope.selected.searchQuery) ? $scope.selected.searchQuery : $scope.searchQueries[$scope.selected.type];
        }
        const sendData = {
            query: sparqlQuery,
            $index: iriForQuery(PREFIX_INSTANCE + index),
            $query: termOrSubject,
            $searchType: iriForQuery(($scope.selected.type === 'text' ? PREFIX : PREFIX_PREDICATION) + (searchType === 'searchEntityPredicate' ? 'searchEntity' : searchType)),
            $resultType: iriForQuery($scope.selected.type === 'text' ? PREFIX + resultType : PREFIX_PREDICATION + 'entityResult'),
            $parameters: literalForQuery(parameters)
        };

        if (searchType === 'searchEntityPredicate') {
            sendData.$psiPredicate = $scope.lastSearch.predicate ? iriForQuery($scope.lastSearch.predicate) : iriForQuery(ANY_PREDICATE);
        }

        if (searchType === 'searchAnalogical') {
            $scope.searchSubject = uri;
            sendData.$givenSubject = iriForQuery($scope.analogicalSubject);
            sendData.$givenObject = iriForQuery($scope.analogicalObject);
            sendData.$searchSubject = iriForQuery(uri);
        }

        $.ajax({
            method: 'GET',
            url: 'repositories/' + $repositories.getActiveRepository(),
            data: sendData,
            headers: headers
        }).done(function (data, textStatus, jqXhrOrErrorString) {
            toggleOntoLoader(false);
            yasr.setResponse(data, textStatus, jqXhrOrErrorString);
        }).fail(function (data) {
            toastr.error(getError(data), 'Could not get resource!');
            toggleOntoLoader(false);
        });
    };

    $scope.viewSearchQuery = function () {
        let queryTemplate;
        if ($scope.lastSearch.type === 'searchAnalogical') {
            queryTemplate = ($scope.selected.analogicalQuery) ? $scope.selected.analogicalQuery : $scope.searchQueries['analogical'];
        } else {
            queryTemplate = ($scope.selected.searchQuery) ? $scope.selected.searchQuery : $scope.searchQueries[$scope.selected.type];
        }
        const replacedQuery = queryTemplate
            .replace('?index', 'inst:' + $scope.selected.name)
            .replace('?query', $scope.lastSearch.termOrSubject)
            .replace('?searchType', ($scope.selected.type === 'text' ? ':' : 'psi:') + ($scope.lastSearch.type === 'searchEntityPredicate' ? 'searchEntity' : $scope.lastSearch.type))
            .replace('?resultType', $scope.selected.type === 'text' ? ':' + $scope.resultType : 'psi:entityResult')
            .replace('?parameters', literalForQuery((!$scope.searchParameters) ? '' : $scope.searchParameters))
            .replace('?psiPredicate', $scope.lastSearch.predicate ? iriForQuery($scope.lastSearch.predicate) : iriForQuery(ANY_PREDICATE))
            .replace('?givenSubject', iriForQuery($scope.analogicalSubject))
            .replace('?givenObject', iriForQuery($scope.analogicalObject))
            .replace('?searchSubject', iriForQuery($scope.searchSubject));

        $modal.open({
            templateUrl: 'pages/viewQuery.html',
            controller: 'ViewQueryCtrl',
            resolve: {
                query: function () {
                    return replacedQuery;
                }
            }
        });
    };


    $scope.deleteIndex = function (index) {
        ModalService.openSimpleModal({
            title: 'Confirm',
            message: 'Are you sure you want to delete the index ' + '\'' + index.name + '\'?',
            warning: true
        }).result
            .then(function () {
                SimilarityRestService.deleteIndex(index)
                    .then(function () {
                        $scope.getSimilarityIndexes();
                    }, function (err) {
                        toastr.error(getError(err));
                    });
            });
    };

    $scope.viewCreateQuery = function (index) {
        $http.get('/rest/similarity/query',
            {
                params: {
                    name: index.name,
                    options: index.options,
                    selectQuery: index.selectQuery,
                    stopList: index.stopList,
                    infer: index.infer,
                    sameAs: index.sameAs,
                    type: index.type,
                    analyzer: index.analyzer
                }
            }).success(function (query) {
                $modal.open({
                    templateUrl: 'pages/viewQuery.html',
                    controller: 'ViewQueryCtrl',
                    resolve: {
                        query: function () {
                            return query;
                        }
                    }
                });
            });
    };

    $scope.rebuildIndex = function (index) {
        // Migration
        if (!index.searchQuery) {
            index.searchQuery = index.type ? $scope.searchQueries[index.type] : $scope.searchQueries.text;
        }
        ModalService.openSimpleModal({
            title: 'Confirm',
            message: 'Are you sure you want to rebuild the whole index ' + '\'' + index.name + '\'?',
            warning: true
        }).result
            .then(function () {
                index.status = 'BUILDING';
                SimilarityRestService.rebuildIndex(index)
                    .then(function (res) {
                    }, function (err) {
                        toastr.error(getError(err));
                    });
            });
    };

    $scope.copyToClipboardResult = function (uri) {
        ModalService.openCopyToClipboardModal(uri);
    };

    $scope.trimIRI = function (iri) {
        return _.trim(iri, "<>");
    }
}
