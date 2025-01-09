import 'angular/core/services/workbench-context.service';
import 'angular/core/services/rdf4j-repositories.service';
import {decodeHTML} from "../../../../app";
import {SimilaritySearchType} from "../../models/similarity/similarity-search-type";
import {SimilarityResultType} from "../../models/similarity/similarity-result-type";
import {SimilarityIndexStatus} from "../../models/similarity/similarity-index-status";
import {SimilarityIndexType} from "../../models/similarity/similarity-index-type";
import {mapIndexesResponseToSimilarityIndex} from "../../rest/mappers/similarity-index-mapper";
import {SimilaritySearch} from "../../models/similarity/similarity-search";
import {RenderingMode} from "../../models/ontotext-yasgui/rendering-mode";
import {NamespacesListModel} from "../../models/namespaces/namespaces-list";
import {RepositoryContextService, ServiceProvider} from "@ontotext/workbench-api";

const modules = ['graphdb.core.services.workbench-context', 'graphdb.framework.core.services.rdf4j.repositories'];
angular
    .module('graphdb.framework.similarity.controllers.list', modules)
    .controller('SimilarityCtrl', SimilarityCtrl);

SimilarityCtrl.$inject = [
    '$scope',
    '$interval',
    'toastr',
    '$repositories',
    '$licenseService',
    '$location',
    'ModalService',
    '$uibModal',
    'SimilarityRestService',
    'AutocompleteRestService',
    'productInfo',
    'RDF4JRepositoriesRestService',
    '$translate',
    'SparqlRestService',
    'WorkbenchContextService',
    'RDF4JRepositoriesService'
];

