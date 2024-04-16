import 'angular/core/services/translation.service';
import 'angular/sparql-editor/share-query-link.service';
import {queryPayloadFromEvent, savedQueriesResponseMapper} from "../../../rest/mappers/saved-query-mapper";
import {isFunction, merge} from "lodash";
import {saveAs} from 'lib/FileSaver-patch';
import {downloadAsFile, toYasguiOutputModel} from "../../../utils/yasgui-utils";
import {EventDataType} from "../../../models/ontotext-yasgui/event-data-type";
import {QueryMode} from "../../../models/ontotext-yasgui/query-mode";
import {YasrPluginName} from "../../../models/ontotext-yasgui/yasr-plugin-name";
import {isEqual} from "lodash/lang";
import {QueryType} from "../../../models/ontotext-yasgui/query-type";
import {YasguiComponent} from "../../../models/yasgui-component";
import {YasguiComponentDirectiveUtil} from "./yasgui-component-directive.util";
import {KeyboardShortcutName} from "../../../models/ontotext-yasgui/keyboard-shortcut-name";
import {YasguiPersistenceMigrationService} from "./yasgui-persistence-migration.service";
import {ExportSettingsCtrl} from "../../components/export-settings-modal/controller";
import 'angular/core/services/event-emitter-service';

const modules = [
    'graphdb.framework.core.services.translation-service',
    'graphdb.framework.sparql-editor.share-query.service',
    'graphdb.framework.utils.event-emitter-service'];
angular
    .module('graphdb.framework.core.directives.yasgui-component', modules)
    .directive('yasguiComponent', yasguiComponentDirective);

yasguiComponentDirective.$inject = [
    '$q',
    '$repositories',
    '$translate',
    '$location',
    '$languageService',
    '$uibModal',
    'AuthTokenService',
    '$interval',
    'toastr',
    'TranslationService',
    'AutocompleteRestService',
    'RDF4JRepositoriesRestService',
    'MonitoringRestService',
    'SparqlRestService',
    'ShareQueryLinkService',
    'EventEmitterService',
    'ModalService'
];

/**
 * Implements a facade in front of ontotext-yasgui custom component allowing all complexities related with its
 * configuration and the default implementations to be hidden behind it. This makes the component integration easier
 * and with minimal code duplication and coupling.
 *
 * Directive attributes:
 *
 * @attr yasguiConfig The directive configuration.
 * @type {OntotextYasguiConfig}
 *
 * @attr afterInit Event handler function which will be invoked immediately after the component gets initialized.
 *
 * @attr queryChanged Event handler function which will be invoked every time the query in the yasqe editor
 * gets changed. This doesn't tell if the query value is actually different than the initial value, but only that the
 * user typed or pasted something in the editor. For watching if the query is actually changed as value, then subscribe
 * for the `queryChanged` event.
 */
