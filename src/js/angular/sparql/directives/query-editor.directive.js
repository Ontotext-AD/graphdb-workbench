import 'lib/bootstrap/bootstrap.min';
import YASQE from 'lib/yasqe.bundled.min';
import YASR from 'lib/yasr.bundled';

angular
    .module('graphdb.framework.sparql.directives.queryeditor', [])
    .directive('queryEditor', queryEditorDirective);

queryEditorDirective.$inject = ['$timeout', 'localStorageService', '$location', 'toastr', '$cookies', '$repositories', 'SparqlService', 'ModalService', '$modal', '$http', '$jwtAuth'];

function queryEditorDirective($timeout, localStorageService, $location, toastr, $cookies, $repositories, SparqlService, ModalService, $modal, $http, $jwtAuth) {
    return {
        restrict: 'AE',
        scope: false,
        templateUrl: 'js/angular/sparql/templates/query-editor.html',
        link: linkFunc
    };

    var callbackOnChange;

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
            var callback = scope[attrs.callbackOnChange];
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
            var idx = findTabIndexByID(scope.currentQuery.id);
            idx = (idx + 1) % scope.tabs.length;
            var tab = scope.tabs[idx];
            selectTab(tab.id);
        }

        function goToPreviousTabAction() {
            if (scope.tabs.length < 2 || !scope.currentQuery.id || !scope.isTabChangeOk(false)) {
                return;
            }
            var idx = findTabIndexByID(scope.currentQuery.id);
            idx--;
            if (idx === -1) {
                idx = scope.tabs.length - 1;
            }
            var tab = scope.tabs[idx];
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
                    acceptHeaderGraph: "application/rdf+json,*/*;q=0.9"
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
            var hasError = !window.editor.queryValid;
            scope.changesTimeout = setTimeout(callbackOnChange ? callbackOnChange() : function () {
                var idx = findTabIndexByID(scope.currentQuery.id) + 1;
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
                var requestedTab = $('a[data-id = "' + id + '"]');
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

        var afterCopy = function (event) {
            $(event.target).removeClass('fa-link');
            $(event.target).addClass('fa-check');
            $(event.target).blur();
            setTimeout(function () {
                $(event.target).removeClass('fa-check');
                $(event.target).addClass('fa-link');
            }, 1000);
        };

        window.onbeforeunload = function (event) {
            if (!scope.nostorage) {
                localStorageService.set('tabs-state', scope.tabs);
            }
            scope.saveTab(scope.currentQuery.id);
        };


        scope.$on('$destroy', function () {
            if (!scope.nostorage) {
                localStorageService.set('tabs-state', scope.tabs);
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

        var originalGetUrlArguments = YASQE.getUrlArguments;
        YASQE.getUrlArguments = function (yasqe, config) {
            var data = originalGetUrlArguments(yasqe, config);
            var qType = window.editor.getQueryType();
            if ('SELECT' === qType || 'CONSTRUCT' === qType || 'DESCRIBE' === qType) {
                data.push({name: 'limit', value: scope.currentTabConfig.pageSize});
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
            }
        }

        // Generates a new tracking alias for queries based on time
        function newTrackAlias() {
            return "query-editor-" + performance.now() + "-" + Date.now();
        }

        var connectorProgressModal;

        /*
         * Patch the execute query to take into account the inference
         * and the same as options
         */
        var originalExecuteQuery = YASQE.executeQuery;
        YASQE.executeQuery = function (cm, callBackOrConfig) {
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
            var infElements = $('#inference');
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
                var doExecute = function () {
                    scope.currentTabConfig.queryType = "UPDATE";

                    SparqlService.getRepositorySize()
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

                $http.post('rest/connectors/check', window.editor.getValue(), {
                    headers: {
                        'Content-Type': 'text/plain'
                    }
                })
                    .then(function (res) {
                        if (res.data.command && !res.data.hasSupport) {
                            // it's a connector query but the relevant plugin isn't active, stop executing and warn the user
                            scope.currentTabConfig.queryType = 'ERROR';
                            scope.currentTabConfig.timeFinished = Date.now();
                            scope.currentTabConfig.timeTook = (scope.currentTabConfig.timeFinished - scope.queryStartTime) / 1000;

                            var customError = createCustomError(-1, 'No support for ' + res.data.connectorName, res.data.connectorName
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
                            var repair = res.data.command === 'repair';
                            if (repair) {
                                scope.setLoader(true, 'Repairing connector ' + res.data.name);
                                scope.currentTabConfig.customUpdateMessage = 'Repaired connector ' + res.data.name + '.';
                            } else {
                                scope.setLoader(true, 'Creating connector ' + res.data.name);
                                scope.currentTabConfig.customUpdateMessage = 'Created connector ' + res.data.name + '.';
                            }

                            var progressScope = scope.$new(true);

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
                    }, function (err) {
                        // for some reason we couldn't check if this is a connector update, so just execute it
                        doExecute();
                    });

            } else {
                // Tell YASR what format we want, or else it will mess it up when switching between tabs.
                if (scope.currentQuery.outputType != null) {
                    yasr.options.output = scope.currentQuery.outputType;
                } else {  // Default to table if no format has been configured yet.
                    yasr.options.output = "table";
                }
                scope.currentTabConfig.queryType = window.editor.getQueryType();
                scope.queryStartTime = new Date().getTime();
                return originalExecuteQuery(cm, {
                    setQueryLimit: function (query) {
                        // For all types of queries we handle limit/offset in our RepositoriesController.
                        // TODO: Get rid of this method
                        return query;
                    }
                });
            }

        };

        // Override yasqe's getAjaxConfig() so we can inject our authorization header
        var originalGetAjaxConfig = YASQE.getAjaxConfig;
        YASQE.getAjaxConfig = function (yasqe, callbackOrConfig) {
            var config = originalGetAjaxConfig(yasqe, callbackOrConfig);

            _.extend(config.headers, {
                'Authorization': $jwtAuth.getAuthToken()
            });

            return config;
        };

        function createQueryURL(savedQueryName, owner) {
            var url = [location.protocol, '//', location.host, location.pathname].join('');
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
            var paramsToParse = {
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

            var executedQueryTabIdx = findTabIndexByID(scope.executedQueryTab.id),
                executedQueryTab = scope.tabs[executedQueryTabIdx],
                queryResultState = {
                    queryType: scope.currentTabConfig.queryType,
                    yasrData: dataOrJqXhr,
                    textStatus: textStatus,
                    jqXhrOrErrorString: jqXhrOrErrorString,
                    page: scope.currentTabConfig.page,
                    pageSize: scope.currentTabConfig.pageSize,
                    allResultsCount: scope.currentTabConfig.allResultsCount,
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
                localStorageService.set('tabs-state', scope.tabs);
            }
            $('a[data-id = "' + scope.executedQueryTab.id + '"]').tab('show');
        }

        var yasr;

        function initYasr() {
            yasr = YASR(document.getElementById("yasr"), {
                getUsedPrefixes: {}, // initially blank, populated when we fetch the namespaces
                persistency: false
            });
            window.yasr = yasr;
            yasr.afterCopy = afterCopy;
            yasr.getQueryResultsAsFormat = function (downloadFormat) {
                // Simple cross-browser download with a form
                $('#wb-download').attr('action', 'repositories/' + $repositories.getActiveRepository());
                $('#wb-download-query').val(scope.currentQuery.query);
                if (window.editor.getValue() !== scope.currentQuery.query) {
                    toastr.warning('The query in your editor does not match the query results. Download will save the results from the last executed query.');
                }
                $('#wb-download-infer').val(scope.currentQuery.inference);
                var cookie = $cookies['com.ontotext.graphdb.auth' + $location.port()];
                if (cookie) {
                    $('#wb-auth-token').val(cookie);
                }
                $('#wb-download-accept').val(downloadFormat);
                $('#wb-download').submit();
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
                    yasr.setResponse(dataOrJqXhr, textStatus, jqXhrOrErrorString);

                    scope.setLoader(false);

                    return;
                }

                if (dataOrJqXhr.status === 0) {
                    // Query was aborted, typically through window.editor.xhr.abort()

                    scope.currentTabConfig.queryType = 'ERROR';

                    var customError = createCustomError(-1, 'Request was aborted', 'The request has been aborted. There are no results to show.');

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

                var updateResultsCallback;

                if (window.editor.getQueryMode() === "update") {
                    updateResultsCallback = function () {
                        SparqlService.getRepositorySize()
                            .success(function (data) {
                                var repoSizeDiff;
                                if (scope.repoSize !== undefined) {
                                    repoSizeDiff = Number(data) - scope.repoSize;
                                }
                                scope.currentTabConfig.sizeDelta = repoSizeDiff;
                                setNewTabStateForThis();
                            }).error(function () {
                            toastr.warning('Could not get repository size for: ' + scope.getActiveRepository() + '; ' + getError(data));
                            scope.currentTabConfig.sizeDelta = undefined;
                            setNewTabStateForThis();
                        });
                    };
                } else {
                    if (dataOrJqXhr.status === 200) {
                        var size = -1;

                        var contentType = dataOrJqXhr.getResponseHeader('Content-Type');

                        if (contentType.indexOf('application/sparql-results+json') === 0) {
                            if (dataOrJqXhr.responseJSON.results) {
                                // SELECT results, easy to count
                                size = dataOrJqXhr.responseJSON.results.bindings.length;
                            }
                        } else if (contentType.indexOf('application/rdf+json') === 0) {
                            // CONSTRUCT or DESCRIBE results, a bit tricky to count
                            size = 0;
                            _.each(dataOrJqXhr.responseJSON, function (e, key) {
                                _.each(e, function (e) {
                                    size += e.length;
                                });
                            });
                        }

                        if (size >= 0 && (scope.nocount || scope.currentTabConfig.offset === 1 && size < scope.currentTabConfig.pageSize)) {
                            // No count requested
                            //                                   OR
                            // First page (offset = 1) and the results are less than the page size
                            //
                            // In all of these cases it doesn't make sense to run
                            // the counting query so we tweak the status to signal that to YASQE.
                            dataOrJqXhr.status = 204; // 204 is no content, YASQE counts only if status is 200
                            scope.currentTabConfig.allResultsCount = size;
                        }
                    }

                    // The following long-running code needs to be in timeout to get the updated loader message
                    scope.setLoader(true, 'Rendering results', null, true);

                    updateResultsCallback = function () {
                        yasr.setResponse(dataOrJqXhr, textStatus, jqXhrOrErrorString);

                        scope.$apply(function () {
                            scope.currentTabConfig.resultsCount = scope.currentTabConfig.offset + yasr.resultsCount - 1;
                        });

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

            window.editor.options.sparql.handlers.countCallback = function (dataOrJqXhr, textStatus, jqXhrOrErrorString) {
                // We used to check if query is running but that doesn't make sense as this won't be called before
                // query is completed. Besides, the check stopped working since we made things a bit more async, see GDB-1979
                if (dataOrJqXhr.status == 200) {
                    yasr.setResultsCount(dataOrJqXhr, textStatus, jqXhrOrErrorString);
                } else {
                    // count query timeouted or something else went wrong
                    yasr.allCount = scope.currentTabConfig.resultsCount;
                    scope.countTimeouted = true;
                }
                scope.$apply(function () {
                    scope.currentTabConfig.allResultsCount = yasr.allCount;
                });
                var tab = scope.tabs[findTabIndexByID(scope.currentQuery.id)];
                tab.allResultsCount = yasr.allCount;
                scope.saveTab(tab.id);
                // count query completed successfully
            };

            window.editor.options.sparql.handlers.resetResults = function () {
            };

            scope.yasr = yasr;

            // Track changes in the output type (tab in yasr) so that we can save this together with
            // the rest of the tab's data.
            scope.$watch('yasr.options.output', function (value) {
                // Save the output type only if it isn't an update or an ask query (see comment where we save all properties).
                if (value && scope.currentTabConfig.queryType != "UPDATE" && scope.currentTabConfig.queryType != "ASK") {
                    var tab = scope.tabs[findTabIndexByID(scope.currentQuery.id)];
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

        // Hide the sample queries when the user clicks somewhere else in the UI.
        $(document).mouseup(function (event) {
            var container = $('#sampleQueriesCollapse');
            if (!container.is(event.target) // if the target of the click isn't the container..
                && container.has(event.target).length === 0 //... nor a descendant of the container
                && scope.showSampleQueries) {
                scope.toggleSampleQueries();
            }
        });

        function findTabIndexByID(id) {
            for (var i = 0; i < scope.tabs.length; i++) {
                var tab = scope.tabs[i];
                if (tab.id === id) {
                    return i;
                }
            }
        }

        // functions to load query param or saved queries
        function toBoolean(v) {
            return angular.isDefined(v) && v != 'false';
        }

        function autoexecuteQueryIfRequested() {
            var isRequested = toBoolean($location.search().execute);

            if (isRequested) {
                if (window.editor.getQueryMode() == 'update') {
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
            var tabId = scope.getExistingTabId(query);
            // Ah, the joys of non-synchronous events
            var onHandler = scope.$on('tabLoaded', function () {
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
            SparqlService.getSavedQuery(savedQueryName, owner)
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
                var query = {name: $location.search().name, body: $location.search().query};
                loadQueryIntoExistingOrNewTab(query, $location.search().infer, $location.search().sameAs);
            } else {
                // Restore the previous tab after the dom has loaded
                var currentid = localStorageService.get('tabs-state-currentid');
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
