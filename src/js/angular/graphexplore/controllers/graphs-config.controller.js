angular
    .module('graphdb.framework.graphexplore.controllers.graphviz.config', [])
    .controller('GraphConfigCtrl', GraphConfigCtrl);


GraphConfigCtrl.$inject = ['$scope', '$rootScope', '$timeout', 'localStorageService', '$location', 'toastr', '$repositories', '$modal', 'ModalService', 'SparqlService', '$filter', 'GraphConfigService', 'AutocompleteService', 'ClassInstanceDetailsService', '$routeParams'];

function GraphConfigCtrl($scope, $rootScope, $timeout, localStorageService, $location, toastr, $repositories, $modal, ModalService, SparqlService, $filter, GraphConfigService, AutocompleteService, ClassInstanceDetailsService, $routeParams) {

    $scope.page = 1;
    $scope.totalPages = 5;

    $scope.helpHidden = localStorageService.get('hide-graph-config-help') === 1;
    $scope.toggleHelp = function (value) {
        if (value == undefined) {
            value = localStorageService.get('hide-graph-config-help');
        }
        if (value != 1) {
            localStorageService.set('hide-graph-config-help', 1);
            $scope.helpHidden = true;
        } else {
            localStorageService.set('hide-graph-config-help', 0);
            $scope.helpHidden = false;
        }
    };

    $scope.fixedVisualCallback = function (uri, label) {
        $scope.newConfig.startIRI = uri;
        $scope.newConfig.startIRILabel = label;
    };

    $scope.isDefaultGraph = function (sample) {
        return (sample.name === 'Minimal' || sample.name === 'Advanced');
    };

    $scope.isUserGraph = function (sample) {
        return !$scope.isDefaultGraph(sample);
    };

    $scope.getSampleName = function (sample, property) {
        var extra = sample[property + 'Description'];
        if (extra) {
            // Sample has description, use it
            return extra;
        } else {
            // Sample is a copy of existing config, prepend Copy of to name
            return sample.id ? 'Copy of ' + sample.name : sample.name;
        }
    };

    var getGraphConfigSamples = function () {
        GraphConfigService.getGraphConfigSamples()
            .success(function (data, status, headers, config) {
                $scope.samples = _.filter(data, function (s) {
                    // Skip the currently edited config from samples and store it into a revert variable
                    if (!s.id || $scope.newConfig.id !== s.id) {
                        return true;
                    } else {
                        $scope.revertConfig = s;
                        return false;
                    }
                });
            }).error(function (data, status, headers, config) {
            toastr.error(getError(data), 'Could not get graph configs. You may not see sample values');
        });

    };

    var configName = $routeParams.configName;
    $scope.newConfig = {startQueryIncludeInferred: true, startQuerySameAs: true};
    $scope.newConfig.startMode = "search";
    $scope.isUpdate = false;

    $scope.encodeQuery = function (query) {
        return encodeURIComponent(query);
    };

    function showInvalidMsg(message) {
        toastr.warning(message);
    }

    if (configName) {
        $scope.isUpdate = true;
        GraphConfigService.getConfig(configName)
            .success(function (data, status, headers, config) {
                $scope.newConfig = data;
                initForConfig();
            })
            .error(function (data, status, headers, config) {
                toastr.error(getError(data), 'Could not load config for name ' + configName);
            });
    } else {
        $scope.isUpdate = false;
        initForConfig();
    }

    function getQueryForCurrentPage(config) {
        var q;

        if (config.startMode === 'query' && $scope.page === 1) {
            q = config.startGraphQuery;
        } else if ($scope.page === 2) {
            q = config.expandQuery;
        } else if ($scope.page === 3) {
            q = config.resourceQuery;
        } else if ($scope.page === 4) {
            q = config.predicateLabelQuery;
        } else if ($scope.page === 5) {
            q = config.resourcePropertiesQuery;
        }

        return angular.isDefined(q) ? q : "";
    }

    function initForConfig() {
        getGraphConfigSamples();

        $scope.createGraphConfig = function () {
            GraphConfigService.createGraphConfig($scope.newConfig)
                .success(async function () {
                    await showSuccessMessage('Saved new graph config');
                    $location.url("graphs-visualizations");
                }).error(function (data, status, headers, config) {
                toastr.error(getError(data), 'Error! Could not create graph config');
            });
        };

        $scope.updateGraphConfig = function () {
            GraphConfigService.updateGraphConfig($scope.newConfig)
                .success(async function () {
                    await showSuccessMessage('Graph config saved');
                    $location.url("graphs-visualizations");
                }).error(function (data, status, headers, config) {
                toastr.error(getError(data), 'Error! Could not save graph config');
            });
        };

        /**
         *  This method will show message with tiny delay and only after completion
         *  of latter redirection to "graphs-visualizations" page will happen.
         * @param message
         * @returns {Promise<any>}
         */
        let showSuccessMessage = function (message) {
            return new Promise(r => {
                toastr.success(message);
                setTimeout(r, 300)
            });
        };

        $scope.getAutocompletePromise = AutocompleteService.checkAutocompleteStatus();
        $scope.getNamespacesPromise = ClassInstanceDetailsService.getNamespaces($scope.getActiveRepository());

        var validateQueryWithCallback = function (successCallback, query, queryType, params, all, oneOf) {
            if (!query) {
                successCallback();
            } else {
                GraphConfigService.validateQuery(query, queryType, params, all, oneOf)
                    .success(function () {
                        successCallback();
                    }).error(function (data, status, headers, config) {
                    showInvalidMsg(getError(data));
                });
            }
        };

        $scope.validateCurrentPage = function (successCallback) {
            $scope.updateModel();

            if ($scope.page === 1) {
                if ($scope.newConfig.startMode === "node" && !$scope.newConfig.startIRI) {
                    showInvalidMsg("Please select start node.");
                } else if ($scope.newConfig.startMode === "query" && !$scope.newConfig.startGraphQuery) {
                    showInvalidMsg("Please provide start graph query.");
                } else if ($scope.newConfig.startMode === "query") {
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
                $scope.notoolbar = $scope.page != 1;
            });
        };

        $scope.goToPreviousPage = function () {
            if ($scope.page > 1) {
                $scope.goToPage($scope.page - 1);
            }
        };

        $scope.goToNextPage = function (page) {
            $scope.goToPage($scope.page + 1);
        };

        $scope.saveGraphConfig = function () {
            $scope.newConfig.startQueryIncludeInferred = $scope.currentQuery.inference;
            $scope.newConfig.startQuerySameAs = $scope.currentQuery.sameAs;

            $scope.validateCurrentPage(function () {
                if (!$scope.newConfig.name) {
                    showInvalidMsg("Please provide config name.");
                    return;
                }
                $scope.isUpdate ? $scope.updateGraphConfig($scope.newConfig) : $scope.createGraphConfig($scope.newConfig);
            });
        };

        $scope.updateModel = function () {
            var query = window.editor.getValue().trim();
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
            window.editor.setValue(query ? query : " ");
        };

        $scope.updateDirty = function () {
            if ($scope.revertConfig) {
                var q1 = getQueryForCurrentPage($scope.revertConfig);
                var q2 = window.editor.getValue().trim();
                $scope.queryEditorIsDirty = q1 !== q2;
            }
        };

        // Updates the position of the query editor to match the current div placeholder
        // and sets the editor's query to the relevant query from the model.
        $scope.updateEditor = function () {
            $timeout(function () {
                $scope.currentQuery.query = getQueryForCurrentPage($scope.newConfig);
                $scope.currentQuery.inference = $scope.newConfig.startQueryIncludeInferred;
                $scope.currentQuery.sameAs = $scope.newConfig.startQuerySameAs;
                loadTab($scope.currentQuery.id);
                selectTab($scope.currentQuery.id);
            }, 100);

        };

        $scope.showEditor = function () {
            if (window.editor.xhr) {
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

    var defaultTabConfig = {
        id: "1",
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
    let backendRepositoryID = $scope.getActiveRepository();

    function saveQueryToLocal(currentQueryTab) {
    }

    function setLoader(isRunning, progressMessage, extraMessage) {
        var yasrInnerContainer = angular.element(document.getElementById("yasr-inner"));
        $scope.queryIsRunning = isRunning;
        if (isRunning) {
            $scope.queryStartTime = Date.now();
            $scope.countTimeouted = false;
            $scope.progressMessage = progressMessage;
            $scope.extraMessage = extraMessage;
            yasrInnerContainer.addClass("hide");
        } else {
            $scope.progressMessage = "";
            $scope.extraMessage = "";
            yasrInnerContainer.removeClass("hide");
        }
        // We might call this from angular or outside angular so take care of applying the scope.
        if ($scope.$$phase === null) {
            $scope.$apply();
        }
    }

    function getLoaderMessage() {
        var timeSeconds = (Date.now() - $scope.queryStartTime) / 1000,
            timeHuman = $scope.getHumanReadableSeconds(timeSeconds),
            message = "";

        if ($scope.progressMessage) {
            message = $scope.progressMessage + "... " + timeHuman;
        } else {
            message = "Running operation..." + timeHuman;
        }
        if ($scope.extraMessage && timeSeconds > 10) {
            message += "\n" + $scope.extraMessage;
        }

        return message;
    }


    // start of query editor results orientation operations
    function fixSizesOnHorizontalViewModeSwitch(verticalView) {
        function visibleWindowHeight() {
            return window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight || 0;
        }

        var verticalView = verticalView;
        if (!$scope.orientationViewMode) {
            $scope.noPadding = {paddingRight: 15, paddingLeft: 0};

            // window.editor is undefined if no repo is selected
            if (window.editor && document.querySelector('.CodeMirror-wrap')) {
                var newHeight = visibleWindowHeight() - (document.querySelector('.CodeMirror-wrap').getBoundingClientRect().top);
                newHeight -= 40;
                document.querySelector('.CodeMirror-wrap').style.height = newHeight + 'px';
                document.getElementById('yasr').style.minHeight = newHeight + 'px';
                //window.editor.refresh();
            } else {
                if (verticalView) {
                    var timer = $timeout(function () {
                        $scope.fixSizesOnHorizontalViewModeSwitch(verticalView)
                    }, 100);
                } else {
                    var timer = $timeout($scope.fixSizesOnHorizontalViewModeSwitch, 100);
                }

                $scope.$on("$destroy", function (event) {
                    $timeout.cancel(timer);
                });
            }
        } else {
            if ($scope.viewMode === 'yasr') {
                var newHeight = visibleWindowHeight() - (document.querySelector('.CodeMirror-wrap').getBoundingClientRect().top);
                newHeight -= 40;
                document.querySelector('.CodeMirror-wrap').style.height = newHeight + 'px';
                //window.editor.refresh();
            } else {
                $scope.noPadding = {};
                document.querySelector('.CodeMirror-wrap').style.height = '';
                //window.editor.refresh();
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
        // localStorageService.set('viewMode', $scope.orientationViewMode);
        fixSizesOnHorizontalViewModeSwitch();
        $('.dataTables_filter').remove();
        $('.resultsTable').remove();
        $timeout(function () {
            loadTab(tabID);
            selectTab(tabID);
        }, 100);
    }

    function showHideEditor() {
        fixSizesOnHorizontalViewModeSwitch(true);
    }

    function focusQueryEditor() {
        if (!angular.element(document).find('.editable-input').is(":focus")) {
            angular.element(document).find('.CodeMirror textarea:first-child').focus();
        }
    }

    // end of query editor results orientation operations

    function deleteCachedSparqlResults() {
    }

    function selectTab(id) {
        $timeout(function () {
            $('a[data-id = "' + id + '"]').tab('show');
        }, 0);
    }

    // start of query operations
    function runQuery(changePage, explain) {
        $scope.executedQueryTab = $scope.currentQuery;
        if (explain && !(window.editor.getQueryType() === 'SELECT' || window.editor.getQueryType() === 'CONSTRUCT')) {
            toastr.warning('Explain only works with SELECT or CONSTRUCT queries.');
            return;
        }

        if (window.editor.getQueryMode() === 'update') {
            toastr.warning('Cannot execute updates from this editor.');
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

            setLoader(true, 'Evaluating query');
            window.editor.query();
        }
    }

    function getNamespaces() {
        // Signals the namespaces are to be fetched => loader will be shown
        setLoader(true, 'Refreshing namespaces', 'Normally this is a fast operation but it may take longer if a bigger repository needs to be initialised first.');
        // $scope.queryIsRunning = true;
        ////console.log("Send namespaces request. Default token is : " + $http.defaults.headers.common["Authorization"]);
        SparqlService.getRepositoryNamespaces()
            .success(function (data) {
                var usedPrefixes = {};
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

    $scope.$on("$destroy", function (event) {
        window.editor = null;
        window.yasr = null;
    });

    function toggleSampleQueries() {
    }

    // Add known prefixes
    function addKnownPrefixes() {
        SparqlService.addKnownPrefixes(JSON.stringify(window.editor.getValue()))
            .success(function (data, status, headers, config) {
                if (angular.isDefined(window.editor) && angular.isDefined(data) && data !== window.editor.getValue()) {
                    window.editor.setValue(data);
                }
            })
            .error(function (data, status, headers, config) {
                let msg = getError(data);
                toastr.error(msg, 'Error! Could not add known prefixes');
                return true;
            });
    }

    $('textarea').on('paste', function () {
        $timeout(function () {
            addKnownPrefixes();
        }, 0);
    });

    function querySelected(query) {
        var tabId = getExistingTabId(query);
        $scope.toggleSampleQueries();
        if (!angular.isDefined(tabId)) {
            $scope.addNewTab(null, query.name, query.body);
        } else {
            selectTab(tabId);
        }
    }

    function getExistingTabId(query) {
        var existingTabId = undefined;
        angular.forEach($scope.tabsData, function (item, index) {
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
        for (var i = 0; i < $scope.tabsData.length; i++) {
            var tab = $scope.tabsData[i];
            if (tab.id === id) {
                return i;
            }
        }
    }

    $scope.$watchCollection('[currentQuery.inference, currentQuery.sameAs]', function () {
        saveQueryToLocal($scope.currentQuery);
    });

    function saveTab(id) {
        var idx = findTabIndexByID(id);
        // Tab was deleted, don't try to save it's state
        if (idx === undefined) {
            return {};
        }
        var tab = $scope.tabsData[idx];
        //tab.query = window.editor.getValue();
        $scope.saveQueryToLocal(tab);
        return tab;
    }

    var maxID = 1;

    function addNewTab(callback, tabName, savedQuery) {
    }

    function loadTab(id) {
        $scope.tabsData = [$scope.currentQuery];

        let tab = $scope.currentQuery;

        if ($scope.currentQuery.query == null || $scope.currentQuery.query == "") {
            // hack for YASQE bug
            window.editor.setValue(" ");
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

        //Remove paddign of yasr so it will be aligned with sparql editor
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

    $scope.currentQuery = angular.copy(defaultTabConfig);
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
