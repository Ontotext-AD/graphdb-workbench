import 'angular/utils/notifications';
import 'angular/utils/local-storage-adapter';

angular
    .module('graphdb.framework.graphexplore.controllers.graphviz.config', [
        'graphdb.framework.utils.notifications',
        'graphdb.framework.utils.localstorageadapter'
    ])
    .controller('GraphConfigCtrl', GraphConfigCtrl);

GraphConfigCtrl.$inject = ['$scope', '$timeout', '$location', 'toastr', '$repositories', 'SparqlRestService', '$filter', 'GraphConfigRestService', 'AutocompleteRestService', '$routeParams', 'Notifications', 'RDF4JRepositoriesRestService', 'LocalStorageAdapter', 'LSKeys', '$translate'];

function GraphConfigCtrl($scope, $timeout, $location, toastr, $repositories, SparqlRestService, $filter, GraphConfigRestService, AutocompleteRestService, $routeParams, Notifications, RDF4JRepositoriesRestService, LocalStorageAdapter, LSKeys, $translate) {

    $scope.page = 1;
    $scope.totalPages = 5;

    $scope.helpHidden = LocalStorageAdapter.get(LSKeys.HIDE_GRAPH_CONFIG_HELP) === 1;

    $scope.toggleHelp = function (value) {
        if (value === undefined) {
            value = LocalStorageAdapter.get(LSKeys.HIDE_GRAPH_CONFIG_HELP);
        }
        if (value !== 1) {
            LocalStorageAdapter.set(LSKeys.HIDE_GRAPH_CONFIG_HELP, 1);
            $scope.helpHidden = true;
        } else {
            LocalStorageAdapter.set(LSKeys.HIDE_GRAPH_CONFIG_HELP, 0);
            $scope.helpHidden = false;
        }
    };

    var selectedFixedNodeChanged;
    $scope.fixedVisualCallback = function (uri, label) {
        $scope.newConfig.startIRI = uri;
        $scope.newConfig.startIRILabel = label;
        selectedFixedNodeChanged = true;
    };

    $scope.isDefaultGraph = function (sample) {
        return (sample.name === 'Minimal' || sample.name === 'Advanced');
    };

    $scope.isUserGraph = function (sample) {
        return !$scope.isDefaultGraph(sample);
    };

    $scope.getSampleName = function (sample, property) {
        const extra = sample[property + 'Description'];
        if (extra) {
            // Sample has description, use it
            return extra;
        } else {
            // Sample is a copy of existing config, prepend Copy of to name
            return sample.id ? 'Copy of ' + sample.name : sample.name;
        }
    };

    const getGraphConfigSamples = function () {
        GraphConfigRestService.getGraphConfigSamples()
            .success(function (data) {
                $scope.samples = _.filter(data, function (s) {
                    // Skip the currently edited config from samples and store it into a revert variable
                    if (!s.id || $scope.newConfig.id !== s.id) {
                        return true;
                    } else {
                        $scope.revertConfig = s;
                        return false;
                    }
                });
            }).error(function (data) {
                toastr.error(getError(data), $translate.instant('graphexplore.error.graph.configs'));
            });
    };

    const configName = $routeParams.configName;
    $scope.newConfig = {startQueryIncludeInferred: true, startQuerySameAs: true};
    $scope.newConfig.startMode = 'search';
    $scope.isUpdate = false;
    $scope.shared = false;

    $scope.encodeQuery = function (query) {
        return encodeURIComponent(query);
    };

    function showInvalidMsg(message) {
        toastr.warning(message);
    }

    if (configName) {
        $scope.isUpdate = true;
        GraphConfigRestService.getConfig(configName)
            .success(function (data) {
                $scope.newConfig = data;
                initForConfig();
            })
            .error(function (data) {
                toastr.error(getError(data), $translate.instant('created.connector', {name: configName}));
            });
    } else {
        $scope.isUpdate = false;
        initForConfig();
    }

    function getQueryForCurrentPage(config) {
        let query;

        if (config.startMode === 'query' && $scope.page === 1) {
            query = config.startGraphQuery;
        } else if ($scope.page === 2) {
            query = config.expandQuery;
        } else if ($scope.page === 3) {
            query = config.resourceQuery;
        } else if ($scope.page === 4) {
            query = config.predicateLabelQuery;
        } else if ($scope.page === 5) {
            query = config.resourcePropertiesQuery;
        }

        return angular.isDefined(query) ? query : '';
    }

    function initForConfig() {
        getGraphConfigSamples();
        $scope.createGraphConfig = function () {
            GraphConfigRestService.createGraphConfig($scope.newConfig)
                .success(async function () {
                    await Notifications.showToastMessageWithDelay('graphexplore.saved.new.config');
                    $location.url('graphs-visualizations');
                }).error(function (data) {
                toastr.error(getError(data), $translate.instant('graphexplore.error.could.not.create'));
            });
        };

        $scope.updateGraphConfig = function () {
            GraphConfigRestService.updateGraphConfig($scope.newConfig)
                .success(async function () {
                    await Notifications.showToastMessageWithDelay('graphexplore.saved.config');
                    $location.url('graphs-visualizations');
                }).error(function (data) {
                toastr.error(getError(data), $translate.instant('graphexplore.error.could.not.save'));
            });
        };

        function checkAutocompleteStatus() {
            $scope.getAutocompletePromise = AutocompleteRestService.checkAutocompleteStatus();
        }

        $scope.$on('autocompleteStatus', function() {
            checkAutocompleteStatus();
        });

        checkAutocompleteStatus();
        $scope.getNamespacesPromise = RDF4JRepositoriesRestService.getNamespaces($scope.getActiveRepository());

        const validateQueryWithCallback = function (successCallback, query, queryType, params, all, oneOf) {
            if (!query) {
                successCallback();
            } else {
                GraphConfigRestService.validateQuery(query, queryType, params, all, oneOf)
                    .success(function () {
                        successCallback();
                    }).error(function (data) {
                    showInvalidMsg(getError(data));
                });
            }
        };

        $scope.validateCurrentPage = function (successCallback) {
            $scope.updateModel();

            if ($scope.page === 1) {
                if ($scope.newConfig.startMode === 'node' && !$scope.newConfig.startIRI) {
                    showInvalidMsg($translate.instant('graphexplore.select.start.node'));
                } else if ($scope.newConfig.startMode === 'query' && !$scope.newConfig.startGraphQuery) {
                    showInvalidMsg($translate.instant('graphexplore.provide.query'));
                } else if ($scope.newConfig.startMode === 'query') {
                    validateQueryWithCallback(successCallback, $scope.newConfig.startGraphQuery, 'graph')
                } else {
                    successCallback();
                }
            } else if ($scope.page === 2) {
                validateQueryWithCallback(successCallback, $scope.newConfig.expandQuery, 'construct', ['node'])
            } else if ($scope.page === 3) {
                validateQueryWithCallback(successCallback, $scope.newConfig.resourceQuery, 'tuple', ['node'], [], ['type', 'label', 'comment', 'rank']);
            } else if ($scope.page === 4) {
                validateQueryWithCallback(successCallback, $scope.newConfig.predicateLabelQuery, 'tuple', ['edge'], ['label']);
            } else if ($scope.page === 5) {
                validateQueryWithCallback(successCallback, $scope.newConfig.resourcePropertiesQuery, 'tuple', ['node'], ['property', 'value']);
            }
        };

        $scope.goToPage = function (nextPage) {
            if ($scope.page === nextPage) {
                // already there
                return;
            }

            $scope.validateCurrentPage(function () {
                $scope.showEditor();
                $scope.page = nextPage;
                $scope.notoolbar = $scope.page !== 1;
            });
        };

        $scope.goToPreviousPage = function () {
            if ($scope.page > 1) {
                $scope.goToPage($scope.page - 1);
            }

            if (checkPageAndMode()) {
                selectedFixedNodeChanged = false;
            }
        };

        $scope.goToNextPage = function () {
            broadcastAddStartFixedNodeEvent();
            if ($scope.newConfig.startMode !== 'node' || selectedFixedNodeChanged) {
                $scope.goToPage($scope.page + 1);
            }
        };

        function broadcastAddStartFixedNodeEvent() {
            if (checkPageAndMode()) {
                $scope.$broadcast('addStartFixedNodeAutomatically', {startIRI: $scope.newConfig.startIRI});
            }
        }

        function checkPageAndMode() {
            return $scope.page === 1 && $scope.newConfig.startMode === 'node';
        }

        $scope.saveGraphConfig = function () {
           broadcastAddStartFixedNodeEvent();

            if (checkPageAndMode() && !selectedFixedNodeChanged) {
                return;
            }

            $scope.newConfig.startQueryIncludeInferred = $scope.currentQuery.inference;
            $scope.newConfig.startQuerySameAs = $scope.currentQuery.sameAs;

            $scope.validateCurrentPage(function () {
                if (!$scope.newConfig.name) {
                    showInvalidMsg($translate.instant('graphexplore.provide.config.name'));
                    return;
                }
                $scope.isUpdate ? $scope.updateGraphConfig($scope.newConfig) : $scope.createGraphConfig($scope.newConfig);
            });
        };

        $scope.updateModel = function () {
            const query = window.editor.getValue().trim();
            if ($scope.newConfig.startMode === 'query' && $scope.page === 1) {
                $scope.newConfig.startGraphQuery = query;
            } else if ($scope.page === 2) {
                $scope.newConfig.expandQuery = query;
            } else if ($scope.page === 3) {
                $scope.newConfig.resourceQuery = query;
            } else if ($scope.page === 4) {
                $scope.newConfig.predicateLabelQuery = query;
            } else if ($scope.page === 5) {
                $scope.newConfig.resourcePropertiesQuery = query;
            }
        };

        // Called when user clicks on a sample query
        $scope.setQuery = function (query) {
            // Hack for YASQE bug
            window.editor.setValue(query ? query : ' ');
        };

        $scope.updateDirty = function () {
            if ($scope.revertConfig) {
                const q1 = getQueryForCurrentPage($scope.revertConfig);
                const q2 = window.editor.getValue().trim();
                $scope.queryEditorIsDirty = q1 !== q2;
            }
        };

        // Updates the position of the query editor to match the current div placeholder
        // and sets the editor's query to the relevant query from the model.
        $scope.updateEditor = function () {
            $timeout(function () {
                $scope.currentQuery.query = getQueryForCurrentPage($scope.newConfig);
                // // Check for ontop repository and override nocount property (it's default value is false)
                if ($repositories.isActiveRepoOntopType()) {
                    $scope.nocount = true;
                }
                $scope.currentQuery.inference = $scope.newConfig.startQueryIncludeInferred;
                $scope.currentQuery.sameAs = $scope.newConfig.startQuerySameAs;
                loadTab();
                selectTab($scope.currentQuery.id);
            }, 100);

        };

        $scope.showEditor = function () {
            if (window.editor && window.editor.xhr) {
                window.editor.xhr.abort();
            }
            $scope.viewMode = 'yasr';
        };

        $scope.showPreview = function () {
            // For some reason YASR gets confused and sets this to rawResponse
            // if we execute a CONSTRUCT and then a SELECT. This makes sure it's always table.
            $scope.currentQuery.outputType = 'table';
            $scope.runQuery();
        };

        $scope.revertEditor = function () {
            $scope.setQuery(getQueryForCurrentPage($scope.revertConfig));
        };

        // Trigger for showing the editor and moving it to the right position
        $scope.$watch('newConfig.startMode', function (value) {
            if (value === 'query') {
                $timeout(function () {
                    $scope.updateEditor();
                }, 0);
            }
        });

        // Trigger for showing the editor and moving it to the right position
        $scope.$watch('page', function (value) {
            if ($scope.newConfig.startMode === 'query' || value > 1) {
                $timeout(function () {
                    $scope.showEditor();
                    $scope.updateEditor();
                }, 0);
            }
        });
    }

    // DOWN HERE WE KEEP EVERYTHING PURELY QUERY EDITOR (MOSTLY BORROWED FROM query-editor.controller.js)
    // But Why? Can't we reuse it instead of borrow?

    const defaultTabConfig = {
        id: '1',
        name: '',
        query: 'select * where { \n' +
        '\t?s ?p ?o .\n' +
        '} limit 100 \n',
        inference: $scope.newConfig.startQueryIncludeInferred,
        sameAs: $scope.newConfig.startQuerySameAs
    };

    $scope.resetCurrentTabConfig = function () {
        $scope.currentTabConfig = {
            pageSize: 100, // page limit 100 as this is only used for preview
            page: 1,
            allResultsCount: 0,
            resultsCount: 0
        };
    };

    $scope.queryExists = false;

    $scope.resetCurrentTabConfig();

    $scope.tabsData = $scope.tabs = [defaultTabConfig];

    // query tab operations
    $scope.saveTab = saveTab;
    $scope.loadTab = loadTab;
    $scope.addNewTab = addNewTab;

    // query operations
    $scope.runQuery = runQuery;
    $scope.getNamespaces = getNamespaces;
    $scope.changePagination = changePagination;
    $scope.toggleSampleQueries = toggleSampleQueries;
    $scope.addKnownPrefixes = addKnownPrefixes;
    $scope.getExistingTabId = getExistingTabId;
    $scope.querySelected = querySelected;
    $scope.saveQueryToLocal = saveQueryToLocal;

    $scope.setLoader = setLoader;
    $scope.getLoaderMessage = getLoaderMessage;

    // query editor and results orientation
    $scope.fixSizesOnHorizontalViewModeSwitch = fixSizesOnHorizontalViewModeSwitch;
    $scope.changeViewMode = changeViewMode;
    $scope.showHideEditor = showHideEditor;
    $scope.focusQueryEditor = focusQueryEditor;
    $scope.orientationViewMode = true;

    // start of repository actions

    function saveQueryToLocal(currentQueryTab) {
    }

    function setLoader(isRunning, progressMessage, extraMessage) {
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
    }

    function getLoaderMessage() {
        const timeSeconds = (Date.now() - $scope.queryStartTime) / 1000;
        const timeHuman = $scope.getHumanReadableSeconds(timeSeconds);
        let message;

        if ($scope.progressMessage) {
            message = $scope.progressMessage + '... ' + timeHuman;
        } else {
            message = $translate.instant('common.running.operation', {timeHuman: timeHuman});
        }
        if ($scope.extraMessage && timeSeconds > 10) {
            message += '\n' + $scope.extraMessage;
        }

        return message;
    }


    // start of query editor results orientation operations
    function fixSizesOnHorizontalViewModeSwitch(verticalViewParam) {
        function visibleWindowHeight() {
            return window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight || 0;
        }

        const codemirrorWrapperSelector = '.CodeMirror-wrap';
        const verticalView = verticalViewParam;
        if (!$scope.orientationViewMode) {
            $scope.noPadding = {paddingRight: 15, paddingLeft: 0};

            // window.editor is undefined if no repo is selected
            if (window.editor && document.querySelector(codemirrorWrapperSelector)) {
                let newHeight = visibleWindowHeight() - (document.querySelector(codemirrorWrapperSelector).getBoundingClientRect().top);
                newHeight -= 40;
                document.querySelector(codemirrorWrapperSelector).style.height = newHeight + 'px';
                document.getElementById('yasr').style.minHeight = newHeight + 'px';
            } else {
                let timer;
                if (verticalView) {
                    timer = $timeout(function () {
                        $scope.fixSizesOnHorizontalViewModeSwitch(verticalView)
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
                let newHeight = visibleWindowHeight() - (document.querySelector(codemirrorWrapperSelector).getBoundingClientRect().top);
                newHeight -= 40;
                document.querySelector(codemirrorWrapperSelector).style.height = newHeight + 'px';
            } else {
                $scope.noPadding = {};
                document.querySelector(codemirrorWrapperSelector).style.height = '';
            }
            document.getElementById('yasr').style.minHeight = '';
        }
        if (window.yasr && window.yasr.container) {
            $timeout(function () {
                window.yasr.container.resize();
            }, 100);
        }
    }

    if (!$scope.orientationViewMode) {
        showHideEditor();
    }

    function changeViewMode(tabID) {
        $scope.viewMode = 'none';
        $scope.orientationViewMode = !$scope.orientationViewMode;
        fixSizesOnHorizontalViewModeSwitch();
        $('.dataTables_filter').remove();
        $('.resultsTable').remove();
        $timeout(function () {
            loadTab();
            selectTab(tabID);
        }, 100);
    }

    function showHideEditor() {
        fixSizesOnHorizontalViewModeSwitch(true);
    }

    function focusQueryEditor() {
        if (!angular.element(document).find('.editable-input').is(':focus')) {
            angular.element(document).find('.CodeMirror textarea:first-child').focus();
        }
    }

    function selectTab(id) {
        $timeout(function () {
            $('a[data-id = "' + id + '"]').tab('show');
        }, 0);
    }

    // start of query operations
    function runQuery(changePage, explain) {
        $scope.executedQueryTab = $scope.currentQuery;
        if (explain && !(window.editor.getQueryType() === 'SELECT' || window.editor.getQueryType() === 'CONSTRUCT'
            || window.editor.getQueryType() === 'DESCRIBE')) {
            toastr.warning($translate.instant('query.editor.warning.msg'));
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
                $scope.fixSizesOnHorizontalViewModeSwitch()
            }

            setLoader(true, $translate.instant('evaluating.query.msg'));
            window.editor.query();
        }
    }

    function getNamespaces() {
        // Signals the namespaces are to be fetched => loader will be shown
        setLoader(true, $translate.instant('common.refreshing.namespaces'), $translate.instant('common.extra.message'));
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
                setLoader(false);
            });
    }

    function changePagination() {
        runQuery(true, $scope.explainRequested);
    }

    if ($scope.getActiveRepository()) {
        getNamespaces();
    }

    $scope.$on('$destroy', function () {
        window.editor = null;
        window.yasr = null;
    });

    function toggleSampleQueries() {
    }

    // Add known prefixes
    function addKnownPrefixes() {
        SparqlRestService.addKnownPrefixes(JSON.stringify(window.editor.getValue()))
            .success(function (data) {
                if (angular.isDefined(window.editor) && angular.isDefined(data) && data !== window.editor.getValue()) {
                    window.editor.setValue(data);
                }
            })
            .error(function (data) {
                let msg = getError(data);
                toastr.error(msg, $translate.instant('common.add.known.prefixes.error'));
                return true;
            });
    }

    $('textarea').on('paste', function () {
        $timeout(function () {
            addKnownPrefixes();
        }, 0);
    });

    function querySelected(query) {
        const tabId = getExistingTabId(query);
        $scope.toggleSampleQueries();
        if (!angular.isDefined(tabId)) {
            $scope.addNewTab(null, query.name, query.body);
        } else {
            selectTab(tabId);
        }
    }

    function getExistingTabId(query) {
        let existingTabId = undefined;
        angular.forEach($scope.tabsData, function (item) {
            if (item.name === query.name && item.query === query.body) {
                existingTabId = item.id;
                return item;
            }
        });

        return existingTabId;
    }

    // end of query operations

    // start of query tab operations
    function findTabIndexByID(id) {
        for (let i = 0; i < $scope.tabsData.length; i++) {
            const tab = $scope.tabsData[i];
            if (tab.id === id) {
                return i;
            }
        }
    }

    $scope.$watchCollection('[currentQuery.inference, currentQuery.sameAs]', function () {
        saveQueryToLocal($scope.currentQuery);
    });

    function saveTab(id) {
        const idx = findTabIndexByID(id);
        // Tab was deleted, don't try to save it's state
        if (idx === undefined) {
            return {};
        }
        const tab = $scope.tabsData[idx];
        $scope.saveQueryToLocal(tab);
        return tab;
    }

    function addNewTab(callback, tabName, savedQuery) {
    }

    function loadTab() {
        if (!window.editor) {
            $timeout(() => loadTab());
            return;
        }
        $scope.tabsData = [$scope.currentQuery];

        let tab = $scope.currentQuery;

        if ($scope.currentQuery.query == null || $scope.currentQuery.query === '') {
            // hack for YASQE bug
            window.editor.setValue(' ');
        } else {
            window.editor.setValue($scope.currentQuery.query);
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

        //Remove padding of yasr so it will be aligned with sparql editor
        $('#yasr').css('padding', '0');
    }

    function getQueryID(element) {
        return $(element).attr('data-id');
    }

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
    // end of query tab operations

    $scope.currentQuery = _.cloneDeep(defaultTabConfig);
    // $scope.state = {};
    $scope.showSampleQueries = false;
    $scope.savedQuery = {};
    $scope.sampleQueries = {};

    $scope.getResultsDescription = function () {
    };

    $scope.getUpdateDescription = function () {
    };

    $scope.getStaleWarningMessage = function () {
    }

}
