import 'angular/utils/notifications';
import 'angular/utils/local-storage-adapter';
import {mapIndexesResponseToSimilarityIndex} from "../../rest/mappers/similarity-index-mapper";
import {
    DISABLE_YASQE_BUTTONS_CONFIGURATION, INFERRED_AND_SAME_AS_BUTTONS_CONFIGURATION, YasguiComponentDirectiveUtil, YasqeButtonName,
} from "../../core/directives/yasgui-component/yasgui-component-directive.util";
import {RenderingMode} from "../../models/ontotext-yasgui/rendering-mode";
import {YasqeMode} from "../../models/ontotext-yasgui/yasqe-mode";
import {SimilarityViewMode} from "../../models/similarity/similarity-view-mode";
import {SimilarityQueryType} from "../../models/similarity/similarity-query-type";
import {SimilarityIndexType} from "../../models/similarity/similarity-index-type";
import {SimilarityIndexError} from "../../models/similarity/similarity-index-error";
import {QueryType} from "../../models/ontotext-yasgui/query-type";
import {SimilarityIndexInfo} from "../../models/similarity/similarity-index-info";

angular
    .module('graphdb.framework.similarity.controllers.create', [
        'graphdb.framework.utils.notifications',
        'graphdb.framework.utils.localstorageadapter'
    ])
    .controller('CreateSimilarityIdxCtrl', CreateSimilarityIdxCtrl);

CreateSimilarityIdxCtrl.$inject = ['$scope', 'toastr', '$uibModal', '$timeout', 'SimilarityRestService', 'SparqlRestService', '$location', 'productInfo', 'Notifications', 'RDF4JRepositoriesRestService', 'LocalStorageAdapter', 'LSKeys', '$translate', '$repositories'];