function yasguiComponentDirective(
    $q,
    $repositories,
    $translate,
    $location,
    $languageService,
    $uibModal,
    AuthTokenService,
    $interval,
    toastr,
    TranslationService,
    AutocompleteRestService,
    RDF4JRepositoriesRestService,
    MonitoringRestService,
    SparqlRestService,
    ShareQueryLinkService,
    eventEmitterService,
    ModalService
) {

    return {
        restrict: 'E',
        templateUrl: 'js/angular/core/directives/yasgui-component/templates/yasgui-component.html',
        scope: {
            yasguiConfig: '=',
            afterInit: '&',
            queryChanged: '&'
        },
        link: ($scope, element, attrs) => {
            $scope.classToApply = attrs.class || '';
            $scope.language = undefined;
            const downloadAsPluginNameToEventHandler = new Map();
            const outputHandlers = $scope.yasguiConfig && $scope.yasguiConfig.outputHandlers ? new Map($scope.yasguiConfig.outputHandlers) : new Map();
            // The initial query value which is set in the yasqe editor. This is used for dirty checking while the user
            // changes the query.
            let initialQueryValue = undefined;

            // =========================
            // Public function
            // =========================

            $scope.getOntotextYasguiElements = () => {
                return element.find('ontotext-yasgui');
            };

            /**
             * Getter for yasgui component.
             * @return {YasguiComponent}
             */
            $scope.getOntotextYasguiElement = () => {
                return new YasguiComponent($scope.getOntotextYasguiElements()[0]);
            };

            // =========================
            // Event handlers
            // =========================

            /**
             * Handles the createSavedQuery event emitted by the ontotext-yasgui. The event is fired when a saved query should
             * be created.
             * @param {object} event The event payload containing the query data from which a saved query object should be
             * created.
             */
            $scope.createSavedQuery = (event) => {
                const payload = queryPayloadFromEvent(event);
                SparqlRestService.addNewSavedQuery(payload)
                    .then(() => queryCreatedHandler(payload))
                    .catch(querySaveErrorHandler);
            };

            /**
             * Handles the updateSavedQuery event emitted by the ontotext-yasgui. The event is fired when a saved query should
             * be updated.
             * @param {object} event The event payload containing the saved query data which should be updated.
             */
            $scope.updateSavedQuery = (event) => {
                const payload = queryPayloadFromEvent(event);
                SparqlRestService.editSavedQuery(payload)
                    .then(() => queryUpdatedHandler(payload))
                    .catch(querySaveErrorHandler);
            };

            /**
             * Handles the deleteSavedQuery event emitted by the ontotext-yasgui. The event is fired when a saved query should
             * be deleted.
             * @param {object} event The event payload containing the saved query data which should be deleted.
             */
            $scope.deleteSavedQuery = (event) => {
                const payload = queryPayloadFromEvent(event);
                SparqlRestService.deleteSavedQuery(payload.name)
                    .then(() => {
                        toastr.success($translate.instant('query.editor.delete.saved.query.success.msg', {savedQueryName: payload.name}));
                    }).catch((err) => {
                    const msg = getError(err);
                    toastr.error(msg, $translate.instant('query.editor.delete.saved.query.error'));
                });
            };

            /**
             * Handles the shareSavedQuery event emitted by the ontotext-yasgui. The event is fired when a saved query should
             * be shared and is expected the share link to be created.
             * @param {object} event The event payload containing the saved query data from which the share link to be created.
             */
            $scope.shareSavedQuery = (event) => {
                const payload = queryPayloadFromEvent(event);
                $scope.savedQueryConfig = {
                    shareQueryLink: ShareQueryLinkService.createShareSavedQueryLink(payload.name, payload.owner)
                };
            };

            /**
             * Handles the shareQuery event emitted by the ontotext-yasgui. The event is fired when a query should be shared and
             * is expected the share link to be created.
             * @param {object} event The event payload containing the query data from which the share link to be created.
             */
            $scope.shareQuery = (event) => {
                const payload = queryPayloadFromEvent(event);
                $scope.savedQueryConfig = {
                    shareQueryLink: ShareQueryLinkService.createShareQueryLink(payload)
                };
            };

            /**
             * Handles the queryShareLinkCopied event emitted by the ontotext-yasgui. The event is fired when a query share link
             * is copied by the user.
             */
            $scope.queryShareLinkCopied = () => {
                toastr.success($translate.instant('modal.ctr.copy.url.success'));
            };

            /**
             * The event is fired when saved queries should be loaded in order to be displayed to the user.
             */
            $scope.loadSavedQueries = () => {
                SparqlRestService.getSavedQueries()
                    .then((res) => {
                        const savedQueries = savedQueriesResponseMapper(res);
                        $scope.savedQueryConfig = {
                            savedQueries: savedQueries
                        };
                    }).catch((err) => {
                    const msg = getError(err);
                    toastr.error(msg, $translate.instant('query.editor.get.saved.queries.error'));
                });
            };

            $scope.saveQueryOpened = (saveQueryOpenedEvent) => {
                YasguiComponentDirectiveUtil.highlightTabName(toYasguiOutputModel(saveQueryOpenedEvent).getTab());
            };

            /**
             * Handles the ontotext-yasgui component output events.
             *
             * @param {EventData}$event - the event fired from ontotext-yasgui component
             */
            $scope.output = ($event) => {
                const yasguiOutputModel = toYasguiOutputModel($event);
                if (outputHandlers.has(yasguiOutputModel.TYPE)) {
                    outputHandlers.get(yasguiOutputModel.TYPE)(yasguiOutputModel);
                }
            };

            // ================================
            // =     Setup output handlers    =
            // ================================

            /**
             * Handles the "query" event emitted by the ontotext-yasgui. The event is fired immediately before sending the
             * request and the request object can be altered here, and it will be sent with these changes.
             * @param {QueryRequestEvent} queryRequest - the event payload containing the query and the request object.
             */
            const queryHandler = (queryRequest) => {
                const pageNumber = queryRequest.getPageNumber();
                const pageSize = queryRequest.getPageSize();
                if (pageSize && pageNumber) {
                    queryRequest.setOffset((pageNumber - 1) * (pageSize - 1));
                    queryRequest.setLimit(pageSize);
                }
                queryRequest.setPageNumber(undefined);
                queryRequest.setPageSize(undefined);
            };
            outputHandlers.set(EventDataType.QUERY, queryHandler);

            /**
             * Handles the "countQuery" event emitted by the ontotext-yasgui. The event is fired immediately before sending the
             * count query request and the request object can be altered here, and it will be sent with these changes.
             * @param {CountQueryRequestEvent} countQueryRequest - the event payload containing the query and the request object.
             */
            const countQueryRequestHandler = (countQueryRequest) => {
                countQueryRequest.setPageSize(undefined);
                countQueryRequest.setPageNumber(undefined);
                countQueryRequest.setCount(1);
            };
            outputHandlers.set(EventDataType.COUNT_QUERY, countQueryRequestHandler);

            /**
             * Handles the "countQueryResponse" event emitted by the ontotext-yasgui. The event is fired immediately after receiving the
             * count query response and the response have to be parsed if needed. As result of response parsing the body of the response have to
             * contain "totalElements".
             * @param {CountQueryResponseEvent} countQueryResponseEvent - the event payload containing the response of count query.
             */
            const countQueryResponseHandler = (countQueryResponseEvent) => {
                countQueryResponseEvent.setTotalElements(extractTotalElements(countQueryResponseEvent));
            };
            outputHandlers.set(EventDataType.COUNT_QUERY_RESPONSE, countQueryResponseHandler);

            /**
             * Handles {@link EventDataType.DOWNLOAD_AS} event emitted by "ontotext-yasgui-web-component".
             *
             * @param {DownloadAsEvent}downloadAsEvent
             */
            const downloadAsHandler = (downloadAsEvent) => {
                const handler = downloadAsPluginNameToEventHandler.get(downloadAsEvent.pluginName);
                if (handler) {
                    handler(downloadAsEvent);
                }
            };
            outputHandlers.set(EventDataType.DOWNLOAD_AS, downloadAsHandler);

            /**
             * Handles {@link EventDataType.NOTIFICATION_MESSAGE} event emitted by "ontotext-yasgui-web-component".
             * The event is fired when a message have to be shown to the user.
             *
             * @param {NotificationMessageEvent} notificationMessageEvent - the "ontotext-yasgui-web-component" event.
             */
            const notificationMessageHandler = (notificationMessageEvent) => {
                const notifyFunction = toastr[notificationMessageEvent.messageType];
                if (isFunction(notifyFunction)) {
                    notifyFunction(notificationMessageEvent.message);
                }
            };
            outputHandlers.set(EventDataType.NOTIFICATION_MESSAGE, notificationMessageHandler);

            // ================================
            // =   Setup download handlers    =
            // ================================
            const downloadCurrentResults = (downloadAsEvent) => {
                if ("application/sparql-results+json" === downloadAsEvent.contentType) {
                    $scope.getOntotextYasguiElement().getEmbeddedResultAsJson()
                        .then((response) => {
                            const content = JSON.stringify(response, null, '\t');
                            downloadAsFile(`${getFileTimePrefix()}_queryResults.json`, downloadAsEvent.contentType, content);
                        });
                } else if ("text/csv" === downloadAsEvent.contentType) {
                    $scope.getOntotextYasguiElement().getEmbeddedResultAsCSV()
                        .then((response) => {
                            downloadAsFile(`${getFileTimePrefix()}_queryResults.csv`, downloadAsEvent.contentType, response);
                        });
                }
            };
            downloadAsPluginNameToEventHandler.set('extended_response', downloadCurrentResults);

            const downloadAs = (query, infer, sameAs, authToken, accept, link) => {
                const queryParams = {
                    query: query,
                    infer: infer,
                    sameAs: sameAs,
                    authToken: authToken
                };
                RDF4JRepositoriesRestService.downloadResultsAsFile($repositories.getActiveRepository(), queryParams, accept, link)
                    .then(function ({data, filename}) {
                        saveAs(data, filename);
                    }).catch(function (res) {
                        res.data.text()
                            .then((message) => {
                                if (res.status === 431) {
                                    toastr.error(res.statusText, $translate.instant('common.error'));
                                } else {
                                    toastr.error(message, $translate.instant('common.error'));
                                }
                            });
                    }).finally(() => {
                        $scope.setLoader(false);
                    });
            };

            const downloadThroughServer = (downloadAsEvent) => {
                const query = downloadAsEvent.query;
                const infer = downloadAsEvent.infer;
                const sameAs = downloadAsEvent.sameAs;
                const accept = downloadAsEvent.contentType;
                const authToken = AuthTokenService.getAuthToken() || '';

                if (downloadAsEvent.contentType === "application/ld+json" || downloadAsEvent.contentType === "application/x-ld+ndjson") {
                    const modalInstance = $uibModal.open({
                        templateUrl: 'js/angular/core/components/export-settings-modal/exportSettingsModal.html',
                        controller: ExportSettingsCtrl,
                        size: 'lg',
                        scope: $scope,
                        resolve: {
                            format: function () {
                                return downloadAsEvent.contentType === "application/ld+json" ? 'JSON-LD' : 'NDJSON-LD';
                            }
                        }
                    });

                    modalInstance.result.then(function (data) {
                        const acceptHeader = accept + ';profile=' + data.currentMode.link;
                        const linkHeader = data.link ? '<' + data.link + '>' : '';
                        downloadAs(query, infer, sameAs, authToken, acceptHeader, linkHeader);
                    });
                } else {
                    downloadAs(query, infer, sameAs, authToken, accept, '');
                }
            };
            downloadAsPluginNameToEventHandler.set(YasrPluginName.EXTENDED_TABLE, downloadThroughServer);

            // =========================
            // Subscriptions
            // =========================
            const subscriptions = [];

            const init = (newVal, oldValue) => {
                // This script check is required, because of the following scenario:
                // I am in the SPARQL view;
                // Then I go to a different view and change the language;
                // Then I return to the SPARQL view. I will see that the Google chart and Pivot table will have their
                // original scripts loaded still.
                // THE FIX: Get all the scripts (if there are none, the correct language will be loaded). If there are
                // scripts, and they don't match those, which are loaded already, the page needs to reload when opening
                // the SPARQL view, otherwise the Google chart and Pivot table configs will be in the old language.
                const googleScripts = document.querySelectorAll(`script[src*="https://www.gstatic.com/"]`);
                if (googleScripts.length > 0) {
                    const currentLang = $languageService.getLanguage();
                    let searchTerm = 'module.js';
                    if ('en' !== currentLang) {
                        searchTerm = `module__${currentLang}.js`;
                    }
                    if (!Array.prototype.some.call(googleScripts, (script) => script.src.includes(searchTerm))) {
                        location.reload();
                        return;
                    }
                }
                $scope.language = $languageService.getLanguage();
                if (!$scope.ontotextYasguiConfig && newVal || newVal && !isEqual(newVal, oldValue)) {
                    const virtualRepository = $repositories.isActiveRepoOntopType();
                    const config = {
                        isVirtualRepository: virtualRepository,
                        infer: virtualRepository || newVal.infer,
                        immutableInfer: virtualRepository,
                        sameAs: virtualRepository || newVal.sameAs,
                        immutableSameAs: virtualRepository,
                        yasqeAutocomplete: {
                            LocalNamesAutocompleter: (term) => {
                                const canceler = $q.defer();
                                return autocompleteLocalNames(term, canceler);
                            }
                        },
                        language: $languageService.getLanguage(),
                        i18n: TranslationService.getTranslations(),
                        getRepositoryStatementsCount: getRepositoryStatementsCount,
                        onQueryAborted: onQueryAborted
                    };

                    angular.extend(config, getDefaultConfig(), $scope.yasguiConfig);

                    if (config.showQueryButton !== undefined && !config.showQueryButton) {
                        const keyboardShortcutConfiguration = config.keyboardShortcutConfiguration || {};
                        keyboardShortcutConfiguration[KeyboardShortcutName.EXECUTE_QUERY_OR_UPDATE] = false;
                        keyboardShortcutConfiguration[KeyboardShortcutName.EXECUTE_EXPLAIN_PLAN_FOR_QUERY] = false;
                        keyboardShortcutConfiguration[KeyboardShortcutName.EXECUTE_CHAT_GPT_EXPLAIN_PLAN_FOR_QUERY] = false;
                        keyboardShortcutConfiguration[KeyboardShortcutName.CREATE_TAB] = false;
                        keyboardShortcutConfiguration[KeyboardShortcutName.CREATE_SAVE_QUERY] = false;
                        keyboardShortcutConfiguration[KeyboardShortcutName.SWITCH_NEXT_TAB] = false;
                        keyboardShortcutConfiguration[KeyboardShortcutName.SWITCH_PREVIOUS_TAB] = false;
                        keyboardShortcutConfiguration[KeyboardShortcutName.CLOSES_ALL_TABS] = false;
                        config.keyboardShortcutConfiguration = keyboardShortcutConfiguration;
                    } else {
                        const keyboardShortcutConfiguration = config.keyboardShortcutConfiguration || {};
                        keyboardShortcutConfiguration[KeyboardShortcutName.EXECUTE_EXPLAIN_PLAN_FOR_QUERY] = true;
                        keyboardShortcutConfiguration[KeyboardShortcutName.EXECUTE_CHAT_GPT_EXPLAIN_PLAN_FOR_QUERY] = true;
                        config.keyboardShortcutConfiguration = keyboardShortcutConfiguration;
                    }

                    if (YasguiPersistenceMigrationService.isMigrationNeeded()) {
                        YasguiPersistenceMigrationService.migrateYasguiPersistence($translate.instant('sparql.tab.directive.unnamed.tab.title'));
                    }

                    $scope.ontotextYasguiConfig = config;
                    addDirtyCheckHandlers();
                    setInitialQueryState().then(() => {
                        if (angular.isFunction($scope.afterInit)) {
                            $scope.afterInit();
                        }
                    });
                }
            };

            const setInitialQueryState = () => {
                return $scope.getOntotextYasguiElement().getQuery()
                    .then((query) => {
                        initialQueryValue = JSON.stringify(query);
                    });
            };

            subscriptions.push($scope.$watch('yasguiConfig', init));

            const codeMirrorPasteHandler = () => {
                let queryString;
                const ontotextYasguiElement = $scope.getOntotextYasguiElement();
                ontotextYasguiElement.getQuery()
                    .then((query) => {
                        queryString = JSON.stringify(query);
                        return queryString;
                    })
                    .then(SparqlRestService.addKnownPrefixes)
                    .then((response) => {
                        queryString = response.data;
                        ontotextYasguiElement.setQuery(queryString);
                    })
                    .then(() => {
                        emitQueryChanged(JSON.stringify(queryString));
                    })
                    .catch((data) => {
                        const msg = getError(data);
                        toastr.error(msg, $translate.instant('common.add.known.prefixes.error'));
                    });
            };

            const addDirtyCheckHandlers = () => {
                const waitOntotextInitialized = $interval(function () {
                    const ontotextYasguiElements = $scope.getOntotextYasguiElements();
                    if (ontotextYasguiElements) {
                        ontotextYasguiElements.on('paste.sparqlQuery', '.CodeMirror', codeMirrorPasteHandler);
                        ontotextYasguiElements.on('keyup.sparqlQuery', '.CodeMirror textarea', onQueryChange);
                        $interval.cancel(waitOntotextInitialized);
                    }
                });
            };

            const onQueryChange = (evt) => {
                $scope.getOntotextYasguiElement().getQuery()
                    .then((query) => {
                        emitQueryChanged(JSON.stringify(query));
                    });
            };

            const emitQueryChanged = (queryString) => {
                $scope.queryChanged(queryString);
                // the above function which is bound via directive attribute doesn't allow passing parameters so we emit
                // this event to allow more control for the directive client
                $scope.$emit('queryChanged', {dirty: initialQueryValue !== queryString});
            };

            subscriptions.push(
                $scope.$on('language-changed', function () {
                    location.reload();
                })
            );
            subscriptions.push(
                eventEmitterService.subscribe('before-language-change', function (args) {
                    return new Promise((resolve) => {
                        ModalService.openSimpleModal({
                            title: $translate.instant('query.editor.language.change.warning.title'),
                            message: $translate.instant('query.editor.reload.page.warning'),
                            warning: true
                        }).result.then(function () {
                            resolve(args);
                        }, function () {
                            args.cancel = true;
                            resolve(args);
                        });
                    });
                }
            ));

            const removeAllSubscribers = () => {
                subscriptions.forEach((subscription) => subscription());
                const ontotextYasguiElements = $scope.getOntotextYasguiElements();
                ontotextYasguiElements.off('paste.sparqlQuery');
                ontotextYasguiElements.off('keyup.sparqlQuery');
            };

            // Deregister the watcher when the scope/directive is destroyed
            $scope.$on('$destroy', removeAllSubscribers);

            // =========================
            // Private function
            // =========================

            const getFileTimePrefix = () => {
                const now = new Date();
                return `${now.toLocaleDateString($scope.language)}_${now.toLocaleTimeString($scope.language)}`;
            };

            const extractTotalElements = (countResponse) => {
                if (countResponse.isResponseNumber()) {
                    return countResponse.getResponseBody();
                }

                if (countResponse.isResponseArray()) {
                    const body = countResponse.getResponseBody();
                    if (body['http://www.ontotext.com/']) {
                        return body['http://www.ontotext.com/']['http://www.ontotext.com/'][0].value;
                    }
                }

                if (countResponse.hasBindingResponse()) {
                    const body = countResponse.getResponseBody();
                    if (body) {
                        const result = body.results.bindings[0];
                        const vars = body.head.vars;
                        const bindingVar = Object.keys(result).find(function (b) {
                            return vars.indexOf(b) > -1 && !isNaN(result[b].value);
                        });
                        if (bindingVar.length > 0) {
                            return result[bindingVar].value;
                        }
                    }
                }
            };

            const getHeaders = (yasgui) => {
                const yasqe = yasgui.getTab().getYasqe();
                const pageSize = yasqe.getPageSize();

                // Generates a new tracking alias for queries based on time
                const trackAlias = `yasgui-component-${performance.now()}-${Date.now()}`;

                const headers = {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'X-GraphDB-Local-Consistency': 'updating',
                    'X-GraphDB-Catch': `${pageSize}; throw`,
                    'X-GraphDB-Track-Alias': trackAlias,
                    'X-GraphDB-Repository-Location': $repositories.getActiveRepositoryObject().location,
                    'X-Requested-With': 'XMLHttpRequest'
                };

                const authToken = AuthTokenService.getAuthToken();
                if (authToken) {
                    headers['Authorization'] = authToken;
                }

                const queryType = yasqe.getQueryType();
                if (QueryMode.UPDATE === yasqe.getQueryMode()) {
                    headers['Accept'] = 'text/plain,/;q=0.9';
                } else if (QueryType.CONSTRUCT === queryType || QueryType.DESCRIBE === queryType) {
                    headers['Accept'] = 'application/x-graphdb-table-results+json, application/rdf+json;q=0.9, */*;q=0.8';
                } else {
                    headers['Accept'] = 'application/x-sparqlstar-results+json, application/sparql-results+json;q=0.9, */*;q=0.8';
                }
                return headers;
            };

            const getDefaultConfig = () => {
                return {
                    showEditorTabs: true,
                    showToolbar: true,
                    componentId: 'yasgui-component',
                    headers: getHeaders,
                    pageSize: 1000,
                    maxPersistentResponseSize: 500000,
                    showResultTabs: true
                };
            };

            const querySaveErrorHandler = (err) => {
                const msg = getError(err);
                const errorMessage = $translate.instant('query.editor.create.saved.query.error');
                toastr.error(msg, errorMessage);
                $scope.savedQueryConfig = merge({}, $scope.savedQueryConfig, {
                    saveSuccess: false,
                    errorMessage: [errorMessage]
                });
            };

            const queryUpdatedHandler = (payload) => {
                return querySavedHandler($translate.instant('query.editor.edit.saved.query.success.msg', {name: payload.name}));
            };

            const queryCreatedHandler = (payload) => {
                return querySavedHandler($translate.instant('query.editor.save.saved.query.success.msg', {name: payload.name}));
            };

            const querySavedHandler = (successMessage) => {
                toastr.success(successMessage);
                $scope.savedQueryConfig = merge({}, $scope.savedQueryConfig, {
                    saveSuccess: true
                });
            };

            const autocompleteLocalNames = (term, canceler) => {
                return AutocompleteRestService.getAutocompleteSuggestions(term, canceler.promise)
                    .then(function (results) {
                        canceler = null;
                        return results.data;
                    });
            };

            const getRepositoryStatementsCount = () => {
                // A promise is returned because the $http of  angularjs use HttpPromise and its behavior is different than we expect.
                // Here is an article that describes the problems AngularJS HttpPromise methods break promise chain {@link https://medium.com/@ExplosionPills/angularjs-httppromise-methods-break-promise-chain-950c85fa1fe7}
                return RDF4JRepositoriesRestService.getRepositorySize($repositories.getActiveRepository())
                    .then((response) => parseInt(response.data))
                    .catch(function (data) {
                        const params = {
                            repo: $repositories.getActiveRepository(),
                            error: getError(data)
                        };
                        toastr.warning($translate.instant('query.editor.repo.size.error', params));
                    });
            };

            const onQueryAborted = (req) => {
                if (req) {
                    const repository = req.url.substring(req.url.lastIndexOf('/') + 1);
                    const currentTrackAlias = req.header['X-GraphDB-Track-Alias'];
                    return MonitoringRestService.deleteQuery(currentTrackAlias, repository);
                }
            };
        }
    };
}
