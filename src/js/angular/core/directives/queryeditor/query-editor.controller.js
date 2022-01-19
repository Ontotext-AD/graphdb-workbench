import 'angular/utils/local-storage-adapter';
import 'angular/rest/sparql.rest.service';

angular
    .module('graphdb.framework.core.directives.queryeditor.controllers', [
        'graphdb.framework.utils.localstorageadapter',
        'graphdb.framework.rest.sparql.service'
    ])
    .controller('QueryEditorCtrl', QueryEditorCtrl)
    .controller('QuerySampleModalCtrl', QuerySampleModalCtrl);

QueryEditorCtrl.$inject = ['$scope', '$timeout', 'toastr', '$repositories', '$modal', 'ModalService', 'SparqlRestService', '$filter', '$window', '$jwtAuth', 'RDF4JRepositoriesRestService', 'MonitoringRestService', 'LocalStorageAdapter', 'LSKeys'];

function QueryEditorCtrl($scope, $timeout, toastr, $repositories, $modal, ModalService, SparqlRestService, $filter, $window, $jwtAuth, RDF4JRepositoriesRestService, MonitoringRestService, LocalStorageAdapter, LSKeys) {
    const defaultTabConfig = {
        id: "1",
        name: '',
        query: 'select * where { \n' +
        '\t?s ?p ?o .\n' +
        '} limit 100 \n',
        inference: true,
        sameAs: true
    };

    let principal = $jwtAuth.getPrincipal();
    let checkQueryIntervalId;
    if (principal) {
        initTabs($scope, principal);
        // principal is not yet set, wait for its initialization
    } else {
        $scope.$on('securityInit', function (scope) {
            principal = $jwtAuth.getPrincipal();
            initTabs(scope.currentScope, principal);
        });
    }

    function initTabs(scope, principal) {
        defaultTabConfig.inference = principal.appSettings.DEFAULT_INFERENCE;
        defaultTabConfig.sameAs = principal.appSettings.DEFAULT_SAMEAS;

        scope.skipCountQuery = !principal.appSettings.EXECUTE_COUNT;
        scope.ignoreSharedQueries = principal.appSettings.IGNORE_SHARED_QUERIES;
        scope.tabsData = scope.tabs = LocalStorageAdapter.get(LSKeys.TABS_STATE) || [defaultTabConfig];

        scope.$watchCollection('[currentQuery.inference, currentQuery.sameAs]', function (newVal, oldVal, scope) {
            saveQueryToLocal(scope.currentQuery);
        });

        scope.$on('repositoryIsSet', deleteCachedSparqlResults);
    }

    this.hint =  document.createElement("span");
    this.hint.innerHTML = "Hint: \"abC\" matches \"abC*\", \"ab c*\" and \"ab-c*\"";
    this.hint.style.fontSize = "12px";
    this.hint.style.color = "gray";
    this.hint.style.backgroundColor = "white";
    this.hint.style.position = "absolute";
    this.hint.style.zIndex = "3";
    this.hint.style.paddingLeft = 12 + "px";

    $scope.$watch(function() {
        return angular.element('.CodeMirror-hints').length;
    }, (newValue) => {
        if (newValue) {
            const elRect = angular.element('.CodeMirror-hints')[0].getBoundingClientRect();
            document.body.appendChild(this.hint);
            this.hint.style.top = elRect.top - 20 + "px";
            this.hint.style.left = elRect.right - this.hint.offsetWidth - 12 +  "px";
        } else {
            this.hint && this.hint.parentNode && this.hint.parentNode.removeChild(this.hint);
        }
    });

    $scope.resetCurrentTabConfig = function () {
        $scope.currentTabConfig = {
            pageSize: 1000,
            page: 1,
            allResultsCount: 0,
            resultsCount: 0
        };
    };

    $scope.queryExists = false;

    $scope.resetCurrentTabConfig();

    // query tab operations
    $scope.saveTab = saveTab;
    $scope.loadTab = loadTab;
    $scope.addNewTab = addNewTab;
    $scope.isTabChangeOk = isTabChangeOk;

    // query operations
    $scope.runQuery = runQuery;
    $scope.abortCurrentQuery = abortCurrentQuery;
    $scope.editQuery = editQuery;
    $scope.getNamespaces = getNamespaces;
    $scope.changePagination = changePagination;
    $scope.toggleSampleQueries = toggleSampleQueries;
    $scope.addKnownPrefixes = addKnownPrefixes;
    $scope.getExistingTabId = getExistingTabId;
    $scope.querySelected = querySelected;
    $scope.deleteQuery = deleteQuery;
    $scope.deleteQueryHttp = deleteQueryHttp;
    $scope.saveQuery = saveQuery;
    $scope.saveQueryHttp = saveQueryHttp;
    $scope.saveQueryToLocal = saveQueryToLocal;

    $scope.setLoader = setLoader;
    $scope.getLoaderMessage = getLoaderMessage;

    // query editor and results orientation
    $scope.fixSizesOnHorizontalViewModeSwitch = fixSizesOnHorizontalViewModeSwitch;
    $scope.changeViewMode = changeViewMode;
    $scope.showHideEditor = showHideEditor;
    $scope.focusQueryEditor = focusQueryEditor;
    $scope.orientationViewMode = LocalStorageAdapter.get(LSKeys.VIEW_MODE) ? LocalStorageAdapter.get(LSKeys.VIEW_MODE) === "true" : true;
    $scope.viewMode = 'none';

    // start of repository actions
    // FIXME: do we need this??
    // $scope.getActiveRepository();
    $scope.getActiveRepository = function () {
        // same as getActiveRepository() but takes into account repo errors
        return $repositories.getActiveRepository();
    };

    $scope.getActiveRepositoryNoError = function () {
        if (!$scope.repositoryError) {
            return $repositories.getActiveRepository();
        }
    };

    function saveQueryToLocal(currentQueryTab) {
        shouldDisableSameAs();
        $scope.tabs.forEach(function (tab, index) {
            if (tab.id === currentQueryTab.id) {
                $scope.tabs[index].query = currentQueryTab.query;
                // Don't store inference and sameAs values for Ontop repository,
                // because they are overridden afterwards to true
                if (!$repositories.isActiveRepoOntopType()) {
                    $scope.tabs[index].inference = currentQueryTab.inference;
                    $scope.tabs[index].sameAs = currentQueryTab.sameAs;
                }
            }
        });
        LocalStorageAdapter.set(LSKeys.TABS_STATE, $scope.tabs);
    }

    function setLoader(isRunning, progressMessage, extraMessage, noTimer) {
        const yasrInnerContainer = angular.element(document.getElementById("yasr-inner"));
        $scope.queryIsRunning = isRunning;
        if (isRunning) {
            $scope.queryStartTime = Date.now();
            $scope.countTimeouted = false;
            $scope.progressMessage = progressMessage;
            $scope.extraMessage = extraMessage;
            $scope.noLoaderTimer = noTimer;
            yasrInnerContainer.addClass("hide");
        } else {
            $scope.progressMessage = "";
            $scope.extraMessage = "";
            $scope.noLoaderTimer = false;
            $scope.currentTrackAlias = null;
            $scope.abortRequested = false;
            yasrInnerContainer.removeClass("hide");
        }
        // We might call this from angular or outside angular so take care of applying the scope.
        if ($scope.$$phase === null) {
            $scope.$apply();
        }
    }

    function getLoaderMessage() {
        const timeSeconds = (Date.now() - $scope.queryStartTime) / 1000;
        let timeHuman = "";
        let message = "";

        if (!$scope.noLoaderTimer) {
            timeHuman = $scope.getHumanReadableSeconds(timeSeconds);
        }

        if ($scope.progressMessage) {
            message = $scope.progressMessage + "... " + timeHuman;
        } else {
            message = "Running operation... " + timeHuman;
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

                $scope.$on("$destroy", function () {
                    $timeout.cancel(timer);
                });
            }
        } else {
            if ($scope.viewMode === 'yasr') {
                let newHeight = visibleWindowHeight() - (document.querySelector('.CodeMirror-wrap').getBoundingClientRect().top);
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

    function changeViewMode() {
        $scope.viewMode = 'none';
        $scope.orientationViewMode = !$scope.orientationViewMode;
        LocalStorageAdapter.set(LSKeys.VIEW_MODE, $scope.orientationViewMode);
        fixSizesOnHorizontalViewModeSwitch();
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

    function deleteCachedSparqlResults(foo, params) {
        if (params.newRepo) {
            $scope.tabsData = LocalStorageAdapter.get(LSKeys.TABS_STATE);
            $scope.tabsData.forEach(function (item) {
                item.yasrData = undefined;
                item.queryType = undefined;
                item.resultsCount = 0;
                item.allResultsCount = 0;
                item.sizeDelta = undefined;
            });

            LocalStorageAdapter.set(LSKeys.TABS_STATE, $scope.tabsData);
            $scope.tabs = $scope.tabsData;

            // The repository is changed. Remove error messages as well, if any
            $scope.currentQuery = {};
            $scope.errorMessage = null;
            $scope.repositoryError = null;
        }
    }

    function selectTab(id) {
        $timeout(function () {
            $('a[data-id = "' + id + '"]').tab('show');
        }, 0);
    }

    window.onbeforeunload = function () {
        if ($scope.currentQuery) {
            $scope.saveTab($scope.currentQuery.id);
        }
        LocalStorageAdapter.set(LSKeys.TABS_STATE, $scope.tabs);
    };

    $scope.$on('$destroy', function () {
        if ($scope.currentQuery) {
            $scope.saveTab($scope.currentQuery.id);
        }
        LocalStorageAdapter.set(LSKeys.TABS_STATE, $scope.tabs);
        clearInterval(checkQueryIntervalId);
    });

    // start of query operations
    function runQuery(changePage, explain) {
        $scope.executedQueryTab = $scope.currentQuery;
        if (explain) {
            if (!(window.editor.getQueryType() === 'SELECT' || window.editor.getQueryType() === 'CONSTRUCT')) {
                toastr.warning('Explain only works with SELECT or CONSTRUCT queries.');
                return;
            }

            if ($repositories.isActiveRepoOntopType()) {
                toastr.warning('Explain not supported for Virtual repositories.');
                return;
            }
        }

        $scope.explainRequested = explain;
        if (!$scope.queryIsRunning) {
            if (changePage) {
                $scope.currentTabConfig.resultsCount = 0;
            } else {
                $scope.resetCurrentTabConfig();
            }

            $scope.lastRunQueryMode = window.editor.getQueryMode();

            if ($scope.lastRunQueryMode === 'update' && $repositories.isActiveRepoOntopType()) {
                toastr.warning('Updates are not supported for Virtual repositories.');
                return;
            }

            setLoader(true, $scope.lastRunQueryMode === 'update' ? 'Executing update' : 'Evaluating query');
            if ($scope.viewMode !== 'none') {
                $scope.viewMode = 'none';
                if ($scope.orientationViewMode) {
                    $scope.fixSizesOnHorizontalViewModeSwitch();
                }
                const timer = $timeout(window.editor.query, 500);
                $scope.$on('$destroy', function () {
                    $timeout.cancel(timer);
                });
            } else {
                window.editor.query();
            }
        }
    }

    function abortCurrentQuery() {
        MonitoringRestService.abortQueryByAlias($scope.currentTrackAlias)
            .success(function () {
                $scope.abortRequested = true;
            });
    }

    function getNamespaces() {
        // Signals the namespaces are to be fetched => loader will be shown
        setLoader(true, 'Refreshing namespaces', 'Normally this is a fast operation but it may take longer if a bigger repository needs to be initialised first.');
        $scope.namespacesLoading = true;

        RDF4JRepositoriesRestService.getRepositoryNamespaces()
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
                $scope.namespacesLoading = false;
            });
    }

    function changePagination() {
        runQuery(true, $scope.explainRequested);
    }

    $scope.$on("$destroy", function () {
        clearInterval(checkQueryIntervalId);
        window.editor = null;
        window.yasr = null;
    });

    function toggleSampleQueries() {
        $scope.showSampleQueries = !$scope.showSampleQueries;
        if ($scope.showSampleQueries) {
            SparqlRestService.getSavedQueries()
                .success(function (data) {
                    $scope.sampleQueries = data;
                    $('#sampleQueriesCollapse').collapse('show').width('300px');
                })
                .error(function (data) {
                    const msg = getError(data);
                    toastr.error(msg, 'Error! Could not get saved queries');
                });
        } else {
            $('#sampleQueriesCollapse').collapse('hide');
        }
    }

    // Hide the sample queries when the user clicks somewhere else in the UI.
    $(document).mouseup(function (event) {
        const container = $('#sampleQueriesCollapse');
        if (!container.is(event.target) // if the target of the click isn't the container..
            && container.has(event.target).length === 0 //... nor a descendant of the container
            && $scope.showSampleQueries) {
            toggleSampleQueries();
        }
    });

    // Add known prefixes
    function addKnownPrefixes() {
        SparqlRestService.addKnownPrefixes(JSON.stringify(window.editor.getValue()))
            .success(function (data) {
                if (angular.isDefined(window.editor) && angular.isDefined(data) && data !== window.editor.getValue()) {
                    window.editor.setValue(data);
                }
            })
            .error(function (data) {
                const msg = getError(data);
                toastr.error(msg, 'Error! Could not add known prefixes');
                return true;
            });
    }

    function querySelected(query) {
        const tabId = getExistingTabId(query);
        $scope.toggleSampleQueries();

        if ($scope.isTabChangeOk(false)) {
            $scope.highlightNextTabChange = true;
            if (!angular.isDefined(tabId)) {
                $scope.addNewTab(null, query.name, query.body);
            } else {
                selectTab(tabId);
            }
        }
    }

    function getExistingTabId(query) {
        let existingTabId = undefined;
        $scope.tabsData.forEach(function (item) {
            if (item.name === query.name && item.query === query.body) {
                existingTabId = item.id;
                return item;
            }
        });
        return existingTabId;
    }

    function editQuery(query) {
        const modalInstance = $modal.open({
            templateUrl: 'js/angular/core/directives/queryeditor/templates/query-sample.html',
            controller: 'QuerySampleModalCtrl',
            resolve: {
                data: function () {
                    return {
                        title: 'Edit Saved Query: "' + query.name + '"',
                        query: query,
                        edit: true,
                        okButtonText: 'Save'
                    };
                }
            }
        });

        modalInstance.result.then(function (queryModal) {
            const data = {
                name: queryModal.name,
                body: queryModal.body,
                shared: queryModal.shared
            };
            if (query.name !== queryModal.name) {
                SparqlRestService.addNewSavedQuery(data)
                    .success(function () {
                        $scope.deleteQueryHttp(query.name, true);
                    })
                    .error(function (error) {
                        const msg = getError(error);
                        toastr.error(msg, 'Error! Cannot edit saved query');
                    });
            } else {
                SparqlRestService.editSavedQuery(data)
                    .success(function () {
                        $('#editQueryContainer').modal('hide');
                        $scope.toggleSampleQueries();
                        toastr.success('Saved query ' + query.name + ' was edited.');
                    })
                    .error(function (error) {
                        const msg = getError(error);
                        toastr.error(msg, 'Error! Cannot edit Saved query');
                    });
            }
        });
    }

    function deleteQueryHttp(savedQueryName, edit) {
        SparqlRestService.deleteSavedQuery(savedQueryName)
            .success(function () {
                $scope.toggleSampleQueries();
                if (!edit) {
                    toastr.success('Saved query: ' + savedQueryName + ' was deleted.');
                }
            })
            .error(function (data) {
                const msg = getError(data);
                toastr.error(msg, 'Error! Cannot delete saved query');
            });
    }

    function deleteQuery(savedQueryName) {
        ModalService.openSimpleModal({
            title: 'Confirm',
            message: 'Are you sure you want to delete the saved query ' + '\'' + savedQueryName + '\'?',
            warning: true
        }).result
            .then(function () {
                $scope.deleteQueryHttp(savedQueryName);
            });
    }

    function saveQueryHttp(query) {
        SparqlRestService.addNewSavedQuery(query)
            .success(function () {
                toastr.success('Saved query ' + query.name + ' was saved.');
            })
            .error(function (data) {
                let msg = getError(data);
                toastr.error(msg, 'Error! Cannot create saved query');
                // TODO: This condition will always be true
                if (msg = "Query '" + query.name + "' already exists!") {
                    query.query = query.body;
                    const queryExists = true;
                    $scope.saveQuery(query, queryExists);
                }
            });
    }

    function saveQuery(query, queryExists) {
        const modalInstance = $modal.open({
            templateUrl: 'js/angular/core/directives/queryeditor/templates/query-sample.html',
            controller: 'QuerySampleModalCtrl',
            resolve: {
                data: function () {
                    return {
                        title: 'Create New Saved Query',
                        query: {name: query.name, body: query.query, shared: query.shared},
                        edit: false,
                        okButtonText: 'Create',
                        queryExists: queryExists
                    };
                }
            }
        });

        modalInstance.result.then(function (query) {
            $scope.saveQueryHttp(query);
        }, function () {
        });
    }

    // end of query operations

    function showModal(modalSelector) {
        return function (name, query, shared) {
            $scope.savedQuery = {
                name: name,
                query: query || window.editor.getValue(),
                shared: shared
            };
            $(modalSelector).modal('show');
        };
    }


    // start of query tab operations
    function findTabIndexByID(id) {
        for (let i = 0; i < $scope.tabsData.length; i++) {
            const tab = $scope.tabsData[i];
            if (tab.id === id) {
                return i;
            }
        }
    }

    function saveTab(id) {
        const idx = findTabIndexByID(id);
        // Tab was deleted, don't try to save it's state
        if (idx === undefined) {
            return {};
        }
        const tab = $scope.tabsData[idx];
        //tab.query = window.editor.getValue();
        $scope.saveQueryToLocal(tab);
        return tab;
    }

    let maxID = LocalStorageAdapter.get(LSKeys.TABS_STATE_MAXID) || 1;

    function addNewTab(callback, tabName, savedQuery) { // optional callback to call after tab has been added
        if (!isTabChangeOk(true)) {
            return;
        }
        let defaultTabConfig;
        if (tabName || savedQuery) {
            defaultTabConfig = {
                id: "1",
                name: tabName,
                query: savedQuery,
                inference: principal.appSettings.DEFAULT_INFERENCE,
                sameAs: principal.appSettings.DEFAULT_SAMEAS
            };
        } else {
            defaultTabConfig = {
                id: "1",
                name: '',
                query: 'select * where { \n' +
                '\t?s ?p ?o .\n' +
                '} limit 100 \n',
                inference: principal.appSettings.DEFAULT_INFERENCE,
                sameAs: principal.appSettings.DEFAULT_SAMEAS
            };
        }

        maxID++;
        const newID = '' + maxID;
        $scope.tabsData = $scope.tabs;

        const newTab = defaultTabConfig;
        newTab.id = newID;

        $scope.tabsData.push(newTab);

        LocalStorageAdapter.set(LSKeys.TABS_STATE_MAXID, maxID);
        LocalStorageAdapter.set(LSKeys.TABS_STATE, $scope.tabsData);
        const callbackArgs = Array.prototype.slice.call(arguments, 1); // skip one argument, i.e. the callback itself
        $timeout(function () {
            $scope.$apply();
            selectTab(newID);
            if (callback) {
                callback.apply(this, callbackArgs);
            }
        }, 0);
        $scope.tabs = $scope.tabsData;
    }

    function loadTab(id) {
        $scope.tabsData = LocalStorageAdapter.get(LSKeys.TABS_STATE) || [defaultTabConfig];

        // find available tab
        const idx = findTabIndexByID(id);
        const tab = $scope.tabsData[idx];

        if (tab.yasrData) {
            setLoader(true, 'Rendering results', null, true);
        }

        // set query in editor available on the current tab
        $timeout(function () {
            if ($scope.currentQuery.query === '') {
                $scope.currentQuery.query = " ";
            }
            $timeout(function () {
                window.editor.setValue($scope.currentQuery.query);
                $scope.yasr.updateDownloadDropdown();
                $scope.$broadcast('tabLoaded', $scope.currentQuery.id);

                // set query results in query results sections after
                // previous query execution. Yasr response rendering depends on the
                // query type of window.editor!
                $scope.yasr.options.output = tab.outputType; // this may be undefined, that's fine!
                if (tab.yasrData) {
                    if (tab.yasrData.customError) {
                        // Our injected custom (not real HTTP) error
                        $scope.yasr.results = {
                            getException: function () {
                                return tab.yasrData.customError;
                            }
                        };
                        setLoader(false);
                    } else {
                        // Real YASR result
                        $timeout(function () {
                            $scope.setYasrResponse(tab.yasrData, tab.textStatus, tab.jqXhrOrErrorString);
                            setLoader(false);
                            if ($('.yasr_btnGroup li:nth-child(2)').hasClass("active")) {
                                $timeout(function () {
                                    $('.yasr_btnGroup li:nth-child(2) a').get(0).click();
                                }, 0);
                            }
                        }, 0);
                    }
                }
            }, 0);
        }, 0);


        // persist current tab id in local storage
        LocalStorageAdapter.set(LSKeys.TABS_STATE_CURRENT_ID, id);

        $scope.currentQuery = tab;

        $timeout(function () {
            $scope.currentTabConfig = {};
            $scope.currentTabConfig.queryType = tab.queryType;
            $scope.currentTabConfig.resultsCount = tab.resultsCount;

            $scope.currentTabConfig.offset = tab.offset;
            $scope.currentTabConfig.allResultsCount = tab.allResultsCount;
            $scope.currentTabConfig.allResultsCountExact = tab.allResultsCountExact;
            $scope.currentTabConfig.page = tab.page;
            $scope.currentTabConfig.pageSize = tab.pageSize;

            $scope.currentTabConfig.timeFinished = tab.timeFinished;
            $scope.currentTabConfig.timeTook = tab.timeTook;
            $scope.currentTabConfig.sizeDelta = tab.sizeDelta;
            $scope.currentTabConfig.customUpdateMessage = tab.customUpdateMessage;
            $scope.currentTabConfig.errorMessage = tab.errorMessage;
            $scope.currentTabConfig.warningMessage = tab.warningMessage;

            $scope.$apply();
        }, 0);

        //Remove paddign of yasr so it will be aligned with sparql editor
        $('#yasr').css('padding', '0');

        if (!checkQueryIntervalId) {
            checkQueryIntervalId = setInterval(showOrHideSaveAsDropDown, 200);
        }
        overrideSameAsInferenceAndNoCountIfNeeded();
    }

    function getQueryID(element) {
        return $(element).attr('data-id');
    }

    function showOrHideSaveAsDropDown() {
        // If selected tab has results and query in editor controller is invalid save as
        // dropdown menu will be removed and on fixing query latter will be added
        if ($scope.currentTabConfig.resultsCount >= 0) {
            const $saveAsDropDown = $('.saveAsDropDown');
            if ($saveAsDropDown.length > 0 && !window.editor.queryValid) {
                yasr.header.find('.saveAsDropDown').remove();
            } else if ($saveAsDropDown.length === 0 && window.editor.queryValid) {
                yasr.updateDownloadDropdown();
            }
        }
    }

    function isTabChangeOk(isNew) {
        if ($scope.queryIsRunning && !$scope.namespacesLoading) {
            if (isNew) {
                toastr.info('New tabs may not be opened while query or update is running.');
            } else {
                toastr.info('Tabs may not be switched while query or update is running.');
            }

            return false;
        }

        return true;
    }

    // Raise this flag to provide visual feedback to the user the next time a tab changes
    // (either manually or by the system). See GDB-1983.
    $scope.highlightNextTabChange = false;
    $scope.$on('tabAction', function (e, tabEvent) {
        if (tabEvent.relatedTarget) {
            // Cancel any highlight timer that might have been left by the last highlight
            $timeout.cancel(tabEvent.relatedTarget.timer);
            $(tabEvent.relatedTarget).css('color', '');

            $scope.saveTab(getQueryID(tabEvent.relatedTarget));
        }

        $scope.loadTab(getQueryID(tabEvent.target));

        // These arrays define how the tab change will be visually enhanced.
        // colors contains the colors to set to the tab name,
        // while times defines the times in milliseconds to keep each color.
        // Once we cycle through the arrays we restore the default color.
        const colors = ['#ED4F2F', '', '#ED4F2F'];
        const times = [400, 400, 400];
        if ($scope.highlightNextTabChange) {
            $scope.highlightNextTabChange = false;
            let index = 0;
            $(tabEvent.target).css('color', colors[index]);
            const highlightFun = function () {
                index++;
                if (index < colors.length) {
                    $(tabEvent.target).css('color', colors[index]);
                    tabEvent.target.timer = $timeout(highlightFun, times[index]);
                } else {
                    $(tabEvent.target).css('color', '');
                }
            };
            $timeout(highlightFun, times[index]);
        }
    });

    $scope.$on('deleteAllexeptSelected', function (e, tabs) {
        $scope.tabsData = tabs;
        $scope.tabs = tabs;
    });
    // end of query tab operations

    $scope.currentQuery = {};
    // $scope.state = {};
    $scope.showSampleQueries = false;
    $scope.savedQuery = {};
    $scope.sampleQueries = {};
    $scope.editQueryModal = showModal('#editQueryContainer');
    $scope.deleteQueryModal = showModal('#confirmDeleteContainer');
    $scope.saveQueryModal = showModal('#saveQueryContainer');

    $scope.getResultsDescription = function () {
        let desc;
        if ($scope.currentTabConfig.resultsCount === 0) {
            desc = "No results.";
        } else {
            const currentPageEnd = ($scope.currentTabConfig.page - 1) * $scope.currentTabConfig.pageSize
                + Math.min($scope.currentTabConfig.resultsCount, $scope.currentTabConfig.pageSize);
            desc = "Showing results from " + $filter('currency')($scope.currentTabConfig.offset, '', 0)
                + " to " + $filter('currency')(currentPageEnd, '', 0);
            if ($scope.currentTabConfig.allResultsCount > 0) {
                // Unsure total results count "of at least" happens if counting timed out or
                // counting was disabled and we got at least $pageSize + 1 results for the current page.
                // It may reset become exact when we navigate and reach the end of results.
                desc += $scope.currentTabConfig.allResultsCountExact
                    ? " of " : " of at least ";
                desc += $filter('currency')($scope.currentTabConfig.allResultsCount, '', 0);
            }
            desc += ".";
        }

        return desc;
    };

    $scope.getUpdateDescription = function () {
        if ($scope.currentTabConfig.customUpdateMessage) {
            return $scope.currentTabConfig.customUpdateMessage;
        } else if ($scope.currentTabConfig.sizeDelta === undefined) {
            return '';
        } else if ($scope.currentTabConfig.sizeDelta < 0) {
            return 'Removed ' + Math.abs($scope.currentTabConfig.sizeDelta) + ' statements.';
        } else if ($scope.currentTabConfig.sizeDelta > 0) {
            return 'Added ' + $scope.currentTabConfig.sizeDelta + ' statements.';
        } else {
            return 'The number of statements did not change.';
        }
    };

    $scope.getStaleWarningMessage = function () {
        const secondsAgo = Math.round((Date.now() - $scope.currentTabConfig.timeFinished) / 60000) * 60;
        if (secondsAgo >= 3600) { // must be at least an hour
            return "Possibly stale result (obtained " + $scope.getHumanReadableSeconds(secondsAgo) + " ago).";
        }
    };

    const resize = function () {
        // $scope.fixSizesOnHorizontalViewModeSwitch();
    };

    angular.element($window).bind('resize', resize);

    $scope.$on('$destroy', function () {
        angular.element($window).unbind('resize', resize);
    });

    /**
     * In case of Ontop repository, sameAs, inference and nocount are
     * overridden to true and #sameAs and #inference buttons are disabled, In case of FedX repo nocount is overridden
     */
    function overrideSameAsInferenceAndNoCountIfNeeded() {
        const isOntop = $repositories.isActiveRepoOntopType();
        const isFedX = $repositories.isActiveRepoFedXType();
        handleSameAsAndInferenceBtns(isOntop);

        $scope.nocount = (isOntop || isFedX) ? true : !principal.appSettings.EXECUTE_COUNT;
        if (isOntop) {
            $scope.currentQuery.inference = true;
            $scope.currentQuery.sameAs = true;
        }
    }

    function handleSameAsAndInferenceBtns(isOntop) {
        const sameAsBtn = document.getElementById('sameAs');
        const inferenceBtn = document.getElementById('inference');

        if (sameAsBtn) {
            sameAsBtn.disabled = !!isOntop;
        }

        if (inferenceBtn) {
            inferenceBtn.disabled = !!isOntop;
        }
    }

    // The sameAs is meaningless without inference.
    // Set its value to false and disable button
    function shouldDisableSameAs() {
        // don't try to override sameAs if repository is Ontop type
        if ($repositories.isActiveRepoOntopType()) {
            return;
        }
        const sameAsBtn = document.getElementById('sameAs');
        if (sameAsBtn && !$scope.currentQuery.inference && !sameAsBtn.disabled) {
            sameAsBtn.disabled = true;
            $scope.currentQuery.sameAs = false;
        } else if ($scope.currentQuery.inference && sameAsBtn.disabled) {
            sameAsBtn.removeAttribute('disabled');
            $scope.currentQuery.sameAs = principal.appSettings.DEFAULT_SAMEAS;
        }
    }
}

QuerySampleModalCtrl.$inject = ['$scope', '$modalInstance', 'data'];

function QuerySampleModalCtrl($scope, $modalInstance, data) {
    if (data.queryExists) {
        $scope.queryExists = true;
    }
    $scope.query = angular.copy(data.query);
    $scope.title = data.title;
    $scope.edit = data.edit;
    $scope.okButtonText = data.okButtonText;
    $scope.ok = function () {
        if ($scope.form.$valid) {
            $modalInstance.close($scope.query);
        }
    };

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };
}
