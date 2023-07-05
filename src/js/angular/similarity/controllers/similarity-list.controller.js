import YASR from 'lib/yasr.bundled';
import {decodeHTML} from "../../../../app";
import {YasrUtils} from "../../utils/yasr-utils";

angular
    .module('graphdb.framework.similarity.controllers.list', [])
    .controller('SimilarityCtrl', SimilarityCtrl);

SimilarityCtrl.$inject = ['$scope', '$interval', 'toastr', '$repositories', '$licenseService', 'ModalService', '$uibModal', 'SimilarityRestService', 'AutocompleteRestService', 'productInfo', 'RDF4JRepositoriesRestService', '$translate', '$http'];

function SimilarityCtrl($scope, $interval, toastr, $repositories, $licenseService, ModalService, $uibModal, SimilarityRestService, AutocompleteRestService, productInfo, RDF4JRepositoriesRestService, $translate, $http) {

    const PREFIX = 'http://www.ontotext.com/graphdb/similarity/';
    const PREFIX_PREDICATION = 'http://www.ontotext.com/graphdb/similarity/psi/';
    const PREFIX_INSTANCE = PREFIX + 'instance/';
    const ANY_PREDICATE = PREFIX_PREDICATION + 'any';
    $scope.pluginName = 'similarity';
    $scope.pluginIsActive = true;

    $scope.loading = false;

    $scope.selected = undefined;
    $scope.searchType = 'searchTerm';
    $scope.resultType = 'termResult';
    $scope.info = productInfo;

    let yasr;

    // =========================
    // Public functions
    // =========================
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
                toastr.error(msg, $translate.instant('similarity.could.not.get.indexes.error'));
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
        if ($licenseService.isLicenseValid()) {
            $scope.pullList();
        }
    }

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

    $scope.getActiveRepository = () => {
        return $repositories.getActiveRepository();
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

        $http({
            method: 'GET',
            url: 'repositories/' + $repositories.getActiveRepository(),
            params: sendData,
            headers: headers
        }).then(function ({data, textStatus, jqXhrOrErrorString}) {
            toggleOntoLoader(false);
            yasr.setResponse(data, textStatus, jqXhrOrErrorString);
        }).catch(function (data) {
            toastr.error(getError(data), $translate.instant('similarity.get.resource.error'));
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

        //replace template prefix for PREFIX_INSTANCE in the view mode with actual prefix from the query
        let tokens = [];
        let prefix = '';
        tokens = queryTemplate.match(/[a-zA-Z0-9-]+:<http:\/\/www.ontotext.com\/graphdb\/similarity\/instance\/>/);
        prefix = tokens == null ? "similarity-index" : tokens[0].substring(0, tokens[0].indexOf(':'));

        const replacedQuery = queryTemplate
            .replace('?index', prefix + ':' + $scope.selected.name)
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
            title: $translate.instant('common.confirm'),
            message: $translate.instant('similarity.delete.index.warning', {name: index.name}),
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
            title: $translate.instant('common.confirm'),
            message: decodeHTML($translate.instant('similarity.rebuild.index.warning', {name: index.name})),
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

    $scope.setPluginIsActive = function (isPluginActive) {
        $scope.pluginIsActive = isPluginActive;
    };

    $scope.encodeURIComponent = function (param) {
        return encodeURIComponent(param);
    };

    $scope.copyToClipboardResult = function (uri) {
        ModalService.openCopyToClipboardModal(uri);
    };

    $scope.trimIRI = function (iri) {
        return _.trim(iri, "<>");
    };

    // =========================
    // Private functions
    // =========================
    const literalForQuery = (literal) => {
        return '"' + literal + '"';
    };

    // TODO: Fix cases when this function is called with undefined
    const iriForQuery = (iri) => {
        // Do not put brackets on nested triples
        if (iri === undefined || iri.startsWith("<<") && iri.endsWith(">>")) {
            return iri;
        }
        return '<' + iri + '>';
    };

    // Don't call functions if one of the following conditions are met
    function shouldSkipCall() {
        return !$scope.getActiveRepository() ||
            $scope.isActiveRepoFedXType() ||
            $scope.isActiveRepoOntopType();
    }

    const checkAutocompleteStatus = () => {
        if ($licenseService.isLicenseValid()) {
            $scope.getAutocompletePromise = AutocompleteRestService.checkAutocompleteStatus();
        }
    };

    const toggleOntoLoader = (showLoader) => {
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

    // =========================
    // Event handlers
    // =========================
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
                    $scope.$on('$destroy', function () {
                        if (yasr) {
                            yasr.destroy();
                        }
                    });
                    yasr = YASR(document.getElementById('yasr'), { // eslint-disable-line new-cap
                        //this way, the URLs in the results are prettified using the defined prefixes
                        getUsedPrefixes: $scope.usedPrefixes,
                        persistency: false,
                        hideHeader: true,
                        pluginsOptions: YasrUtils.getYasrConfiguration()
                    });
                }).error(function (data) {
                    toastr.error(getError(data), $translate.instant('get.namespaces.error.msg'));
                });
        }
    });

    $scope.$on('autocompleteStatus', function () {
        checkAutocompleteStatus();
    });

    $scope.$watch('searchType', function () {
        $scope.empty = true;
    });

    // =========================
    // After component init
    // =========================

    if (!shouldSkipCall()) {
        SimilarityRestService.getSearchQueries().success(function (data) {
            $scope.searchQueries = data;
        }).error(function (data) {
            const msg = getError(data);
            toastr.error(msg, $translate.instant('similarity.could.not.get.search.queries.error'));
        });
    }
}