function SimilarityCtrl(
    $scope,
    $interval,
    toastr,
    $repositories,
    $licenseService,
    $location,
    ModalService,
    $uibModal,
    SimilarityRestService,
    AutocompleteRestService,
    productInfo,
    RDF4JRepositoriesRestService,
    $translate,
    SparqlRestService,
    WorkbenchContextService,
    RDF4JRepositoriesService) {

    const PREFIX = 'http://www.ontotext.com/graphdb/similarity/';
    const PREFIX_PREDICATION = 'http://www.ontotext.com/graphdb/similarity/psi/';
    const acceptContent = 'application/x-sparqlstar-results+json, application/sparql-results+json;q=0.9, */*;q=0.8';
    const PREFIX_INSTANCE = PREFIX + 'instance/';
    const ANY_PREDICATE = PREFIX_PREDICATION + 'any';
    $scope.pluginName = 'similarity';
    $scope.pluginIsActive = true;

    $scope.isLoading = false;

    $scope.selectedSimilarityIndex = undefined;

    $scope.similarityIndexStatus = SimilarityIndexStatus;

    $scope.similarityIndexType = SimilarityIndexType;

    $scope.similaritySearchType = SimilaritySearchType;
    $scope.searchType = SimilaritySearchType.SEARCH_TERM;

    $scope.similarityResultType = SimilarityResultType;
    $scope.resultType = SimilarityResultType.TERM_RESULT;

    $scope.info = productInfo;
    $scope.isGraphDBRepository = undefined;
    $scope.canEditRepo = $scope.canWriteActiveRepo();
    $scope.loadSimilarityIndexesTimer = undefined;

    // =========================
    // Public functions
    // =========================
    $scope.loadSimilarityIndexes = () => {
        if (!$scope.isGraphDBRepository || !$scope.pluginIsActive) {
            return;
        }
        SimilarityRestService.getIndexes()
            .success((data) => $scope.similarityIndexes = mapIndexesResponseToSimilarityIndex(data))
            .error((error) => toastr.error(getError(error), $translate.instant('similarity.could.not.get.indexes.error')));
    };

    $scope.reloadSimilarityIndexes = () => {
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

    $scope.goToSimilarityIndex = (similarityIndex) => {
        if (!similarityIndex.isBuiltStatus() && !similarityIndex.isOutdatedStatus() && !similarityIndex.isRebuildingStatus()) {
            return;
        }
        $scope.empty = true;
        if ($scope.selectedSimilarityIndex !== similarityIndex) {
            $scope.lastSearch = undefined;
            $scope.selectedSimilarityIndex = similarityIndex;
        }
        if (similarityIndex.isTextType()) {
            $scope.searchType = SimilaritySearchType.SEARCH_TERM;
        } else if (similarityIndex.isPredicationType()) {
            $scope.searchType = SimilaritySearchType.SEARCH_ENTITY;
        }
        if (similarityIndex.isTextType() || similarityIndex.isPredicationType()) {
            $('#indexes-table').collapse('hide');
        }
    };

    $scope.performSearch = (similarityIndex, uri, searchType, resultType, parameters) => {
        $scope.isLoading = true;
        updateLastSearch(searchType, uri);
        const sendData = buildSendData(similarityIndex, uri, searchType, resultType, parameters);
        SparqlRestService.getQueryResult($repositories.getActiveRepository(), sendData, acceptContent)
            .then((response) => setSimilarityResponse(response))
            .catch((error) => toastr.error(getError(error.data), $translate.instant('similarity.get.resource.error')))
            .finally(() => $scope.isLoading = false);
    };

    $scope.viewSearchQuery = () => {
        let queryTemplate;
        if ($scope.lastSearch.isSearchAnalogicalType()) {
            queryTemplate = ($scope.selectedSimilarityIndex.analogicalQuery) ? $scope.selectedSimilarityIndex.analogicalQuery : $scope.searchQueries['analogical'];
        } else {
            queryTemplate = ($scope.selectedSimilarityIndex.searchQuery) ? $scope.selectedSimilarityIndex.searchQuery : $scope.searchQueries[$scope.selectedSimilarityIndex.type];
        }

        //replace template prefix for PREFIX_INSTANCE in the view mode with actual prefix from the query
        let tokens = [];
        let prefix = '';
        tokens = queryTemplate.match(/[a-zA-Z0-9-]+:<http:\/\/www.ontotext.com\/graphdb\/similarity\/instance\/>/);
        prefix = tokens == null ? "similarity-index" : tokens[0].substring(0, tokens[0].indexOf(':'));

        const replacedQuery = queryTemplate
            .replace('?index', prefix + ':' + $scope.selectedSimilarityIndex.name)
            .replace('?query', $scope.lastSearch.termOrSubject)
            .replace('?searchType', ($scope.selectedSimilarityIndex.isTextType() ? ':' : 'psi:') + ($scope.lastSearch.isSearchEntityPredicateType() ? SimilaritySearchType.SEARCH_ENTITY : $scope.lastSearch.type))
            .replace('?resultType', $scope.selectedSimilarityIndex.isTextType() ? ':' + $scope.resultType : 'psi:entityResult')
            .replace('?parameters', literalForQuery((!$scope.searchParameters) ? '' : $scope.searchParameters))
            .replace('?psiPredicate', $scope.lastSearch.predicate ? iriForQuery($scope.lastSearch.predicate) : iriForQuery(ANY_PREDICATE))
            .replace('?givenSubject', iriForQuery($scope.analogicalSubject))
            .replace('?givenObject', iriForQuery($scope.analogicalObject))
            .replace('?searchSubject', iriForQuery($scope.searchSubject));

        $uibModal.open({
            templateUrl: 'pages/viewQuery.html',
            controller: 'ViewQueryCtrl',
            resolve: {
                query: () => replacedQuery
            }
        });
    };

    $scope.deleteSimilarityIndex = (similarityIndex) => {
        ModalService.openSimpleModal({
            title: $translate.instant('common.confirm'),
            message: $translate.instant('similarity.delete.index.warning', {name: similarityIndex.name}),
            warning: true
        }).result
            .then(function () {
                SimilarityRestService.deleteIndex(similarityIndex)
                    .then(() => $scope.loadSimilarityIndexes())
                    .catch((err) => toastr.error(getError(err)));
            });
    };

    $scope.viewCreateQuery = (index) => {
        SimilarityRestService.getQuery({
            indexName: index.name,
            indexOptions: index.options,
            query: index.selectQuery,
            indexStopList: index.stopList,
            queryInference: index.infer,
            querySameAs: index.sameAs,
            viewType: index.type,
            indexAnalyzer: index.analyzer
        }).success((query) => {
            $uibModal.open({
                templateUrl: 'pages/viewQuery.html',
                controller: 'ViewQueryCtrl',
                resolve: {
                    query: () => query
                }
            });
        });
    };

    $scope.rebuildIndex = (index) => {
        // Migration
        if (!index.searchQuery) {
            index.searchQuery = index.type ? $scope.searchQueries[index.type] : $scope.searchQueries.text;
        }
        ModalService.openSimpleModal({
            title: $translate.instant('common.confirm'),
            message: decodeHTML($translate.instant('similarity.rebuild.index.warning', {name: index.name})),
            warning: true
        }).result
            .then(() => {
                index.status = SimilarityIndexStatus.REBUILDING;
                SimilarityRestService.rebuildIndex(index)
                    .catch((error) => toastr.error(getError(error)));
            });
    };

    $scope.setPluginIsActive = (isPluginActive) => {
        $scope.pluginIsActive = isPluginActive;
    };

    $scope.encodeURIComponent = (param) => {
        return encodeURIComponent(param);
    };

    $scope.copyToClipboardResult = (uri) => {
        ModalService.openCopyToClipboardModal(uri);
    };

    $scope.trimIRI = (iri) => {
        return _.trim(iri, "<>");
    };

    $scope.updateSearchType = (searchType) => {
        $scope.searchType = searchType;
    };

    $scope.updateResultType = (resultType) => {
        $scope.resultType = resultType;
    };

    $scope.editSimilarityIndex = (similarityIndex) => {
        navigateToEditPage(similarityIndex);
    };

    $scope.cloneSimilataryIndex = (similarityIndex) => {
        navigateToEditPage(similarityIndex, true);
    };

    $scope.setPsiSubject = (psiSubject) => {
        $scope.psiSubject = psiSubject;
    };

    $scope.setAnalogicalSubject = (analogicalSubject) => {
        $scope.analogicalSubject = analogicalSubject;
    };

    $scope.setAnalogicalObject = (analogicalObject) => {
        $scope.analogicalObject = analogicalObject;
    };

    // =========================
    // Private functions
    // =========================
    const navigateToEditPage = (similarityIndex, isClone = false) => {
        const params = {
            selectQuery: similarityIndex.selectQuery,
            options: similarityIndex.options,
            name: similarityIndex.name,
            editSearchQuery: !isClone,
            infer: similarityIndex.infer,
            sameAs: similarityIndex.sameAs,
            stopList: similarityIndex.stopList,
            type: similarityIndex.type,
            analyzer: similarityIndex.analyzer,
            searchQuery: similarityIndex.searchQuery ? similarityIndex.searchQuery : '',
            analogicalQuery: similarityIndex.analogicalQuery ? similarityIndex.analogicalQuery : ''
        };
        $location.path('similarity/index/create').search(params);
    };

    const init = () => {
        const activeRepository = $scope.getActiveRepository();
        if (activeRepository && $scope.activeRepository !== activeRepository) {
            $scope.canEditRepo = $scope.canWriteActiveRepo();
            $scope.activeRepository = activeRepository;
            $scope.isGraphDBRepository = checkIsGraphDBRepository();
            if ($scope.isGraphDBRepository) {
                if ($licenseService.isLicenseValid()) {
                    $scope.reloadSimilarityIndexes();
                }
                loadSearchQueries();
            }
        }
    };

    const loadSearchQueries = () => {
        SimilarityRestService.getSearchQueries()
            .success((data) => $scope.searchQueries = data)
            .error((data) => toastr.error(getError(data), $translate.instant('similarity.could.not.get.search.queries.error')));
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


    const onSelectedRepositoryIdUpdated = (repositoryId) => {
        if (!repositoryId) {
            $scope.repositoryNamespaces = new NamespacesListModel();
            return;
        }
        RDF4JRepositoriesService.getNamespaces(repositoryId)
            .then((repositoryNamespaces) => {
                $scope.repositoryNamespaces = repositoryNamespaces;
            })
            .catch((error) => {
                const msg = getError(error);
                toastr.error(msg, $translate.instant('error.getting.namespaces.for.repo'));
            });
    };

    const onAutocompleteEnabledUpdated = (autocompleteEnabled) => {
        $scope.isAutocompleteEnabled = autocompleteEnabled;
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

    const destroyHandler = () => {
        removeAllListeners();
        if ($scope.loadSimilarityIndexesTimer) {
            $interval.cancel($scope.loadSimilarityIndexesTimer);
        }
    };

    // Deregister the watcher when the scope/directive is destroyed
    $scope.$on('$destroy', destroyHandler);

    const removeAllListeners = () => {
        subscriptions.forEach((subscription) => subscription());
    };

    subscriptions.push(WorkbenchContextService.onAutocompleteEnabledUpdated(onAutocompleteEnabledUpdated));
    subscriptions.push(ServiceProvider.get(RepositoryContextService).onSelectedRepositoryIdChanged(onSelectedRepositoryIdUpdated));

    const searchTypeChangeHandler = () => {
        $scope.empty = true;
    };

    subscriptions.push($scope.$watch('searchType', searchTypeChangeHandler));

    const getActiveRepositoryObjectHandler = (activeRepo) => {
        if (activeRepo) {
            init();
            activeRepositoryChangeHandler();
        }
    };

    // Wait until the active repository object is set, otherwise "canWriteActiveRepo()" may return a wrong result and the "ontotext-yasgui"
    // readOnly configuration may be incorrect.
    const activeRepositoryChangeHandler = $scope.$watch($scope.getActiveRepositoryObject, getActiveRepositoryObjectHandler);

    const buildSendData = (similarityIndex, uri, searchType, resultType, parameters) => {
        const sendData = {
            query: buildSparqlQuery($scope.lastSearch.type),
            $index: iriForQuery(PREFIX_INSTANCE + similarityIndex.name),
            $query: $scope.lastSearch.termOrSubject,
            $searchType: iriForQuery(($scope.selectedSimilarityIndex.isTextType() ? PREFIX : PREFIX_PREDICATION) + (SimilaritySearchType.isSearchEntityPredicateType(searchType) ? SimilaritySearchType.SEARCH_ENTITY : searchType)),
            $resultType: iriForQuery($scope.selectedSimilarityIndex.isTextType() ? PREFIX + resultType : PREFIX_PREDICATION + SimilarityResultType.ENTITY_RESULT),
            $parameters: literalForQuery(parameters)
        };

        if (SimilaritySearchType.isSearchEntityPredicateType(searchType)) {
            sendData.$psiPredicate = $scope.lastSearch.predicate ? iriForQuery($scope.lastSearch.predicate) : iriForQuery(ANY_PREDICATE);
        }

        if (SimilaritySearchType.isSearchAnalogicalType(searchType)) {
            $scope.searchSubject = uri;
            sendData.$givenSubject = iriForQuery($scope.analogicalSubject);
            sendData.$givenObject = iriForQuery($scope.analogicalObject);
            sendData.$searchSubject = iriForQuery(uri);
        }
        return sendData;
    };

    const updateLastSearch = (searchType, uri) => {
        $scope.lastSearch = new SimilaritySearch();
        $scope.lastSearch.type = searchType;

        if (SimilaritySearchType.isSearchEntityPredicateType(searchType)) {
            $scope.lastSearch.predicate = uri;
        }

        $scope.lastSearch.termOrSubject = buildTermOrSubject($scope.lastSearch.type, uri, $scope.psiSubject);
    };

    const buildSparqlQuery = (searchType) => {
        let sparqlQuery;
        if (SimilaritySearchType.isSearchAnalogicalType(searchType)) {
            sparqlQuery = ($scope.selectedSimilarityIndex.analogicalQuery) ? $scope.selectedSimilarityIndex.analogicalQuery : $scope.searchQueries['analogical'];
        } else {
            sparqlQuery = ($scope.selectedSimilarityIndex.searchQuery) ? $scope.selectedSimilarityIndex.searchQuery : $scope.searchQueries[$scope.selectedSimilarityIndex.type];
        }
        return sparqlQuery;
    };

    const buildTermOrSubject = (searchType, uri, psiSubject) => {
        // this is either the search term or the iri for the subject
        let termOrSubject = uri;

        if (SimilaritySearchType.isSearchEntityPredicateType(searchType)) {
            termOrSubject = psiSubject;
        }

        if (SimilaritySearchType.isSearchTermType(searchType)) {
            termOrSubject = literalForQuery(termOrSubject);
        } else {
            termOrSubject = iriForQuery(termOrSubject);
        }
        return termOrSubject;
    };

    const setSimilarityResponse = (response) => {
        $scope.yasguiConfig = {
            showEditorTabs: false,
            showToolbar: false,
            showResultTabs: false,
            showQueryButton: false,
            downloadAsOn: false,
            showResultInfo: false,
            componentId: 'similarity-list-component',
            maxPersistentResponseSize: 0,
            render: RenderingMode.YASR,
            sparqlResponse: response.data
        };
    };

}
