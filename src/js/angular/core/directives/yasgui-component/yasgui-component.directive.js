import 'angular/core/services/translation.service';
import 'angular/sparql-editor/share-query-link.service';
import {queryPayloadFromEvent, savedQueriesResponseMapper} from "../../../rest/mappers/saved-query-mapper";
import {isFunction, merge} from "lodash";
import {downloadAsFile, toYasguiOutputModel} from "../../../utils/yasgui-utils";
import {EventDataType} from "../../../models/ontotext-yasgui/event-data-type";
import {QueryMode} from "../../../models/ontotext-yasgui/query-mode";
import {YasrPluginName} from "../../../models/ontotext-yasgui/yasr-plugin-name";
import {isEqual} from "lodash/lang";
import {QueryType} from "../../../models/ontotext-yasgui/query-type";
import {saveAs} from 'lib/FileSaver-patch';
import {YasguiComponent} from "../../../models/yasgui-component";

const modules = [
    'graphdb.framework.core.services.translation-service',
    'graphdb.framework.sparql-editor.share-query.service'];
angular
    .module('graphdb.framework.core.directives.yasgui-component', modules)
    .directive('yasguiComponent', yasguiComponentDirective);

yasguiComponentDirective.$inject = [
    '$q',
    '$repositories',
    '$translate',
    '$location',
    '$languageService',
    '$jwtAuth',
    '$interval',
    'toastr',
    'TranslationService',
    'AutocompleteRestService',
    'RDF4JRepositoriesRestService',
    'MonitoringRestService',
    'SparqlRestService',
    'ShareQueryLinkService'
];

function yasguiComponentDirective(
    $q,
    $repositories,
    $translate,
    $location,
    $languageService,
    $jwtAuth,
    $interval,
    toastr,
    TranslationService,
    AutocompleteRestService,
    RDF4JRepositoriesRestService,
    MonitoringRestService,
    SparqlRestService,
    ShareQueryLinkService
) {

    const HEADERS = {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/sparql-results+json',
        'X-GraphDB-Local-Consistency': 'updating'
    };

    const DEFAULT_CONFIG = {
        showEditorTabs: true,
        showToolbar: true,
        componentId: 'yasgui-component',
        headers: () => {
            return HEADERS;
        },
        pageSize: 1000,
        maxPersistentResponseSize: 500000,
        showResultTabs: true
    };

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
            const downloadAsPluginNameToEventHandler = new Map();
            const outputHandlers = new Map();

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
                updateRequestHeaders(queryRequest.request, queryRequest.queryMode, queryRequest.queryType, queryRequest.pageSize);
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
                updateRequestHeaders(countQueryRequest.request, countQueryRequest.queryMode, countQueryRequest.queryType, countQueryRequest.pageSize);
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

            const downloadThroughServer = (downloadAsEvent) => {
                const query = downloadAsEvent.query;
                const infer = downloadAsEvent.infer;
                const sameAs = downloadAsEvent.sameAs;
                const accept = downloadAsEvent.contentType;
                const authToken = $jwtAuth.getAuthToken() || '';

                // TODO change it
                // Simple cross-browser download with a form
                const $wbDownload = $('#wb-download');
                $wbDownload.attr('action', $scope.ontotextYasguiConfig.endpoint);
                $('#wb-download-query').val(query);
                $('#wb-download-infer').val(infer);
                $('#wb-download-sameAs').val(sameAs);
                $('#wb-auth-token').val(authToken);
                $('#wb-download-accept').val(accept);
                $wbDownload.submit();
            };
            downloadAsPluginNameToEventHandler.set(YasrPluginName.EXTENDED_TABLE, downloadThroughServer);

            // =========================
            // Subscriptions
            // =========================
            const subscriptions = [];

            const init = (newVal, oldValue) => {
                if (!$scope.ontotextYasguiConfig && newVal || newVal && !isEqual(newVal, oldValue)) {
                    const config = {
                        isVirtualRepository: $repositories.isActiveRepoOntopType(),
                        yasqeAutocomplete: {
                            LocalNamesAutocompleter: (term) => {
                                const canceler = $q.defer();
                                return autocompleteLocalNames(term, canceler);
                            }
                        },
                        i18n: TranslationService.getTranslations(),
                        getRepositoryStatementsCount: getRepositoryStatementsCount,
                        onQueryAborted: onQueryAborted
                    };

                    angular.extend(config, DEFAULT_CONFIG, $scope.yasguiConfig);

                    $scope.ontotextYasguiConfig = config;

                    if (angular.isFunction($scope.afterInit)) {
                        $scope.afterInit();
                    }

                    addDirtyCheckHandlers();
                    $scope.language = $languageService.getLanguage();
                }
            };

            subscriptions.push($scope.$watch('yasguiConfig', init));

            const codeMirrorPasteHandler = () => {
                const ontotextYasguiElement = $scope.getOntotextYasguiElement();
                ontotextYasguiElement.getQuery()
                    .then((query) => JSON.stringify(query))
                    .then(SparqlRestService.addKnownPrefixes)
                    .then((response) => ontotextYasguiElement.setQuery(response.data))
                    .then(() => $scope.queryChanged())
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
                        ontotextYasguiElements.on('keyup.sparqlQuery', '.CodeMirror textarea', $scope.queryChanged);
                        $interval.cancel(waitOntotextInitialized);
                    }
                });
            };

            subscriptions.push(
                $scope.$on('language-changed', function (event, args) {
                    $scope.language = args.locale;
                }));

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

            const updateRequestHeaders = (req, queryMode, queryType, pageSize) => {
                const authToken = $jwtAuth.getAuthToken();
                if (authToken) {
                    req.header['Authorization'] = authToken;
                }
                req.header['X-GraphDB-Catch'] = `${pageSize}; throw`;
                // Generates a new tracking alias for queries based on time
                $scope.currentTrackAlias = `query-editor-${performance.now()}-${Date.now()}`;
                req.header['X-GraphDB-Track-Alias'] = $scope.currentTrackAlias;
                req.header['X-GraphDB-Repository-Location'] = $repositories.getActiveRepositoryObject().location;
                req.header['X-Requested-With'] = 'XMLHttpRequest';

                if (QueryMode.UPDATE === queryMode) {
                    req.header['Accept'] = 'text/plain,/;q=0.9';
                } else if (QueryType.CONSTRUCT === queryType || QueryType.DESCRIBE === queryType) {
                    req.header['Accept'] = 'application/x-graphdb-table-results+json, application/rdf+json;q=0.9, */*;q=0.8';
                } else {
                    req.header['Accept'] = 'application/x-sparqlstar-results+json, application/sparql-results+json;q=0.9, */*;q=0.8';
                }
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
