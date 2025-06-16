import YASR from 'lib/yasr.bundled';

angular
    .module('graphdb.framework.similarity.controllers.list', [])
    .controller('SimilarityCtrl', SimilarityCtrl);

SimilarityCtrl.$inject = ['$scope', '$interval', 'toastr', '$repositories', 'ModalService', '$uibModal', 'SimilarityRestService', 'AutocompleteRestService', 'productInfo', 'RDF4JRepositoriesRestService'];

function SimilarityCtrl($scope, $interval, toastr, $repositories, ModalService, $uibModal, SimilarityRestService, AutocompleteRestService, productInfo, RDF4JRepositoriesRestService) {

    const PREFIX = 'http://www.ontotext.com/graphdb/similarity/';
    const PREFIX_PREDICATION = 'http://www.ontotext.com/graphdb/similarity/psi/';
    const PREFIX_INSTANCE = PREFIX + 'instance/';
    const ANY_PREDICATE = PREFIX_PREDICATION + 'any';
    $scope.pluginName = 'similarity';
    $scope.pluginIsActive = true;

    $scope.setPluginIsActive = function (isPluginActive) {
        $scope.pluginIsActive = isPluginActive;
    }

    const literalForQuery = function (literal) {
        return '"' + literal + '"';
    };

    // TODO: Fix cases when this function is called with undefined
    const iriForQuery = function (iri) {
        // Do not put brackets on nested triples
        if (iri === undefined || iri.startsWith("<<") && iri.endsWith(">>")) {
            return iri;
        }
        return '<' + iri + '>';
    };

    $scope.info = productInfo;

    $scope.getActiveRepository = function () {
        return $repositories.getActiveRepository();
    };

    // Don't call functions if one of the following conditions are met
    function shouldSkipCall() {
        return !$scope.getActiveRepository() ||
                    $scope.isActiveRepoFedXType() ||
                         $scope.isActiveRepoOntopType();
    }

    if (!shouldSkipCall()) {
        SimilarityRestService.getSearchQueries().success(function (data) {
            $scope.searchQueries = data;
        }).error(function (data) {
            const msg = getError(data);
            toastr.error(msg, 'Could not get search queries');
        });
    }

    $scope.encodeURIComponent = function (param) {
        return encodeURIComponent(param);
    };

    // get similarity indexes
    $scope.getSimilarityIndexes = function () {
        if (shouldSkipCall() || !$scope.pluginIsActive) {
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
        $scope.getSimilarityIndexes();
        const timer = $interval(function () {
            $scope.$broadcast('checkIsActive');
            if ($('#indexes-table').attr('aria-expanded') !== 'false') {
                $scope.getSimilarityIndexes();
            }
        }, 5000);
        $scope.$on('$destroy', function () {
            $interval.cancel(timer);
        });
    };

    if ($scope.getActiveRepository()) {
        $scope.pullList();
    }

    let yasr;

    $scope.$watch(function () {
        return $repositories.getActiveRepository();
    }, function () {
        // Don't try to get namespaces for ontop or fedx repository
        if ($scope.getActiveRepository() && !$scope.isActiveRepoOntopType() && !$scope.isActiveRepoFedXType()) {
            $scope.getNamespacesPromise = RDF4JRepositoriesRestService.getNamespaces($scope.getActiveRepository())
                .success(function (data) {
                    checkAutocompleteStatus();
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

    function checkAutocompleteStatus() {
        $scope.getAutocompletePromise = AutocompleteRestService.checkAutocompleteStatus();
    }

    $scope.$on('autocompleteStatus', function() {
        checkAutocompleteStatus();
    });

    $scope.loading = false;

    $scope.selected = undefined;
    $scope.searchType = 'searchTerm';
    $scope.resultType = 'termResult';

    $scope.$watch('searchType', function () {
        $scope.empty = true;
    });

    $scope.goToSimilarityIndex = function (index) {
        if (!('BUILT' === index.status || 'OUTDATED' === index.status || 'REBUILDING' === index.status)) {
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

        const headers = {Accept: 'application/x-sparqlstar-results+json, application/sparql-results+json;q=0.9, */*;q=0.8'};
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

        $uibModal.open({
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
        SimilarityRestService.getQuery({
            indexName: index.name,
            indexOptions: index.options,
            query: index.selectQuery,
            indexStopList: index.stopList,
            queryInference: index.infer,
            querySameAs: index.sameAs,
            viewType: index.type,
            indexAnalyzer: index.analyzer
        }).success(function (query) {
            $uibModal.open({
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
            message: 'Are you sure you want to rebuild the whole index ' + '\'' + index.name + '\'?' + '<br>You will still be able to use the latest successful build!',
            warning: true
        }).result
            .then(function () {
                index.status = 'REBUILDING';
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
    };
}