function CreateSimilarityIdxCtrl($scope, toastr, $uibModal, $timeout, SimilarityRestService, SparqlRestService, $location, productInfo, Notifications, RDF4JRepositoriesRestService, LocalStorageAdapter, LSKeys, $translate, $repositories) {

    /**
     * @type {ProductInfo}
     */
    $scope.info = productInfo;

    $scope.SimilarityViewMode = SimilarityViewMode;
    $scope.SimilarityQueryType = SimilarityQueryType;
    $scope.SimilarityIndexType = SimilarityIndexType;

    /**
     * @type {SimilarityIndexInfo}
     */
    $scope.similarityIndexInfo = undefined;
    $scope.searchQueries = undefined;
    $scope.allSamples = undefined;
    $scope.samples = undefined;
    $scope.usedPrefixes = undefined;
    $scope.viewMode = SimilarityViewMode.CREATE;
    $scope.yasguiConfig = undefined;
    $scope.isDirty = false;
    $scope.saveOrUpdateExecuted = false;
    // TODO update on repo change
    $scope.canEditActiveRepo = $scope.canWriteActiveRepo();
    $scope.helpHidden = LocalStorageAdapter.get(LSKeys.HIDE_SIMILARITY_HELP) === 1;

    const textDefaultOptions = '-termweight idf';
    const predDefaultOptions = '';

    // =========================
    // Public functions
    // =========================
    /**
     * Changes the similarity index type. ("Create text similarity index" or "Create predication index").
     *
     * @param {string} similarityIndexType - the new value of similarity index type. The value have to be one of {@link SimilarityIndexType}.
     * @param {string} similarityQueryType - the type of similarity query that have to be shown. Default value is data query.
     * The value have to be one of {@link SimilarityQueryType}.
     */
    $scope.changeSimilarityIndexType = (similarityIndexType, similarityQueryType = SimilarityQueryType.DATA) => {
        $scope.similarityIndexInfo.setType(similarityIndexType);
        if ($scope.similarityIndexInfo.isPredicationType()) {
            $scope.samples = $scope.allSamples[SimilarityIndexType.PREDICATION];
        } else {
            $scope.samples = $scope.allSamples[SimilarityIndexType.TEXT];
        }
        $scope.changeQueryTab(similarityQueryType);
        setDefaultQueries($scope.similarityIndexInfo);
        $scope.setEditorQuery($scope.similarityIndexInfo.getQuery());
    }

    /**
     * Changes the query tab. ("Data query", "Search query" or "Analogical query").
     *
     * @param {string} similarityQueryType - the type of query that have to be shown. The value have to be one of {@link SimilarityQueryType}.
     */
    $scope.changeQueryTab = (similarityQueryType) => {
        const oldSimilarityQueryType = $scope.similarityIndexInfo.getSelectedQueryType;
        if (oldSimilarityQueryType === similarityQueryType) {
            return;
        }
        $scope.similarityIndexInfo.setSelectedQueryType(similarityQueryType);
        updateQueryFromEditor($scope.similarityIndexInfo, oldSimilarityQueryType)
            .catch((error) => {
                if (!(error instanceof SimilarityIndexError)) {
                    console.log(error);
                }
            })
            .finally(() => {
                const ontotextYasgui = getOntotextYasgui();
                if ($scope.similarityIndexInfo.isDataQueryTypeSelected()) {
                    ontotextYasgui.showYasqeActionButton([YasqeButtonName.INFER_STATEMENTS, YasqeButtonName.EXPANDS_RESULTS]);
                    ontotextYasgui.changeRenderMode(RenderingMode.YASQE);
                } else {
                    ontotextYasgui.hideYasqeActionButton([YasqeButtonName.INFER_STATEMENTS, YasqeButtonName.EXPANDS_RESULTS]);
                }
                ontotextYasgui.setQuery($scope.similarityIndexInfo.getQuery());
            });
    }

    /**
     * Validates all similarity index data, and if everything is ok calls backend server to create an index.
     */
    $scope.createSimilarityIndex = () => {
        $scope.saveOrUpdateExecuted = true;
        updateQueryFromEditor($scope.similarityIndexInfo)
            .then(validateSimilarityIndex)
            .then(validateSimilarityIndexNameExistence)
            .then((similarityIndexInfo) => createIndex(similarityIndexInfo.getSimilarityIndex()))
            .catch((error) => {
                if (!(error instanceof SimilarityIndexError)) {
                    toastr.error(getError(error), $translate.instant('similarity.could.not.get.indexes.error'));
                }
            });
    };

    /**
     * Opens a modal dialog and displays the sparql query of currently selected index type query.
     */
    $scope.viewQuery = () => {
        updateQueryFromEditor($scope.similarityIndexInfo)
            .then(validateSimilarityIndex)
            .then(fetchSparqlQuery)
            .then(showSparqlQuery)
            .catch((error) => toastr.error(getError(error)));
    };

    /**
     * Executes the query.
     */
    $scope.preview = () => {
        updateQueryFromEditor($scope.similarityIndexInfo)
            .then(validateQueryType)
            .then(validateQuery)
            .then(() => {
                const ontotextYasgui = getOntotextYasgui();
                $scope.similarityIndexInfo.setSelectedYasguiRenderMode(RenderingMode.YASR);
                ontotextYasgui.changeRenderMode($scope.similarityIndexInfo.getSelectedYasguiRenderMode());
                ontotextYasgui.query();
            });
    }

    $scope.saveSearchQuery = function () {
        updateQueryFromEditor($scope.similarityIndexInfo)
            .then(validateSimilarityIndexName)
            .then(saveQuery)
            .then(notifySaveSuccess)
            .catch((error) => toastr.error(getError(error), $translate.instant('similarity.change.query.error')));
    };

    /**
     * Sets the <code>query</code> to the sparql editor.
     *
     * @param {string} query - a sparql query.
     */
    $scope.setEditorQuery = (query) => {
        if ($scope.yasguiConfig) {
            getOntotextYasgui().setQuery(query);
        } else {
            updateYasguiComponent({initialQuery: query});
        }
    }

    $scope.similarityIndexNameChanged = () => {
        $scope.setDirty();
        $scope.similarityIndexInfo.isNameExist = false;
    }

    $scope.queryChanged = () => {
        $scope.setDirty();
        $scope.similarityIndexInfo.markInvalidQuery(undefined, false);
        $scope.similarityIndexInfo.markInvalidQueryType(undefined, false);
    }

    $scope.isCloneViewMode = () => {
        return SimilarityViewMode.CLONE === $scope.viewMode;
    }

    $scope.isEditViewMode = () => {
        return SimilarityViewMode.EDIT === $scope.viewMode;
    }

    $scope.isCreateViewMode = () => {
        return SimilarityViewMode.CREATE === $scope.viewMode;
    }

    $scope.setDirty = () => {
        $scope.isDirty = true;
    };

    $scope.isYasqeShown = () => {
        return $scope.similarityIndexInfo && $scope.similarityIndexInfo.isYasqeRenderMode();
    }

    $scope.isYasrShown = () => {
        return $scope.similarityIndexInfo && $scope.similarityIndexInfo.isYasrRenderMode();
    }

    $scope.showEditor = () => {
        const ontotextYasgui = getOntotextYasgui();
        ontotextYasgui.abortQuery();
        ontotextYasgui.setQuery($scope.similarityIndexInfo.getQuery());
        $scope.similarityIndexInfo.setSelectedYasguiRenderMode(RenderingMode.YASQE);
        ontotextYasgui.changeRenderMode($scope.similarityIndexInfo.getSelectedYasguiRenderMode());
    };

    $scope.toggleHelp = (value) => {
        if (value === undefined) {
            value = LocalStorageAdapter.get(LSKeys.HIDE_SIMILARITY_HELP);
        }
        if (value !== 1) {
            LocalStorageAdapter.set(LSKeys.HIDE_SIMILARITY_HELP, 1);
            $scope.helpHidden = true;
        } else {
            LocalStorageAdapter.set(LSKeys.HIDE_SIMILARITY_HELP, 0);
            $scope.helpHidden = false;
        }
    };

    $scope.getCloseBtnMsg = function () {
        let operationType = $scope.editSearchQuery ? $translate.instant('similarity.query.edition.msg') : $translate.instant('similarity.index.creation.msg');
        return $translate.instant('similarity.close.btn.msg', {operation: operationType});
    }

    // =========================
    // Private functions
    // =========================
    /**
     * Initializes all view components.
     */
    const init = () => {
        getSimilarityIndex()
            .then((similarityIndexInfo) => {
                $scope.similarityIndexInfo = similarityIndexInfo;
                let initialQueryTab = SimilarityQueryType.DATA;
                if ($scope.isEditViewMode()) {
                    initialQueryTab = SimilarityQueryType.SEARCH;
                }
                $scope.changeSimilarityIndexType(similarityIndexInfo.getType(), initialQueryTab)
            });
    }

    /**
     * Validates the editor query and updates error statuses of <code>SimilarityIndexInfo</code>. Updates <code>SimilarityIndexInfo</code> query with editor one.
     *
     * @param {SimilarityIndexInfo} similarityIndexInfo - holds similarity index data (queries, sameAs, infer ...) and information about errors if any.
     * @param {string} similarityQueryType - the type of similarity query that have to be shown. If parameter is undefined then currently selected query type will be used.
     * The value have to be one of {@link SimilarityQueryType}.
     * @return {Promise<SimilarityIndexInfo>}
     */
    const updateQueryFromEditor = (similarityIndexInfo, similarityQueryType = undefined) => {
        return getOntotextYasgui().getQuery()
            .then((query) => similarityIndexInfo.setQuery(query, similarityQueryType))
            .then(() => similarityIndexInfo);
    }

    /**
     * Fetches the sparql query of currently chosen query type from the backed server.
     *
     * @param {SimilarityIndexInfo} similarityIndexInfo - holds similarity index data (queries, sameAs, infer ...) and information about errors if any.
     * @return {Promise<string>} the sparql query of currently chosen query type.
     */
    const fetchSparqlQuery = (similarityIndexInfo) => {
        return SimilarityRestService.getQuery({
            indexName: similarityIndexInfo.getName(),
            indexOptions: similarityIndexInfo.getOptions(),
            query: similarityIndexInfo.getQuery(),
            indexStopList: similarityIndexInfo.getStopList(),
            queryInference: similarityIndexInfo.getInference(),
            querySameAs: similarityIndexInfo.getSameAs(),
            viewType: similarityIndexInfo.getSelectedQueryType(),
            indexAnalyzer: similarityIndexInfo.getAnalyzer()
        }).then((response) => response.data);
    }

    /**
     * Shows a modal dialog that displays the <code>query</code>.
     *
     * @param {string} query which will be displayed.
     */
    const showSparqlQuery = (query) => {
        if (query) {
            $uibModal.open({
                templateUrl: 'pages/viewQuery.html',
                controller: 'ViewQueryCtrl',
                resolve: {
                    query: function () {
                        return query;
                    }
                }
            });
        }
    }

    const setDefaultQueries = (similarityIndexInfo) => {
        const similarityIndexType = similarityIndexInfo.getType();
        if (!$scope.isEditViewMode() && $scope.searchQueries) {
            similarityIndexInfo.setQuery($scope.searchQueries[similarityIndexType], SimilarityQueryType.SEARCH);
            similarityIndexInfo.setQuery($scope.searchQueries['analogical'], SimilarityQueryType.ANALOGICAL);
        }

        if ($scope.allSamples) {
            if (SimilarityIndexType.PREDICATION === similarityIndexType) {
                const allSampleElement = $scope.allSamples[SimilarityIndexType.PREDICATION]['predication'];
                similarityIndexInfo.setQuery(allSampleElement, SimilarityQueryType.DATA);
            } else {
                const allSampleElement1 = $scope.allSamples[SimilarityIndexType.TEXT]['literals'];
                similarityIndexInfo.setQuery(allSampleElement1, SimilarityQueryType.DATA);
            }
        }
    }

    /**
     * Initializes the similarity index info object with default values if view is opened for create or populates values from url if
     * view is opened for edit.
     *
     * @return {Promise<SimilarityIndexInfo>}
     */
    const getSimilarityIndex = () => {
        const similarityIndexInfo = new SimilarityIndexInfo();
        similarityIndexInfo.setName(getSimilarityIndexName());
        similarityIndexInfo.setType(getSimilarityType());
        similarityIndexInfo.setSelectedQueryType($scope.isEditViewMode() ? SimilarityQueryType.SEARCH : SimilarityQueryType.DATA);
        const options = $location.search().options;
        if (options) {
            similarityIndexInfo.options = options;
        } else {
            similarityIndexInfo.options = similarityIndexInfo.isTextType() ? textDefaultOptions : predDefaultOptions
        }

        setDefaultQueries(similarityIndexInfo);
        const searchQuery = $location.search().searchQuery;
        if (searchQuery) {
            similarityIndexInfo.setQuery(searchQuery, SimilarityQueryType.SEARCH);
        }


        const selectQuery = $location.search().selectQuery;
        if (selectQuery) {
            similarityIndexInfo.setQuery(selectQuery, SimilarityQueryType.DATA);
        }

        const analogicalQuery = $location.search().analogicalQuery;
        if (analogicalQuery) {
            similarityIndexInfo.setQuery(analogicalQuery, SimilarityQueryType.ANALOGICAL);
        }

        if (similarityIndexInfo.isTextType()) {
            similarityIndexInfo.setStopList($location.search().stopList)
            similarityIndexInfo.setAnalyzer($location.search().analyzer);
            const isLiteralIndex = getAndRemoveOption(similarityIndexInfo.getSimilarityIndex(), '-literal_index');
            if (isLiteralIndex !== undefined) {
                similarityIndexInfo.setLiteralIndex(isLiteralIndex);
            }
        }

        if (similarityIndexInfo.isPredicationType()) {
            return SimilarityRestService.getIndexes()
                .then((response) => {
                    const indexesNotInProgress = mapIndexesResponseToSimilarityIndex(response.data)
                        .filter((similarityIndex) => similarityIndex.isTextLiteralType() && (similarityIndex.isBuiltStatus() || similarityIndex.isOutdatedStatus()))
                        .map((similarityIndex) => similarityIndex.name);

                    $scope.literalIndexes = ['no-index'].concat(indexesNotInProgress);

                    if (similarityIndexInfo.getInputIndex() === undefined) {
                        const desiredIdx = getAndRemoveOption(similarityIndexInfo.getSimilarityIndex(), '-input_index');
                        if (desiredIdx !== undefined) {
                            for (let j = 0; j < $scope.literalIndexes.length; j++) {
                                if (desiredIdx === $scope.literalIndexes[j]) {
                                    similarityIndexInfo.setInputIndex($scope.literalIndexes[j]);
                                }
                            }
                        }
                    }
                    if (similarityIndexInfo.getInputIndex() === undefined) {
                        similarityIndexInfo.setInputIndex($scope.literalIndexes[0]);
                    }
                    return similarityIndexInfo;
                })
                .catch(function (error) {
                    const msg = getError(error);
                    toastr.error(msg, $translate.instant('similarity.could.not.get.indexes.error'));
                });
        }

        return Promise.resolve(similarityIndexInfo);
    }

    const updateYasguiComponent = (config) => {
        const defaultConfig = {
            endpoint: getQueryEndpoint(),
            componentId: 'create-index',
            showEditorTabs: false,
            showToolbar: false,
            showResultTabs: false,
            showYasqeActionButtons: false,
            showQueryButton: false,
            pageSize: 100,
            prefixes: $scope.usedPrefixes,
            render: $scope.similarityIndexInfo.getSelectedYasguiRenderMode(),
            yasqeActionButtons: $scope.isEditViewMode() || !$scope.similarityIndexInfo.isDataQueryTypeSelected() ? DISABLE_YASQE_BUTTONS_CONFIGURATION : INFERRED_AND_SAME_AS_BUTTONS_CONFIGURATION,
            maxPersistentResponseSize: 0,
            yasqeMode: $scope.canEditActiveRepo ? YasqeMode.WRITE : YasqeMode.PROTECTED,
        }

        const yasguiConfig = {}
        angular.extend(yasguiConfig, defaultConfig, config);
        $scope.yasguiConfig = yasguiConfig;
    }

    const getQueryEndpoint = () => {
        return `/repositories/${$repositories.getActiveRepository()}`;
    };

    /**
     * Call backend server to create a similarity index with data filled in <code>similarityIndexInfo</code>.
     *
     * @param {SimilarityIndex} similarityIndex - objects holds all needed data to create a similarity index.
     * @return {*}
     */
    const createIndex = (similarityIndex) => {
        if ($scope.literalIndexes !== undefined) {
            const inputIndex = similarityIndex.inputIndex;
            if (inputIndex !== $scope.literalIndexes[0]) {
                similarityIndex.options = similarityIndex.options + (similarityIndex.options === '' ? '' : ' ') + '-input_index' + ' ' + inputIndex;
            }
        }
        if (similarityIndex.isLiteralIndex === 'true') {
            similarityIndex.options = similarityIndex.options + (similarityIndex.options === '' ? '' : ' ') + '-literal_index' + ' true';
            similarityIndex.type = SimilarityIndexType.TEXT_LITERAL;
        }
        // TODO this can be very slowly, old implementation redirect to the indexes view before execute the query
        // ask the team if this have to be like old implementation or we can show a dialog that describes that creation of query is slow
        // and can take a time. We can ask tha user to stay on page or live it
        goToSimilarityIndexesView();
        return SimilarityRestService.createIndex('POST',
            similarityIndex.name,
            similarityIndex.options,
            similarityIndex.selectQuery,
            similarityIndex.searchQuery,
            similarityIndex.isPredicationType() ? similarityIndex.analogicalQuery : '',
            similarityIndex.stopList,
            similarityIndex.infer,
            similarityIndex.sameAs,
            similarityIndex.type,
            similarityIndex.analyzer)
            .then(() => {
                toastr.success($translate.instant('similarity.create.index.successfully'));
                return similarityIndex;
            })
            .catch(function (err) {
                const errorMessage = getError(err);
                toastr.error(errorMessage, $translate.instant('similarity.create.index.error'));
                console.log(errorMessage);
                return Promise.reject(new SimilarityIndexError('Could not create index.'));
            });
    }

    const notifySaveSuccess = async (isSearchQuery) => {
        await Notifications.showToastMessageWithDelay(isSearchQuery ? 'similarity.changed.search.query.msg' : 'similarity.changed.analogical.query.msg');
        $location.url('similarity');
    }
    const saveQuery = (similarityIndexInfo) => {
        const isSearchQuery = similarityIndexInfo.isSearchQueryTypeSelected();
        let data = {
            name: similarityIndexInfo.getSimilarityIndex().name,
            changedQuery: similarityIndexInfo.getQuery(),
            isSearchQuery
        };
        return SimilarityRestService.saveSearchQuery(JSON.stringify(data))
            .then(() => isSearchQuery)
    }

    const goToSimilarityIndexesView = () => {
        setTimeout(() => $location.url('similarity'), 100);
    }

    const getOntotextYasgui = () => {
        return YasguiComponentDirectiveUtil.getOntotextYasguiElement('#query-editor');
    };

    /**
     * Fetches similarity index name from url parameters. Adds clone prefix if view mode is in clone mode.
     *
     * @return {string}
     */
    const getSimilarityIndexName = () => {
        const indexNameFromLocation = $location.search().name || '';
        return $scope.isCloneViewMode() ? `${$translate.instant('similarity.copy_of.prefix')}_${indexNameFromLocation}` : indexNameFromLocation;
    };

    /**
     * Fetches similarity index type from url parameters if any. Default value is {@see SimilarityIndexType.TEXT}.
     *
     * @return {*|string}
     */
    const getSimilarityType = () => {
        const indexType = $location.search().type;
        if (indexType === undefined || indexType.startsWith('text')) {
            return SimilarityIndexType.TEXT;
        } else {
            return indexType;
        }
    }

    // TODO simplify
    const getAndRemoveOption = (similarityIndex, key) => {
        const optArr = similarityIndex.options.split(' ');
        for (let i = 0; i < optArr.length; i++) {
            if (optArr[i] === key && i + 1 < optArr.length) {
                const value = optArr[i + 1];

                delete optArr[i];
                delete optArr[i + 1];
                similarityIndex.options = optArr.join(' ');

                return value;
            }
        }
        return undefined;
    }

    /**
     * Calculates the view mode. The view mode can be any value of {@see SimilarityViewMode}.
     * @return {string}
     */
    const getViewMode = () => {
        if ($location.search().name === undefined) {
            return SimilarityViewMode.CREATE;
        }

        const editSearchQuery = $location.search().editSearchQuery;
        if (editSearchQuery === undefined) {
            return SimilarityViewMode.CLONE;
        }

        // Cast is needed because when view is opened from another view the type value is boolean but if
        // page is refreshed the value is boolean ("false" for example).
        // TODO: Check why this happened.
        if (typeof editSearchQuery === 'string') {
            return editSearchQuery === 'false' ? SimilarityViewMode.CLONE : SimilarityViewMode.EDIT;
        }

        return editSearchQuery ? SimilarityViewMode.EDIT : SimilarityViewMode.CLONE;
    }


    // =========================
    // Validation functions
    // =========================
    /**
     * Validates all similarity index data and updates the error fields of the similarityIndexInfo object according to the validations.
     *
     * @param {SimilarityIndexInfo} similarityIndexInfo - holds similarity index data (queries, sameAs, infer ...) and information about errors if any.
     * @return {Promise<SimilarityIndexInfo>}
     */
    const validateSimilarityIndex = (similarityIndexInfo) => {
        return Promise.all([validateSimilarityIndexName(similarityIndexInfo)
            .then(validateSelectQuery)
            .then(validateSearchQuery)
            .then(validateAnalogicalQuery)
            .then(validateQueryType)
            .then(validateQuery)])
            .then(() => similarityIndexInfo);
    }

    /**
     * Checks if typed similarity index name already exist.
     *
     * @param {SimilarityIndexInfo} similarityIndexInfo - holds similarity index data (queries, sameAs, infer ...) and information about errors if any.
     * @return {Promise<SimilarityIndexInfo>}
     * @throws {SimilarityIndexError} if similarity already exist.
     */
    const validateSimilarityIndexNameExistence = (similarityIndexInfo) => {
        return SimilarityRestService.getIndexes()
            .then((response) => {
                response.data.forEach((index) => {
                    if (index.name === similarityIndexInfo.getName()) {
                        similarityIndexInfo.isNameExist = true;
                        return Promise.reject(new SimilarityIndexError('Similarity index name exist.'))
                    }
                });
                return similarityIndexInfo
            });
    }

    /**
     * Check if similarity index name is filed and if is filled if it's value is correct.
     *
     * @param {SimilarityIndexInfo} similarityIndexInfo - holds similarity index data (queries, sameAs, infer ...) and information about errors if any.
     * @return {Promise<SimilarityIndexInfo>}
     * @throws {SimilarityIndexError} if similarity index name is empty, or it's name is not correct.
     */
    const validateSimilarityIndexName = (similarityIndexInfo) => {
        if (!similarityIndexInfo.getSimilarityIndex().name) {
            return Promise.reject(new SimilarityIndexError('Missing similarity name.'));
        }
        if (!similarityIndexInfo.isNameValid()) {
            return Promise.reject(new SimilarityIndexError('Invalid similarity name.'));
        }
        return Promise.resolve(similarityIndexInfo);
    }

    /**
     * Validates if similarity index select query exist.
     *
     * @param {SimilarityIndexInfo} similarityIndexInfo - holds similarity index data (queries, sameAs, infer ...) and information about errors if any.
     * @return {Promise<SimilarityIndexInfo>}
     * @throws {SimilarityIndexError} if select query is empty.
     */
    const validateSelectQuery = (similarityIndexInfo) => {
        if (!similarityIndexInfo.hasSelectQuery()) {
            similarityIndexInfo.markInvalidQuery(SimilarityQueryType.DATA);
            return Promise.reject(new SimilarityIndexError('Missing select query.'));
        }
        return Promise.resolve(similarityIndexInfo);
    }

    /**
     * Validates if similarity index search query exist.
     *
     * @param {SimilarityIndexInfo} similarityIndexInfo - holds similarity index data (queries, sameAs, infer ...) and information about errors if any.
     * @return {Promise<SimilarityIndexInfo>}
     * @throws {SimilarityIndexError} if search query is empty.
     */
    const validateSearchQuery = (similarityIndexInfo) => {
        if (!similarityIndexInfo.hasSearchQuery()) {
            similarityIndexInfo.markInvalidQuery(SimilarityQueryType.SEARCH);
            return Promise.reject(new SimilarityIndexError('Missing search query.'));
        }
        return Promise.resolve(similarityIndexInfo);
    }

    /**
     * Validates if analogical index search query exist.
     *
     * @param {SimilarityIndexInfo} similarityIndexInfo - holds similarity index data (queries, sameAs, infer ...) and information about errors if any.
     * @return {Promise<SimilarityIndexInfo>}
     * @throws {SimilarityIndexError} if analogical query is empty.
     */
    const validateAnalogicalQuery = (similarityIndexInfo) => {
        if (similarityIndexInfo.isPredicationType() && !similarityIndexInfo.hasAnalogicalQuery()) {
            similarityIndexInfo.markInvalidQuery(SimilarityQueryType.ANALOGICAL);
            return Promise.reject(new SimilarityIndexError('Missing analogical query.'));
        }
        return Promise.resolve(similarityIndexInfo);
    }

    /**
     * Checks if query mode is valid. The mode have to be "SELECT".
     *
     * @param {SimilarityIndexInfo} similarityIndexInfo - holds similarity index data (queries, sameAs, infer ...) and information about errors if any.
     * @return {Promise<SimilarityIndexInfo>}
     * @throws {SimilarityIndexError} if query type is not ot type "SELECT".
     */
    const validateQueryType = (similarityIndexInfo) => {
        return getOntotextYasgui().getQueryType()
            .then((queryType) => {
                if (QueryType.SELECT !== queryType) {
                    similarityIndexInfo.markInvalidQueryType();
                    return Promise.reject(new SimilarityIndexError('Query type is not valid.'));
                } else {
                    similarityIndexInfo.markInvalidQueryType(undefined, false);
                }
                return similarityIndexInfo;
            });
    };

    /**
     * Checks if query is valid.
     *
     * @param {SimilarityIndexInfo} similarityIndexInfo - holds similarity index data (queries, sameAs, infer ...) and information about errors if any.
     * @return {Promise<SimilarityIndexInfo>}
     * @throws {SimilarityIndexError} if query is not valid.
     */
    const validateQuery = (similarityIndexInfo) => {
        return getOntotextYasgui().isQueryValid()
            .then((valid) => {
                if (!valid) {
                    similarityIndexInfo.markInvalidQuery();
                    return Promise.reject(new SimilarityIndexError('Query is not valid.'));
                } else {
                    similarityIndexInfo.markInvalidQuery(undefined, false);
                }
                return similarityIndexInfo;
            });
    };

    $scope.viewMode = getViewMode();

    // Wait until the active repository object is set, otherwise "canWriteActiveRepo()" may return a wrong result and the "ontotext-yasgui"
    // readOnly configuration may be incorrect.
    const repoIsInitialized = $scope.$watch(function () {
        return $scope.getActiveRepositoryObject();
    }, function (activeRepo) {
        if (activeRepo) {
            Promise.all([SimilarityRestService.getSearchQueries(), SimilarityRestService.getSamples(), $repositories.getPrefixes(activeRepo.id)])
                .then(([searchQueries, samples, usedPrefixes]) => {
                    $scope.canEditActiveRepo = $scope.canWriteActiveRepo();
                    $scope.searchQueries = searchQueries ? searchQueries.data : [];
                    $scope.allSamples = samples ? samples.data : [];
                    $scope.usedPrefixes = usedPrefixes;
                    init();
                }).catch((error) => {
                console.log(error)
                $scope.repositoryError = getError(error);
            }).finally(() => {
                repoIsInitialized();
            });
        }
    });
}
