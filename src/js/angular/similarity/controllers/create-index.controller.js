import 'angular/utils/notifications';
import 'angular/utils/local-storage-adapter';

angular
    .module('graphdb.framework.similarity.controllers.create', [
        'graphdb.framework.utils.notifications',
        'graphdb.framework.utils.localstorageadapter'
    ])
    .controller('CreateSimilarityIdxCtrl', CreateSimilarityIdxCtrl);

CreateSimilarityIdxCtrl.$inject = ['$scope', 'toastr', '$uibModal', '$timeout', 'SimilarityRestService', 'SparqlRestService', '$location', 'productInfo', 'Notifications', 'RDF4JRepositoriesRestService', 'LocalStorageAdapter', 'LSKeys', '$translate', '$repositories'];

function CreateSimilarityIdxCtrl($scope, toastr, $uibModal, $timeout, SimilarityRestService, SparqlRestService, $location, productInfo, Notifications, RDF4JRepositoriesRestService, LocalStorageAdapter, LSKeys, $translate, $repositories) {

    $scope.newIndex = {};
    $scope.info = productInfo;
    $scope.page = 1;
    $scope.helpHidden = LocalStorageAdapter.get(LSKeys.HIDE_SIMILARITY_HELP) === 1;
    $scope.queryExists = false;
    $scope.orientationViewMode = true;

    const defaultTabConfig = {
        id: '1',
        name: '',
        query: '',
        inference: true,
        sameAs: true
    };
    $scope.tabsData = $scope.tabs = [defaultTabConfig];
    $scope.currentQuery = _.cloneDeep(defaultTabConfig);
    // $scope.state = {};
    $scope.showSampleQueries = false;
    $scope.savedQuery = {};
    $scope.sampleQueries = {};

    const textDefaultOptions = '-termweight idf';
    const predDefaultOptions = '';
    const filenamePattern = new RegExp('^[a-zA-Z0-9-_]+$');

    // =========================
    // Public functions
    // =========================
    $scope.viewQuery = () => {
        if (!validateIndex()) {
            return;
        }

        SimilarityRestService.getQuery({
            indexName: $scope.newIndex.name,
            indexOptions: $scope.newIndex.options,
            query: $scope.currentQuery.query,
            indexStopList: $scope.newIndex.stopList,
            queryInference: $scope.currentQuery.inference,
            querySameAs: $scope.currentQuery.sameAs,
            viewType: $scope.viewType,
            indexAnalyzer: $scope.newIndex.analyzer
        }).success(function (query) {
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
        }).error(function (error) {
            const msg = getError(error);
            toastr.error(msg);
        });
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

    $scope.saveQueries = () => {
        // save the current query
        const query = window.editor.getValue().trim();
        if ($scope.page === 1) {
            $scope.newIndex.query = query;
        } else if ($scope.page === 2) {
            $scope.newIndex.searchQuery = query;
        } else if ($scope.page === 3) {
            $scope.newIndex.analogicalQuery = query;
        }
    };

    $scope.goToPage = (page) => {
        // ugly fix for GDB-3099
        if (page !== 1 && $scope.viewMode !== 'yasr') {
            $scope.showEditor();
            $timeout(function () {
                if (page === 2) {
                    $scope.currentQuery.query = $scope.newIndex.searchQuery;
                }
                if (page === 3) {
                    $scope.currentQuery.query = $scope.newIndex.analogicalQuery;
                }

                window.editor.setValue($scope.currentQuery.query || ' ');
            });
        }

        $scope.saveQueries();
        // get the saved query
        if (page === 1) {
            $scope.currentQuery.query = $scope.newIndex.query;
        } else if (page === 2) {
            $scope.currentQuery.query = $scope.newIndex.searchQuery;
        } else if (page === 3) {
            $scope.currentQuery.query = $scope.newIndex.analogicalQuery;
        }

        $scope.loadTab();
        $scope.notoolbar = page !== 1;

        $scope.page = page;
    };

    $scope.createIndex = () => {
        if (!validateIndex()) {
            return;
        }
        // Check existing indexes
        SimilarityRestService.getIndexes()
            .success(function (data) {
                data.forEach(function (index) {
                    if (index.name === $scope.newIndex.name) {
                        $scope.invalidIndexName = $translate.instant('similarity.existing.index.name.error');
                    }
                });
                if (!$scope.invalidIndexName) {
                    let indexType = $scope.viewType;

                    if ($scope.literalIndexes !== undefined) {
                        const inputIndex = $scope.newIndex.inputIndex;
                        if (inputIndex !== $scope.literalIndexes[0]) {
                            appendOption('-input_index', inputIndex);
                        }
                    }
                    if ($scope.newIndex.isLiteralIndex === 'true') {
                        appendOption('-literal_index', 'true');
                        indexType = 'textLiteral';
                    }

                    SimilarityRestService.createIndex('POST',
                        $scope.newIndex.name,
                        $scope.newIndex.options,
                        $scope.newIndex.query,
                        $scope.newIndex.searchQuery,
                        $scope.newIndex.analogicalQuery,
                        $scope.newIndex.stopList,
                        $scope.currentQuery.inference,
                        $scope.currentQuery.sameAs,
                        indexType,
                        $scope.newIndex.analyzer)
                        .error(function (err) {
                            toastr.error(getError(err), $translate.instant('similarity.create.index.error'));
                        });
                    $location.url('similarity');
                }

            })
            .error((error) => {
                const msg = getError(error);
                toastr.error(msg, $translate.instant('similarity.could.not.get.indexes.error'));
            });
    };

    $scope.setViewType = (viewType) => {
        $scope.viewType = viewType;
    }

    // ============================================
    // Yasqe Ysr setup public functions and setups
    // ============================================

    // Called when user clicks on a sample query
    $scope.setQuery = (query) => {
        // Hack for YASQE bug
        window.editor.setValue(query ? query : ' ');
    };

    // TODO don't copy paste each time, this is the same as in the graph config
    // DOWN HERE WE KEEP EVERYTHING PURELY QUERY EDITOR (MOSTLY BORROWED FROM query-editor.controller.js)

    $scope.showEditor = () => {
        if (window.editor.xhr) {
            window.editor.xhr.abort();
        }
        $scope.viewMode = 'yasr';
    };

    $scope.showPreview = () => {
        // For some reason YASR gets confused and sets this to rawResponse
        // if we execute a CONSTRUCT and then a SELECT. This makes sure it's always table.
        $scope.currentQuery.outputType = 'table';
        $scope.runQuery();
    };

    $scope.resetCurrentTabConfig = () => {
        $scope.currentTabConfig = {
            pageSize: 100, // page limit 100 as this is only used for preview
            page: 1,
            allResultsCount: 0,
            resultsCount: 0
        };
    };

    // query tab operations
    $scope.saveTab = (id) => {
        const idx = findTabIndexByID(id);
        // Tab was deleted, don't try to save it's state
        if (idx === undefined) {
            return {};
        }
        const tab = $scope.tabsData[idx];
        //tab.query = window.editor.getValue();
        $scope.saveQueryToLocal(tab);
        return tab;
    };

    $scope.loadTab = () => {
        $scope.tabsData = [$scope.currentQuery];

        const tab = $scope.currentQuery;

        if ($scope.currentQuery.query === null || $scope.currentQuery.query === '') {
            // hack for YASQE bug
            window.editor.setValue(' ');
        } else {
            window.editor.setValue($scope.currentQuery.query || ' ');
        }

        $timeout(function () {
            $scope.currentTabConfig = {};
            $scope.currentTabConfig.queryType = tab.queryType;
            $scope.currentTabConfig.resultsCount = tab.resultsCount;

            $scope.currentTabConfig.offset = tab.offset;
            $scope.currentTabConfig.allResultsCount = tab.allResultsCount;
            $scope.currentTabConfig.page = tab.page;
            $scope.currentTabConfig.pageSize = tab.pageSize;

            $scope.currentTabConfig.timeFinished = tab.timeFinished;
            $scope.currentTabConfig.timeTook = tab.timeTook;
            $scope.currentTabConfig.sizeDelta = tab.sizeDelta;
            $scope.$apply();
        }, 0);

        //Remove paddign of yasr so it will be aligned with sparql editor
        $('#yasr').css('padding', '0');
    };


    $scope.addNewTab = (callback, tabName, savedQuery) => {
    };

    // query operations
    // start of query operations
    $scope.runQuery = (changePage, explain) => {
        $scope.executedQueryTab = $scope.currentQuery;
        if (window.editor.getQueryType() !== 'SELECT') {
            toastr.error($translate.instant('similarity.indexes.select.queries.constraint'));
            return;
        }
        if (explain && window.editor.getQueryType() !== 'SELECT') {
            toastr.warning($translate.instant('similarity.explain.select.queries.constraint'));
            return;
        }

        if (window.editor.getQueryMode() === 'update') {
            toastr.warning($translate.instant('cannot.execute.update.error'));
            return;
        }

        $scope.explainRequested = explain;
        if (!$scope.queryIsRunning) {
            if (changePage) {
                $scope.currentTabConfig.resultsCount = 0;
            } else {
                $scope.resetCurrentTabConfig();
            }

            // Hides the editor and shows the yasr results
            $scope.viewMode = 'editor';
            if ($scope.orientationViewMode) {
                $scope.fixSizesOnHorizontalViewModeSwitch();
            }

            $scope.setLoader(true, $translate.instant('evaluating.query.msg'));
            window.editor.query();
        }
    };

    // FIXME: this is copy-pasted in graphs-config.controller.js and query-editor.controller.js. Find a way to avoid duplications
    $scope.getNamespaces = () => {
        // Signals the namespaces are to be fetched => loader will be shown
        $scope.setLoader(true, $translate.instant('common.refreshing.namespaces'), $translate.instant('common.extra.message'));
        RDF4JRepositoriesRestService.getRepositoryNamespaces($repositories.getActiveRepository())
            .success(function (data) {
                const usedPrefixes = {};
                data.results.bindings.forEach(function (e) {
                    usedPrefixes[e.prefix.value] = e.namespace.value;
                });
                $scope.namespaces = usedPrefixes;
            })
            .error(function (data) {
                $scope.repositoryError = getError(data);
            })
            .finally(function () {
                // Signals namespaces were fetched => loader will be hidden
                $scope.setLoader(false);
            });
    }

    $scope.changePagination = () => runQuery(true, $scope.explainRequested);

    $scope.toggleSampleQueries = () => {
    };

    // Add known prefixes
    $scope.addKnownPrefixes = () => {
        SparqlRestService.addKnownPrefixes(JSON.stringify(window.editor.getValue()))
            .success(function (data) {
                if (angular.isDefined(window.editor) && angular.isDefined(data) && data !== window.editor.getValue()) {
                    window.editor.setValue(data);
                }
            })
            .error(function (data) {
                const msg = getError(data);
                toastr.error(msg, $translate.instant('common.add.known.prefixes.error'));
                return true;
            });
    };

    $scope.getExistingTabId = (query) => {
        let existingTabId = undefined;
        angular.forEach($scope.tabsData, function (item) {
            if (item.name === query.name && item.query === query.body) {
                existingTabId = item.id;
                return item;
            }
        });

        return existingTabId;
    };

    $scope.querySelected = (query) => {
        const tabId = $scope.getExistingTabId(query);
        $scope.toggleSampleQueries();
        if (!angular.isDefined(tabId)) {
            $scope.addNewTab(null, query.name, query.body);
        } else {
            selectTab(tabId);
        }
    };

    $scope.saveQueryToLocal = (currentQueryTab) => {
    };

    $scope.getLoaderMessage = () => {
        const timeSeconds = (Date.now() - $scope.queryStartTime) / 1000;
        const timeHuman = $scope.getHumanReadableSeconds(timeSeconds);
        let message = '';

        if ($scope.progressMessage) {
            message = $scope.progressMessage + '... ' + timeHuman;
        } else {
            message = $translate.instant('common.running.operation', {timeHuman: timeHuman});
        }
        if ($scope.extraMessage && timeSeconds > 10) {
            message += '\n' + $scope.extraMessage;
        }

        return message;
    };

    // query editor and results orientation
    $scope.fixSizesOnHorizontalViewModeSwitch = (verticalViewParam) => {
        function visibleWindowHeight() {
            return window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight || 0;
        }

        const verticalView = verticalViewParam;
        if (!$scope.orientationViewMode) {
            $scope.noPadding = {paddingRight: 15, paddingLeft: 0};

            // window.editor is undefined if no repo is selected
            if (window.editor && document.querySelector('.CodeMirror-wrap')) {
                let newHeight = visibleWindowHeight() - (document.querySelector('.CodeMirror-wrap').getBoundingClientRect().top);
                newHeight -= 40;
                document.querySelector('.CodeMirror-wrap').style.height = newHeight + 'px';
                document.getElementById('yasr').style.minHeight = newHeight + 'px';
                //window.editor.refresh();
            } else {
                let timer;
                if (verticalView) {
                    timer = $timeout(function () {
                        $scope.fixSizesOnHorizontalViewModeSwitch(verticalView);
                    }, 100);
                } else {
                    timer = $timeout($scope.fixSizesOnHorizontalViewModeSwitch, 100);
                }

                $scope.$on('$destroy', function () {
                    $timeout.cancel(timer);
                });
            }
        } else {
            if ($scope.viewMode === 'yasr') {
                let newHeight = visibleWindowHeight() - (document.querySelector('.CodeMirror-wrap').getBoundingClientRect().top);
                newHeight -= 40;
                document.querySelector('.CodeMirror-wrap').style.height = newHeight + 'px';
            } else {
                $scope.noPadding = {};
                document.querySelector('.CodeMirror-wrap').style.height = '';
            }
            document.getElementById('yasr').style.minHeight = '';
        }
        if (window.yasr && window.yasr.container) {
            $timeout(function () {
                window.yasr.container.resize();
            }, 100);
        }
    };
    $scope.changeViewMode = (tabID) => {
        $scope.viewMode = 'none';
        $scope.orientationViewMode = !$scope.orientationViewMode;
        $scope.fixSizesOnHorizontalViewModeSwitch();
        $('.dataTables_filter').remove();
        $('.resultsTable').remove();
        $timeout(function () {
            $scope.loadTab();
            selectTab(tabID);
        }, 100);
    };
    $scope.showHideEditor = () => $scope.fixSizesOnHorizontalViewModeSwitch(true);
    $scope.focusQueryEditor = () => {
        if (!angular.element(document).find('.editable-input').is(':focus')) {
            angular.element(document).find('.CodeMirror textarea:first-child').focus();
        }
    };


    $scope.getResultsDescription = function () {
    };

    $scope.getUpdateDescription = function () {
    };

    $scope.getStaleWarningMessage = function () {
    };

    $scope.saveSearchQuery = function () {
        // Should validate that query is SELECT
        if (window.editor.getQueryType() !== 'SELECT') {
            toastr.error($translate.instant('similarity.index.select.queries.constraint'));
            return;
        }
        let data = {
            name: $scope.newIndex.name,
            changedQuery: $scope.currentQuery.query,
            isSearchQuery: $scope.page === 2
        };

        return SimilarityRestService.saveSearchQuery(JSON.stringify(data))
            .then(async function () {
                await Notifications.showToastMessageWithDelay($scope.page === 2 ? 'similarity.changed.search.query.msg' : 'similarity.changed.analogical.query.msg');
                $location.url('similarity');
            }, function (response) {
                toastr.error(getError(response), $translate.instant('similarity.change.query.error'));
            });
    };

    $scope.getCloseBtnMsg = function () {
        let operationType = $scope.editSearchQuery ? $translate.instant('similarity.query.edition.msg') : $translate.instant('similarity.index.creation.msg');
        return $translate.instant('similarity.close.btn.msg', {operation: operationType});
    }

    $scope.setLoader = (isRunning, progressMessage, extraMessage) => {
        const yasrInnerContainer = angular.element(document.getElementById('yasr-inner'));
        $scope.queryIsRunning = isRunning;
        if (isRunning) {
            $scope.queryStartTime = Date.now();
            $scope.countTimeouted = false;
            $scope.progressMessage = progressMessage;
            $scope.extraMessage = extraMessage;
            yasrInnerContainer.addClass('hide');
        } else {
            $scope.progressMessage = '';
            $scope.extraMessage = '';
            yasrInnerContainer.removeClass('hide');
        }
        // We might call this from angular or outside angular so take care of applying the scope.
        if ($scope.$$phase === null) {
            $scope.$apply();
        }
    };

    // =========================
    // Private functions
    // =========================
    const getViewType = () => {
        const indexType = $location.search().type;
        if (indexType === undefined || indexType.startsWith('text')) {
            return 'text';
        } else {
            return indexType;
        }
    }
    const getNewIndexName = (indexNameFromLocation) => {
        if (indexNameFromLocation) {
            if ($scope.page !== 1) {
                return indexNameFromLocation;
            } else {
                return 'Copy_of_' + indexNameFromLocation;
            }
        }
        return '';
    };

    const initForViewType = () => {
        $scope.editSearchQuery = $location.search().editSearchQuery;
        $scope.page = $scope.editSearchQuery ? 2 : 1;
        $scope.newIndex.name = getNewIndexName($location.search().name);
        $scope.newIndex.options = ($location.search().options ? $location.search().options : ($scope.viewType === "text") ? textDefaultOptions : predDefaultOptions);

        if ($scope.searchQueries) {
            $scope.newIndex.searchQuery = $location.search().searchQuery ? $location.search().searchQuery : $scope.searchQueries[$scope.viewType];
            if ($scope.viewType === 'predication') {
                $scope.newIndex.analogicalQuery = $location.search().analogicalQuery ? $location.search().analogicalQuery : $scope.searchQueries['analogical'];
            }
        }

        if ($scope.editSearchQuery) {
            // Default will be opened search query tab for edition
            $scope.currentQuery.query = $scope.newIndex.searchQuery;
            $scope.notoolbarInference = true;
            $scope.notoolbarSameAs = true;
            if (window.editor) {
                $scope.setQuery($scope.newIndex.searchQuery);
            }
        } else {
            if ($scope.viewType === 'text' && $scope.allSamples) {
                $scope.samples = $scope.allSamples['text'];
                $scope.newIndex.stopList = ($location.search().stopList ? $location.search().stopList : undefined);
                $scope.newIndex.analyzer = ($location.search().analyzer ? $location.search().analyzer : 'org.apache.lucene.analysis.en.EnglishAnalyzer');
                const isLiteralIndex = getAndRemoveOption('-literal_index');
                if (isLiteralIndex !== undefined) {
                    $scope.newIndex.isLiteralIndex = isLiteralIndex;
                }
                if (window.editor) {
                    $scope.setQuery($scope.samples['literals']);
                }
            }
            if ($scope.viewType === 'predication' && $scope.allSamples) {
                SimilarityRestService.getIndexes()
                    .success(function (data) {
                        $scope.literalIndexes = ['no-index'].concat(data
                            .filter(function (idx) {
                                return idx.type === 'textLiteral' && (idx.status === 'BUILT' || idx.status === 'OUTDATED')
                            })
                            .map(function (idx) {
                                return idx.name;
                            }));

                        if ($scope.newIndex.inputIndex === undefined) {
                            const desiredIdx = getAndRemoveOption('-input_index');
                            if (desiredIdx !== undefined) {
                                for (let j = 0; j < $scope.literalIndexes.length; j++) {
                                    if (desiredIdx === $scope.literalIndexes[j]) {
                                        $scope.newIndex.inputIndex = $scope.literalIndexes[j];
                                    }
                                }
                            }
                        }
                        if ($scope.newIndex.inputIndex === undefined) {
                            $scope.newIndex.inputIndex = $scope.literalIndexes[0];
                        }
                    })
                    .error(function (data) {
                        const msg = getError(data);
                        toastr.error(msg, $translate.instant('similarity.could.not.get.indexes.error'));
                    });

                $scope.samples = $scope.allSamples['predication'];
                if (window.editor) {
                    $scope.setQuery($scope.samples['predication']);
                }
            }
        }
    };

    const validateIndex = () => {
        $scope.invalidIndexName = false;
        $scope.saveQueries();
        if (!$scope.newIndex.name) {
            $scope.invalidIndexName = $translate.instant('similarity.empty.index.name.error');
            return false;
        }
        if (!filenamePattern.test($scope.newIndex.name)) {
            $scope.invalidIndexName = $translate.instant('similarity.index.name.constraint');
            return false;
        }

        if (!$scope.newIndex.query) {
            toastr.error($translate.instant('similarity.empty.select.query.error'));
            return false;
        }

        if (!$scope.newIndex.searchQuery) {
            toastr.error($translate.instant('similarity.empty.search.query.error'));
            return false;
        }

        if ($scope.viewType === 'predication' && !$scope.newIndex.analogicalQuery) {
            toastr.error($translate.instant('similarity.empty.analogical.query.error'));
            return false;
        }

        if (window.editor.getQueryType() !== 'SELECT') {
            toastr.error($translate.instant('similarity.index.select.queries.constraint'));
            return;
        }

        return true;
    };

    const appendOption = (option, value) => {
        $scope.newIndex.options = $scope.newIndex.options + ($scope.newIndex.options === '' ? '' : ' ') + option + ' ' + value;
    };

    const getAndRemoveOption = (key) => {
        const optArr = $scope.newIndex.options.split(' ');
        for (let i = 0; i < optArr.length; i++) {
            if (optArr[i] === key && i + 1 < optArr.length) {
                const value = optArr[i + 1];

                delete optArr[i];
                delete optArr[i + 1];
                $scope.newIndex.options = optArr.join(' ');

                return value;
            }
        }
        return undefined;
    }

    const selectTab = (id) => {
        $timeout(function () {
            $('a[data-id = "' + id + '"]').tab('show');
        }, 0);
    }

    const findTabIndexByID = (id) => {
        for (let i = 0; i < $scope.tabsData.length; i++) {
            const tab = $scope.tabsData[i];
            if (tab.id === id) {
                return i;
            }
        }
    }

    const getQueryID = (element) => {
        return $(element).attr('data-id');
    }

    // =========================
    // Event handlers
    // =========================
    $scope.$watch('viewType', function () {
        initForViewType();
    });

    $scope.$watch('newIndex.name', function () {
        $scope.isInvalidIndexName = false;
        $scope.isEmptyIndexName = false;
    });

    $scope.$on('$destroy', function () {
        window.editor = null;
        window.yasr = null;
    });

    $('textarea').on('paste', function () {
        $timeout(function () {
            $scope.addKnownPrefixes();
        }, 0);
    });

    $scope.$watchCollection('[currentQuery.inference, currentQuery.sameAs]', function () {
        $scope.saveQueryToLocal($scope.currentQuery);
    });

    $scope.$on('tabAction', function (e, tabEvent) {
        if (tabEvent.relatedTarget) {
            $scope.saveTab(getQueryID(tabEvent.relatedTarget));
        }
        $scope.loadTab(getQueryID(tabEvent.target));
    });

    $scope.$on('deleteAllexeptSelected', function (e, tabs) {
        $scope.tabsData = tabs;
        $scope.tabs = tabs;
    });

    ////////////////////////////////////////////////////////////////


    $scope.viewType = getViewType();


    SimilarityRestService.getSearchQueries()
        .success((data) => {
            $scope.searchQueries = data;
            SimilarityRestService.getSamples().success(function (samples) {
                defaultTabConfig.query = $location.search().selectQuery ? $location.search().selectQuery : samples['text']['literals'];
                defaultTabConfig.inference = !($location.search().infer === 'false');
                defaultTabConfig.sameAs = !($location.search().sameAs === 'false');
                $scope.tabsData = $scope.tabs = [defaultTabConfig];
                $scope.currentQuery = _.cloneDeep(defaultTabConfig);
                $scope.allSamples = samples;
                initForViewType();
            });
        }).error((data) => {
        const msg = getError(data);
        toastr.error(msg, $translate.instant('similarity.could.not.get.search.queries.error'));
    });

    $scope.resetCurrentTabConfig();

    if (!$scope.orientationViewMode) {
        $scope.showHideEditor();
    }

    if ($scope.getActiveRepository()) {
        $scope.getNamespaces();
    }
}
