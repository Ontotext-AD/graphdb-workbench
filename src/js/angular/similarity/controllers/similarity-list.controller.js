import YASR from 'lib/yasr.bundled';
import {decodeHTML} from "../../../../app";
import {YasrUtils} from "../../utils/yasr-utils";

angular
    .module('graphdb.framework.similarity.controllers.list', [])
    .controller('SimilarityCtrl', SimilarityCtrl);

SimilarityCtrl.$inject = ['$scope', '$interval', 'toastr', '$repositories', '$licenseService', 'ModalService', '$uibModal', 'SimilarityRestService', 'AutocompleteRestService', 'productInfo', 'RDF4JRepositoriesRestService', '$translate'];

function SimilarityCtrl($scope, $interval, toastr, $repositories, $licenseService, ModalService, $uibModal, SimilarityRestService, AutocompleteRestService, productInfo, RDF4JRepositoriesRestService, $translate) {

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
    $scope.isGraphDBRepository = undefined;
    $scope.canEditRepo = $scope.canWriteActiveRepo();
    $scope.loadSimilarityIndexesTimer = undefined;

    let yasr;

    // =========================
    // Public functions
    // =========================
    // loads similarity indexes
    $scope.loadSimilarityIndexes = function () {
        if (!$scope.isGraphDBRepository || !$scope.pluginIsActive) {
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

    $scope.updateSimilarityIndexes = function () {
        $scope.loadSimilarityIndexes();
        if (!$scope.loadSimilarityIndexesTimer) {
            $scope.loadSimilarityIndexesTimer = $interval(function () {
                $scope.$broadcast('checkIsActive');
                if ($('#indexes-table').attr('aria-expanded') !== 'false') {
                    $scope.loadSimilarityIndexes();
                }
            }, 5000);
        }
    };

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
                        $scope.loadSimilarityIndexes();
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
    const init = () => {
        const activeRepository = $scope.getActiveRepository();
        if (activeRepository && $scope.activeRepository !== activeRepository) {
            if ($licenseService.isLicenseValid()) {
                $scope.updateSimilarityIndexes();
            }
            $scope.canEditRepo = $scope.canWriteActiveRepo();
            $scope.activeRepository = activeRepository;
            $scope.isGraphDBRepository = checkIsGraphDBRepository();
            if ($scope.isGraphDBRepository) {
                loadSearchQueries();
                initYasr();
            }
        }
    };

    const loadSearchQueries = () => {
        SimilarityRestService.getSearchQueries().success(function (data) {
            $scope.searchQueries = data;
        }).error(function (data) {
            const msg = getError(data);
            toastr.error(msg, $translate.instant('similarity.could.not.get.search.queries.error'));
        });
    };

    const createYasr = (usedPrefixes) => {
        yasr = YASR(document.getElementById('yasr'), { // eslint-disable-line new-cap
            //this way, the URLs in the results are prettified using the defined prefixes
            getUsedPrefixes: $scope.usedPrefixes,
            persistency: false,
            hideHeader: true,
            pluginsOptions: YasrUtils.getYasrConfiguration()
        });
    };

    const initYasr = () => {
        $repositories.getPrefixes($repositories.getActiveRepository())
            .then((usedPrefixes) => {
                checkAutocompleteStatus();
                createYasr(usedPrefixes);
            }).catch((error) => {
            toastr.error(getError(error), $translate.instant('get.namespaces.error.msg'));
        });
    };

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

    const checkIsGraphDBRepository = () => {
        return $scope.getActiveRepository() && !$scope.isActiveRepoOntopType() && !$scope.isActiveRepoFedXType();
    };

    // =========================
    // Event handlers
    // =========================
    const subscriptions = [];
    /**
     * When the repository gets changed through the UI, we need to update the yasgui configuration so that new queries
     * to be issued against the new repository.
     */
    subscriptions.push($scope.$on('repositoryIsSet', init));

    // Deregister the watcher when the scope/directive is destroyed
    $scope.$on('$destroy', function () {
        removeAllListeners();

        if (yasr) {
            yasr.destroy();
        }

        if ($scope.loadSimilarityIndexesTimer) {
            $interval.cancel($scope.loadSimilarityIndexesTimer);
        }
    });

    const removeAllListeners = () => {
        subscriptions.forEach((subscription) => subscription());
    };

    subscriptions.push($scope.$on('autocompleteStatus', checkAutocompleteStatus));

    subscriptions.push($scope.$watch('searchType', function () {
        $scope.empty = true;
    }));

    // Wait until the active repository object is set, otherwise "canWriteActiveRepo()" may return a wrong result and the "ontotext-yasgui"
    // readOnly configuration may be incorrect.
    const repoIsInitialized = $scope.$watch(function () {
        return $scope.getActiveRepositoryObject();
    }, function (activeRepo) {
        if (activeRepo) {
            init();
            repoIsInitialized();
        }
    });
}
