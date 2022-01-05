import 'angular/rest/connectors.rest.service';
import 'angular/utils/local-storage-adapter';
import 'angular/externalsync/controllers';
import YASQE from 'lib/yasqe.bundled';
import YASR from 'lib/yasr.bundled';

angular
    .module('graphdb.framework.core.directives.queryeditor.queryeditor', [
        'ngCookies',
        'graphdb.framework.externalsync.controllers',
        'graphdb.framework.rest.connectors.service',
        'graphdb.framework.utils.localstorageadapter'
    ])
    .directive('queryEditor', queryEditorDirective);

queryEditorDirective.$inject = ['$timeout', '$location', 'toastr', '$repositories', 'SparqlRestService', 'ModalService', '$modal', '$jwtAuth', 'RDF4JRepositoriesRestService', 'ConnectorsRestService', 'LocalStorageAdapter', 'LSKeys'];

function queryEditorDirective($timeout, $location, toastr, $repositories, SparqlRestService, ModalService, $modal, $jwtAuth, RDF4JRepositoriesRestService, ConnectorsRestService, LocalStorageAdapter, LSKeys) {

    let callbackOnChange;

    return {
        restrict: 'AE',
        scope: false,
        templateUrl: 'js/angular/core/directives/queryeditor/templates/query-editor.html',
        link: linkFunc
    };

    //function updateLineGutter() in Yasqe receive wrong data and line numbers div have width 100%
    // magic value 150 seems to work well (including Safari), smaller values work on other browsers but not always on Safari
    function linkFunc(scope, element, attrs) {
        // Doesn't store anything in local storage
        scope.nostorage = attrs.hasOwnProperty('nostorage');
        // Doesn't allow multiple tabs in the editor, only a single tab is active
        scope.notabs = attrs.hasOwnProperty('notabs');
        // Hides all the vertical toolbar inside the editor
        scope.notoolbar = attrs.hasOwnProperty('notoolbar');
        // Hides the saved queries icons in the toolbar
        scope.notoolbarSaved = attrs.hasOwnProperty('notoolbarSaved');
        // Hides the copy query link icon in the toolbar
        scope.notoolbarCopy = attrs.hasOwnProperty('notoolbarCopy');
        // Hides the inference icon in the toolbar
        scope.notoolbarInference = attrs.hasOwnProperty('notoolbarInference');
        // Hides the sameAs icon in the toolbar
        scope.notoolbarSameAs = attrs.hasOwnProperty('notoolbarSameAs');
        // Doesn't show any status messages in YASR (e.g. no results, query took that many seconds, etc)
        scope.nostatus = attrs.hasOwnProperty('nostatus');
        // Doesn't show the run button
        scope.norun = attrs.hasOwnProperty('norun');
        // Name of the Run button in the editor
        scope.runButtonName = "Run";
        if (attrs.runButtonName) {
            scope.runButtonName = attrs.runButtonName;
        }
        // Doesn't execute the count query
        scope.nocount = attrs.nocount === "true";

        // Custom callback to call when the content changes (fired within timeout of 200)
        if (attrs.callbackOnChange) {
            const callback = scope[attrs.callbackOnChange];
            if (typeof callback === 'function') {
                callbackOnChange = callback;
            }
        }

        $timeout(function () {
            drawQueryEditor(scope);
        }, 150);
    }

    function drawQueryEditor(scope) {
        scope.changePagination = changePagination;

        // start of keyboard shortcut actions
        function saveQueryAction() {
            angular.element('#wb-sparql-saveQuery')[0].click();
        }

        function runQueryAction() {
            scope.runQuery(false, false);
        }

        function explainQueryAction() {
            scope.runQuery(false, true);
        }

        function goToNextTabAction() {
            if (scope.tabs.length < 2 || !scope.currentQuery.id || !scope.isTabChangeOk(false)) {
                return;
            }
            let idx = findTabIndexByID(scope.currentQuery.id);
            idx = (idx + 1) % scope.tabs.length;
            const tab = scope.tabs[idx];
            selectTab(tab.id);
        }

        function goToPreviousTabAction() {
            if (scope.tabs.length < 2 || !scope.currentQuery.id || !scope.isTabChangeOk(false)) {
                return;
            }
            let idx = findTabIndexByID(scope.currentQuery.id);
            idx--;
            if (idx === -1) {
                idx = scope.tabs.length - 1;
            }
            const tab = scope.tabs[idx];
            selectTab(tab.id);
        }

        window.editor = YASQE.fromTextArea(
            document.getElementById("query"), {
                persistent: null,
                value: "",
                indentUnit: 4,
                createShareLink: null,
                cursorHeight: 1.0,
                sparql: {
                    showQueryButton: false,
                    acceptHeaderGraph: "application/x-graphdb-table-results+json, application/rdf+json;q=0.9, */*;q=0.8",
                    acceptHeaderSelect: "application/x-sparqlstar-results+json, application/sparql-results+json;q=0.9, */*;q=0.8"
                },
                // We provide a wrapper for executeQuery so we have to redefine those here
                extraKeys: {
                    "Ctrl-Enter": runQueryAction,
                    "Cmd-Enter": runQueryAction,
                    "Shift-Ctrl-Enter": explainQueryAction,
                    "Shift-Cmd-Enter": explainQueryAction,
                    "Ctrl-Alt-T": scope.addNewTab,
                    "Cmd-Alt-T": scope.addNewTab,
                    "Ctrl-S": saveQueryAction,
                    "Cmd-S": saveQueryAction,
                    "Ctrl-Alt-Left": goToPreviousTabAction,
                    "Cmd-Alt-Left": goToPreviousTabAction,
                    "Ctrl-Alt-Right": goToNextTabAction,
                    "Cmd-Alt-Right": goToNextTabAction
                }
            }
        );

        window.editor.toastBuildIndex = function () {
            toastr.warning('', '<div class="autocomplete-toast"><a href="autocomplete">Autocomplete is OFF<br>Go to Setup -> Autocomplete</a></div>',
                {allowHtml: true});
        };

        window.editor.toastError = function (data) {
            toastr.error('Cannot execute autocomplete query. ' + getError(data));
        };

        window.editor.on("changes", function () {
            angular.element('.CodeMirror-linenumbers').css('width', '1px');
            angular.element('.CodeMirror-sizer').css('margin-left', '0px');
            clearTimeout(scope.changesTimeout);
            const hasError = !window.editor.queryValid;
            scope.changesTimeout = setTimeout(callbackOnChange ? callbackOnChange() : function () {
                const idx = findTabIndexByID(scope.currentQuery.id) + 1;
                $('a[data-id = "' + idx + '"]')
                    .toggleClass('query-has-error', hasError)
                    .attr('title', hasError ?
                        'Query contains a syntax error. See the relevant line for more information.' :
                        '');
            }, 200);
            scope.currentQuery.query = window.editor.getValue();
            scope.currentQuery.queryType = window.editor.getQueryType();
        });


        function selectTab(id) {
            $timeout(function () {
                let requestedTab = $('a[data-id = "' + id + '"]');
                if (requestedTab.length === 0) {
                    // tab has been deleted in another browser window or something else occurred,
                    // select first tab instead
                    requestedTab = $('a[data-id]').first();
                }
                requestedTab.tab('show');
            }, 0);
        }

        // hide unneeded yasqe fullscreen button
        $(".fullscreenToggleBtns").hide();

        const afterCopy = function (event) {
            $(event.target).removeClass('fa-link').addClass('fa-check').blur();
            setTimeout(function () {
                $(event.target).removeClass('fa-check').addClass('fa-link');
            }, 1000);
        };

        window.onbeforeunload = function () {
            if (!scope.nostorage) {
                LocalStorageAdapter.set(LSKeys.TABS_STATE, scope.tabs);
            }
            scope.saveTab(scope.currentQuery.id);
        };

        /*
         * Patch the execute query to take into account the inference
         * and the same as options
         */
        const originalExecuteQuery = YASQE.executeQuery;
        const originalGetUrlArguments = YASQE.getUrlArguments;

        scope.$on('$destroy', function () {
            if (!scope.nostorage) {
                LocalStorageAdapter.set(LSKeys.TABS_STATE, scope.tabs);
            }
            YASQE.executeQuery = originalExecuteQuery;
            YASQE.getUrlArguments = originalGetUrlArguments;
            scope.saveTab(scope.currentQuery.id);
        });

        /*
         * Add our own buttons
         */
        YASQE.drawButtons = function (yasqe) {
            // Define this property because otherwise there are errors in yasgui's code.
            yasqe.buttons = $("#yasqe_buttons_mocked");
        };

        YASQE.getActiveRepository = function () {
            return $repositories.getActiveRepository();
        };

        YASQE.getUrlArguments = function (yasqe, config) {
            const data = originalGetUrlArguments(yasqe, config);
            const qType = window.editor.getQueryType();
            if ('SELECT' === qType || 'CONSTRUCT' === qType || 'DESCRIBE' === qType) {
                // We request pageSize + 1 to know if there are more pages when total count isn't known
                data.push({name: 'limit', value: scope.currentTabConfig.pageSize + 1});
                scope.currentTabConfig.offset = (scope.currentTabConfig.page - 1) * scope.currentTabConfig.pageSize + 1;
                data.push({name: 'offset', value: scope.currentTabConfig.offset - 1});
            }
            // even though we have explainRequested in our scope too it doesn't always contain a fresh value
            if (scope.explainRequested && ('SELECT' === qType || 'CONSTRUCT' === qType)) {
                data.push({name: 'explain', value: 'true'});
            }
            return data;
        };

        function createCustomError(status, statusText, responseText) {
            return {
                status: status,
                statusText: statusText,
                responseText: responseText
            };
        }

        // Generates a new tracking alias for queries based on time
        function newTrackAlias() {
            return "query-editor-" + performance.now() + "-" + Date.now();
        }

        let connectorProgressModal;
        let yasr;

        YASQE.executeQuery = function (cm) {
            if (yasr && $(yasr.resultsContainer).length) {
                $(yasr.resultsContainer).empty();
            }
            // Request extra error/warning handling
            cm.options.sparql.headers['X-GraphDB-Catch'] = scope.currentTabConfig.pageSize + '; throw';
            scope.currentTrackAlias = newTrackAlias();
            cm.options.sparql.headers['X-GraphDB-Track-Alias'] = scope.currentTrackAlias;
            scope.countTimeouted = false;
            if (cm.getQueryMode() === 'query') {
                cm.options.sparql.endpoint = 'repositories/' + $repositories.getActiveRepository();
            } else if (cm.getQueryMode() === 'update') {
                cm.options.sparql.endpoint = 'repositories/' + $repositories.getActiveRepository() + '/statements';
            }
            cm.options.sparql.args = [{
                name: 'infer',
                value: scope.currentQuery.inference
            },
                {
                    name: 'sameAs',
                    value: scope.currentQuery.sameAs
                }];

            scope.currentTabConfig.customUpdateMessage = "";

            if (window.editor.getQueryMode() === "update") {
                const doExecute = function () {
                    scope.currentTabConfig.queryType = "UPDATE";

                    RDF4JRepositoriesRestService.getRepositorySize()
                        .success(function (data) {
                            scope.repoSize = parseInt(data);
                            scope.queryStartTime = new Date().getTime();
                            return originalExecuteQuery(cm, {});
                        })
                        .error(function (data) {
                            toastr.warning('Could not get repository size for: ' + $repositories.getActiveRepository() + '; ' + getError(data));
                            scope.queryStartTime = new Date().getTime();
                            return originalExecuteQuery(cm, {});
                        });
                };

                ConnectorsRestService.checkConnector(window.editor.getValue())
                    .then(function (res) {
                        if (res.data.command && !res.data.hasSupport) {
                            // it's a connector query but the relevant plugin isn't active, stop executing and warn the user
                            scope.currentTabConfig.queryType = 'ERROR';
                            scope.currentTabConfig.timeFinished = Date.now();
                            scope.currentTabConfig.timeTook = (scope.currentTabConfig.timeFinished - scope.queryStartTime) / 1000;

                            const customError = createCustomError(-1, 'No support for ' + res.data.connectorName, res.data.connectorName
                                + ' connectors are not supported because the plugin ' + res.data.pluginName + ' is not active.');

                            yasr.results = {
                                getException: function () {
                                    return customError;
                                }
                            };

                            scope.setLoader(false);

                            setNewTabState({customError: customError}, '', null);

                            return;
                        }

                        if (res.data.command === 'create' || res.data.command === 'repair') {
                            const repair = res.data.command === 'repair';
                            if (repair) {
                                scope.setLoader(true, 'Repairing connector ' + res.data.name);
                                scope.currentTabConfig.customUpdateMessage = 'Repaired connector ' + res.data.name + '.';
                            } else {
                                scope.setLoader(true, 'Creating connector ' + res.data.name);
                                scope.currentTabConfig.customUpdateMessage = 'Created connector ' + res.data.name + '.';
                            }

                            const progressScope = scope.$new(true);

                            // This duplicates code in the externalsync module but we can't get it from there
                            progressScope.beingBuiltConnector = {
                                percentDone: 0,
                                status: {
                                    processedEntities: 0,
                                    estimatedEntities: 0,
                                    indexedEntities: 0,
                                    entitiesPerSecond: 0
                                },
                                actionName: repair ? 'Repairing' : 'Creating',
                                eta: "-",
                                inline: false,
                                iri: res.data.iri,
                                name: res.data.name,
                                doneCallback: function () {
                                    connectorProgressModal.dismiss('cancel');
                                }
                            };
                            progressScope.getHumanReadableSeconds = scope.getHumanReadableSeconds;

                            connectorProgressModal = $modal.open({
                                templateUrl: 'pages/connectorProgress.html',
                                controller: 'CreateProgressCtrl',
                                size: 'lg',
                                backdrop: 'static',
                                scope: progressScope
                            });
                        } else if (res.data.command === 'drop') {
                            scope.setLoader(true, 'Deleting connector ' + res.data.name);
                            scope.currentTabConfig.customUpdateMessage = 'Deleted connector ' + res.data.name + '.';
                        }

                        doExecute();
                    }, function () {
                        // for some reason we couldn't check if this is a connector update, so just execute it
                        doExecute();
                    });

            } else {
                const thisTabConfig = scope.currentTabConfig;
                const thisTabId = scope.executedQueryTab.id;

                // Assign a fresh callback function so that we can associate the count result
                // with the right tab (or lack of tab).
                window.editor.options.sparql.handlers.countCallback = function (dataOrJqXhr, textStatus, jqXhrOrErrorString) {
                    if (dataOrJqXhr.status === 200) {
                        const tab = scope.tabs[findTabIndexByID(thisTabId)];
                        if (tab) {
                            yasr.setResultsCount(dataOrJqXhr, textStatus, jqXhrOrErrorString);
                            thisTabConfig.allResultsCount = yasr.allCount;
                            tab.allResultsCount = yasr.allCount;
                            thisTabConfig.allResultsCountExact = true;
                            tab.allResultsCountExact = true;
                            scope.saveTab(tab.id);
                        } // Else tab was closed while we wait for the count, ignore result
                    } else {
                        // count query timed out or something else went wrong
                        thisTabConfig.countTimeouted = true;
                    }
                };

                // Tell YASR what format we want, or else it will mess it up when switching between tabs.
                if (scope.currentQuery.outputType != null) {
                    yasr.options.output = scope.currentQuery.outputType;
                } else { // Default to table if no format has been configured yet.
                    yasr.options.output = "table";
                }
                scope.currentTabConfig.queryType = window.editor.getQueryType();
                scope.queryStartTime = new Date().getTime();
                return originalExecuteQuery(cm, {
                    setQueryLimit: function (query) {
                        // Until weird conversion of CONSTRUCT queries is fixed
                        // in Ontop project, comments should be removed from them
                        // TODO: Remove this check when ${link https://github.com/ontop/ontop/issues/362} is fixed
                        if (scope.currentTabConfig.queryType === 'CONSTRUCT' && $repositories.isActiveRepoOntopType()) {
                            return window.editor.getValueWithoutComments();
                        }
                        // For all types of queries we handle limit/offset in our RepositoriesController.
                        // TODO: Get rid of this method
                        return query;
                    }
                });
            }

        };

        // Override yasqe's getAjaxConfig() so we can inject our authorization header
        const originalGetAjaxConfig = YASQE.getAjaxConfig;
        YASQE.getAjaxConfig = function (yasqe, callbackOrConfig) {
            const config = originalGetAjaxConfig(yasqe, callbackOrConfig);

            _.extend(config.headers, {
                'Authorization': $jwtAuth.getAuthToken()
            });

            return config;
        };

        function createQueryURL(savedQueryName, owner) {
            let url = [location.protocol, '//', location.host, location.pathname].join('');
            if (savedQueryName) {
                url = url + '?savedQueryName=' + encodeURIComponent(savedQueryName);
                if (owner != null) {
                    url += '&owner=' + encodeURIComponent(owner);
                }
            } else {
                url = url + '?' + $.param({
                    name: scope.currentQuery.name,
                    infer: scope.currentQuery.inference,
                    sameAs: scope.currentQuery.sameAs,
                    query: window.editor.getValue()
                });
            }
            return url;
        }

        scope.copyToClipboardQuery = function (savedQueryName, owner) {
            ModalService.openCopyToClipboardModal(createQueryURL(savedQueryName, owner));
        };

        scope.copyToClipboardResult = function (resultURI) {
            ModalService.openCopyToClipboardModal(resultURI);
        };

        scope.goToVisual = function () {
            const paramsToParse = {
                query: window.editor.getValue(),
                sameAs: scope.currentQuery.sameAs,
                inference: scope.currentQuery.inference
            };

            $location.path('graphs-visualizations').search(paramsToParse);
        };

        // Adds prefixes when the user pastes a query. This was in the controller before and it stopped working
        // (needs to happen to after YASQE adds the textarea), see GDB-1936
        $('textarea').on('paste', function () {
            $timeout(function () {
                scope.addKnownPrefixes();
            }, 0);
        });

        function setNewTabState(dataOrJqXhr, textStatus, jqXhrOrErrorString) {
            // store explicitly the contentType
            if (dataOrJqXhr.getResponseHeader && dataOrJqXhr.getResponseHeader("content-type")) {
                dataOrJqXhr.contentType = dataOrJqXhr.getResponseHeader("content-type");
            }

            // We use this when we set YASR results to avoid double JSON parsing and to enforce
            // using the modified responseJSON. We'll save responseJSON instead (no need to save both).
            delete dataOrJqXhr.response;

            const executedQueryTabIdx = findTabIndexByID(scope.executedQueryTab.id);
            const executedQueryTab = scope.tabs[executedQueryTabIdx];
            const queryResultState = {
                    queryType: scope.currentTabConfig.queryType,
                    yasrData: dataOrJqXhr,
                    textStatus: textStatus,
                    jqXhrOrErrorString: jqXhrOrErrorString,
                    page: scope.currentTabConfig.page,
                    pageSize: scope.currentTabConfig.pageSize,
                    allResultsCount: scope.currentTabConfig.allResultsCount,
                    allResultsCountExact: scope.currentTabConfig.allResultsCountExact,
                    resultsCount: scope.currentTabConfig.resultsCount,
                    offset: scope.currentTabConfig.offset,
                    timeTook: scope.currentTabConfig.timeTook,
                    timeFinished: scope.currentTabConfig.timeFinished,
                    sizeDelta: scope.currentTabConfig.sizeDelta,
                    customUpdateMessage: scope.currentTabConfig.customUpdateMessage,
                    errorMessage: scope.currentTabConfig.errorMessage,
                    warningMessage: scope.currentTabConfig.warningMessage
                };

            // Save the output type only if it isn't an update or an ask query.
            // This way we preserve the existing output type when we execute an update and then
            // execute a non-ask query.
            if (scope.currentTabConfig.queryType !== "ERROR" && scope.currentTabConfig.queryType !== "UPDATE"
                && scope.currentTabConfig.queryType !== "ASK") {
                queryResultState.outputType = scope.yasr.options.output;
            }

            // merge query results state with the tab object
            angular.extend(scope.currentQuery, queryResultState);

            angular.extend(executedQueryTab, queryResultState);
            if (!scope.nostorage) {
                LocalStorageAdapter.set(LSKeys.TABS_STATE, scope.tabs);
            }
            $('a[data-id = "' + scope.executedQueryTab.id + '"]').tab('show');
        }

        function initYasr() {
            yasr = YASR(document.getElementById("yasr"), { // eslint-disable-line new-cap
                getUsedPrefixes: {}, // initially blank, populated when we fetch the namespaces
                persistency: false
            });
            window.yasr = yasr;
            yasr.afterCopy = afterCopy;
            yasr.getQueryResultsAsFormat = function (downloadFormat) {
                // Simple cross-browser download with a form
                const $wbDownload = $('#wb-download');
                $wbDownload.attr('action', 'repositories/' + $repositories.getActiveRepository());
                $('#wb-download-query').val(scope.currentQuery.query);
                if (window.editor.getValue() !== scope.currentQuery.query) {
                    toastr.warning('The query in your editor does not match the query results. Download will save the results from the last executed query.');
                }
                $('#wb-download-infer').val(scope.currentQuery.inference);
                $('#wb-download-sameAs').val(scope.currentQuery.sameAs);
                const auth = localStorage.getItem('com.ontotext.graphdb.auth');
                if (auth) {
                    $('#wb-auth-token').val(auth);
                }
                $('#wb-download-accept').val(downloadFormat);
                $wbDownload.submit();
            };
            window.editor.options.sparql.handlers.complete = function (dataOrJqXhr, textStatus, jqXhrOrErrorString) {
                function setNewTabStateForThis() {
                    setNewTabState(dataOrJqXhr, textStatus, jqXhrOrErrorString);
                }

                if (connectorProgressModal) {
                    connectorProgressModal.dismiss('cancel');
                }

                // If yasqe was destroyed when scope was destroyed, do nothing
                if (null === window.editor) {
                    scope.setLoader(false);

                    return;
                }

                // Extra error/warning through headers
                scope.currentTabConfig.errorMessage = dataOrJqXhr.getResponseHeader('X-GraphDB-Error');
                scope.currentTabConfig.warningMessage = dataOrJqXhr.getResponseHeader('X-GraphDB-Warning');

                yasr.currentQuery = scope.currentQuery;

                scope.currentTabConfig.timeFinished = Date.now();
                scope.currentTabConfig.timeTook = (scope.currentTabConfig.timeFinished - scope.queryStartTime) / 1000;

                if (dataOrJqXhr.status >= 400) {
                    // Removes useless com.blah.whatever.FooException: ... from the error message
                    dataOrJqXhr.responseText = dataOrJqXhr.responseText.replace(/^([^: ]+: )+/, '');

                    scope.currentTabConfig.queryType = 'ERROR';
                    setNewTabStateForThis();
                    scope.setYasrResponse(dataOrJqXhr, textStatus, jqXhrOrErrorString);

                    scope.setLoader(false);

                    return;
                }

                if (dataOrJqXhr.status === 0) {
                    // Query was aborted, typically through window.editor.xhr.abort()

                    scope.currentTabConfig.queryType = 'ERROR';

                    const customError = createCustomError(-1, 'Request was aborted', 'The request has been aborted. There are no results to show.');

                    yasr.results = {
                        getException: function () {
                            return customError;
                        }
                    };

                    scope.setLoader(false);

                    setNewTabState({customError: customError}, '', null);

                    return;
                }

                scope.setLoader(false);

                let updateResultsCallback;

                if (window.editor.getQueryMode() === "update") {
                    updateResultsCallback = function () {
                        RDF4JRepositoriesRestService.getRepositorySize()
                            .success(function (data) {
                                let repoSizeDiff;
                                if (scope.repoSize !== undefined) {
                                    repoSizeDiff = Number(data) - scope.repoSize;
                                }
                                scope.currentTabConfig.sizeDelta = repoSizeDiff;
                                setNewTabStateForThis();
                            }).error(function (data) {
                                toastr.warning('Could not get repository size for: ' + scope.getActiveRepository() + '; ' + getError(data));
                                scope.currentTabConfig.sizeDelta = undefined;
                                setNewTabStateForThis();
                            });
                    };
                } else {
                    if (dataOrJqXhr.status === 200) {
                        const contentType = dataOrJqXhr.getResponseHeader('Content-Type');

                        if (contentType.indexOf('application/sparql-results+json') === 0
                            || contentType.indexOf('application/x-sparqlstar-results+json') === 0
                            || contentType.indexOf('application/x-graphdb-table-results+json') === 0) {
                            if (dataOrJqXhr.responseJSON.results) {
                                // SELECT results in one of the standard formats or
                                // CONSTRUCT or DESCRIBE results in our custom format that looks
                                // like a SELECT result.
                                scope.currentTabConfig.resultsCount = dataOrJqXhr.responseJSON.results.bindings.length;
                                if (dataOrJqXhr.responseJSON.results.bindings.length > scope.currentTabConfig.pageSize) {
                                    // The results are more than the page size (because we request +1), truncate to page size
                                    // and raise flag to know we have at least one page more.
                                    dataOrJqXhr.responseJSON.results.bindings.length = scope.currentTabConfig.pageSize;
                                }
                                if (!scope.currentTabConfig.allResultsCountExact) {
                                    if (scope.nocount || scope.countTimeouted
                                        || scope.currentTabConfig.resultsCount <= scope.currentTabConfig.pageSize) {
                                        // No count requested or count timed out or the results are less than the pageSize + 1 buffer
                                        // In all of these cases it doesn't make sense to run
                                        // the counting query so we tweak the status to signal that to YASQE.
                                        dataOrJqXhr.status = 204; // 204 is no content, YASQE counts only if status is 200
                                    }

                                    // Calculate an "at least" all results count, i.e. at least what we have until now + 1.
                                    // The number will increase when we go to the next page eventually reaching the exact count.
                                    // A count query may also provide the exact count asynchronously.
                                    scope.currentTabConfig.allResultsCount = Math.max(scope.currentTabConfig.allResultsCount,
                                        scope.currentTabConfig.pageSize * (scope.currentTabConfig.page - 1) + scope.currentTabConfig.resultsCount);

                                    // We know we reached the end and the count is exact now.
                                    if (scope.currentTabConfig.resultsCount <= scope.currentTabConfig.pageSize) {
                                        scope.currentTabConfig.allResultsCountExact = true;
                                    }
                                }
                            }
                        }
                    }

                    // The following long-running code needs to be in timeout to get the updated loader message
                    scope.setLoader(true, 'Rendering results', null, true);

                    updateResultsCallback = function () {
                        scope.setYasrResponse(dataOrJqXhr, textStatus, jqXhrOrErrorString);

                        setNewTabStateForThis();
                        scope.setLoader(false);
                    };
                }

                // By having this in timeout we manage to get the updated loader message
                $timeout(function () {
                    updateResultsCallback();

                    // Move disabled class to a, and clean from the li
                    if (window.editor.getQueryType() !== "CONSTRUCT") {
                        $('.yasr_btnGroup.nav.nav-tabs li a.disabled').removeClass('disabled').css('font-weight', '400');
                        $('.yasr_btnGroup.nav.nav-tabs li.disabled a').addClass('disabled').css('font-weight', '200');
                        if (window.editor.getQueryType() === "DESCRIBE") {
                            $('.yasr_btnGroup.nav.nav-tabs li a').removeClass('disabled').css('font-weight', '400');
                        }
                    } else if (window.editor.getQueryType() === "CONSTRUCT") {
                        $('.yasr_btnGroup.nav.nav-tabs li a.disabled').removeClass('disabled').css('font-weight', '400');
                    }


                    //Remove paddign of yasr so it will be aligned with sparql editor
                    $('#yasr').css('padding', '0');

                    if ($('.yasr_btnGroup li:nth-child(2)').hasClass("active")) {
                        $timeout(function () {
                            $('.yasr_btnGroup li:nth-child(2) a').get(0).click();
                        }, 100);
                    }

                    //
                    $('#wb-sparql-addNewTab').click(function () {
                        $('.dataTables_filter').hide();
                        $('.resultsTable').hide();
                    });
                }, 100);
            };

            window.editor.options.sparql.handlers.resetResults = function () {
            };

            scope.yasr = yasr;

            scope.setYasrResponse = function(dataOrJqXhr, textStatus, jqXhrOrErrorString) {
                // If YASR doesn't see a "response" property it will parse the textual JSON in "responseText".
                // This is both slow and interferes with the +1 result per page policy when we truncate responseJSON.
                if (dataOrJqXhr.responseJSON) {
                    dataOrJqXhr.response = dataOrJqXhr.responseJSON;
                    dataOrJqXhr.responseText = undefined;
                }
                window.yasr.plugins.table.options.highlightLiteralCellResult = highlightExplainPlan;
                yasr.setResponse(dataOrJqXhr, textStatus, jqXhrOrErrorString);
            };

            // Track changes in the output type (tab in yasr) so that we can save this together with
            // the rest of the tab's data.
            scope.$watch('yasr.options.output', function (value) {
                // Save the output type only if it isn't an update or an ask query (see comment where we save all properties).
                if (value && scope.currentTabConfig.queryType !== "UPDATE" && scope.currentTabConfig.queryType !== "ASK") {
                    const tab = scope.tabs[findTabIndexByID(scope.currentQuery.id)];
                    // Do not save tab on default yasr initalization since default table overrides saved value
                    if (angular.isDefined(tab) && scope.currentTabConfig.queryType) {
                        if (tab.outputType !== value) {
                            tab.outputType = scope.currentQuery.outputType = value;
                            scope.saveTab(tab.id);
                        }
                    }
                }
            });

            scope.$watch('namespaces', function () {
                if (scope.namespaces) {
                    if (yasr && yasr.options && scope.namespaces) {
                        // this way, the URLs in the results are prettified using the defined prefixes
                        yasr.options.getUsedPrefixes = scope.namespaces;
                    }

                    // Notify YASQE about the new namespaces
                    YASQE.signal(window.editor, 'namespacesChanged', scope.namespaces);
                }
            });
        }

        initYasr();

        function changePagination() {
            scope.runQuery(true, scope.explainRequested);
        }

        function highlightExplainPlan() {
            if (window.editor.getValue().includes('onto:explain') || window.editor.getValue().includes('http://www.ontotext.com/explain')) {
                var queryResultElement = document.getElementsByClassName('nonUri')[0];
                queryResultElement.classList.add("cm-s-default");
                queryResultElement.setAttribute("id", "highlighted_output");
                var queryResultValue = queryResultElement.innerText.substring(1, queryResultElement.innerText.length - 1);
                queryResultElement.innerHTML = "";
                YASQE.runMode(queryResultValue, "sparql11", document.getElementById("highlighted_output"));
            }
        }

        // Hide the sample queries when the user clicks somewhere else in the UI.
        $(document).mouseup(function (event) {
            const container = $('#sampleQueriesCollapse');
            if (!container.is(event.target) // if the target of the click isn't the container..
                && container.has(event.target).length === 0 //... nor a descendant of the container
                && scope.showSampleQueries) {
                scope.toggleSampleQueries();
            }
        });

        function findTabIndexByID(id) {
            for (let i = 0; i < scope.tabs.length; i++) {
                const tab = scope.tabs[i];
                if (tab.id === id) {
                    return i;
                }
            }
        }

        // functions to load query param or saved queries
        function toBoolean(v) {
            return angular.isDefined(v) && v !== 'false';
        }

        function autoexecuteQueryIfRequested() {
            const isRequested = toBoolean($location.search().execute);

            if (isRequested) {
                if (window.editor.getQueryMode() === 'update') {
                    ModalService.openSimpleModal({
                        title: 'Confirm execute',
                        message: 'This is an update and it may change the data in the repository.<br>Are you sure you want to execute it automatically?',
                        warning: true
                    }).result
                        .then(function () {
                            scope.runQuery(false);
                        });
                } else {
                    scope.runQuery(false);
                }
            }
        }

        function loadQueryIntoExistingOrNewTab(query, infer, sameAs) {
            const tabId = scope.getExistingTabId(query);
            // Ah, the joys of non-synchronous events
            const onHandler = scope.$on('tabLoaded', function () {
                if (angular.isDefined(infer)) {
                    scope.currentQuery.inference = toBoolean(infer);
                }
                if (angular.isDefined(sameAs)) {
                    scope.currentQuery.sameAs = toBoolean(sameAs);
                }
                autoexecuteQueryIfRequested();
                onHandler();
            });

            // See comment about this flag in controller. It's a good idea to be consistent and do this
            // every time a tab changes without the user clicking on it.
            scope.highlightNextTabChange = true;

            if (!angular.isDefined(tabId)) {
                scope.addNewTab(null, query.name, query.body);
            } else {
                selectTab(tabId);
            }
        }

        function loadSavedQueryIntoExistingOrNewTab(savedQueryName, owner, infer, sameAs) {
            SparqlRestService.getSavedQuery(savedQueryName, owner)
                .success(function (data) {
                    loadQueryIntoExistingOrNewTab(data, infer, sameAs);
                })
                .error(function (data) {
                    toastr.error('Could not get data for saved query: ' + savedQueryName + '; ' + getError(data));
                });
        }

        function addTabWithQueryIfNeeded() {
            if ($location.search().savedQueryName) {
                // new way
                loadSavedQueryIntoExistingOrNewTab($location.search().savedQueryName, $location.search().owner,
                    $location.search().infer, $location.search().sameAs);
            } else if ($location.search().query) {
                const query = {name: $location.search().name, body: $location.search().query};
                loadQueryIntoExistingOrNewTab(query, $location.search().infer, $location.search().sameAs);
            } else {
                // Restore the previous tab after the dom has loaded
                const currentid = LocalStorageAdapter.get(LSKeys.TABS_STATE_CURRENT_ID);
                selectTab(currentid);
            }
        }

        function updateRepositoryAndSecurity() {
            scope.getNamespaces();
            YASQE.signal(window.editor, "repositoryOrAuthorizationChanged",
                $repositories.getActiveRepository(), $jwtAuth.getAuthToken());
            addTabWithQueryIfNeeded();
        }

        if ($repositories.getActiveRepository()) {
            updateRepositoryAndSecurity();
        }

        // When no repo is selected (editor hidden) and the user selects a repo the SPARQL params should be handled
        scope.$on('repositoryIsSet', function () {
            if ($repositories.getActiveRepository()) {
                updateRepositoryAndSecurity();
            }
        });
        // end of repository actions

        // focus the editor
        $timeout(function () {
            angular.element(document).find('.CodeMirror textarea:first-child').focus();
        }, 50);

    }
}
