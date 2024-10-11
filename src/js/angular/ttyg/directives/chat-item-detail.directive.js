import 'angular/core/services/markdown.service';
import {TTYGEventName} from "../services/ttyg-context.service";

const modules = [
    'graphdb.framework.core.services.markdown-service'
];

angular
    .module('graphdb.framework.ttyg.directives.chat-item-detail', modules)
    .directive('chatItemDetail', ChatItemDetailComponent);

ChatItemDetailComponent.$inject = ['toastr', '$translate', 'TTYGContextService', 'MarkdownService', 'TTYGService'];

/**
 * @ngdoc directive
 * @name graphdb.framework.ttyg.directives.chat-detail:chatDetail
 * @restrict E
 * @description
 *
 * This directive represents a component that displays a chat data.
 *
 * @example
 * <chat-item-detail chat-item="chatItem"></chat-item-detail>
 */
function ChatItemDetailComponent(toastr, $translate, TTYGContextService, MarkdownService, TTYGService) {
    return {
        restrict: 'E',
        templateUrl: 'js/angular/ttyg/templates/chat-item-detail.html',
        scope: {
            chatItemDetail: '=',
            showActions: '=',
            asking: '=',
            disabled: '=',
            onRegenerateQuestion: '&',
            onAskHowDeliveredAnswer: '&'
        },
        link: ($scope, element, attrs) => {

            // =========================
            // Public variables
            // =========================

            $scope.MarkdownService = MarkdownService;

            /**
             * Mapping of agent id to agent name which is used to display the agent name in the UI.
             * @type {{[key: string]: string}}
             */
            $scope.agentNameByIdMap = {};

            /**
             * @type {{[key: string]: ExplainResponseModel}}
             */
            $scope.explainResponseModel = {};

            /**
             * Mapping of answer id to a boolean value indicating whether the explanation of how the answer was
             * generated is being loaded.
             * @type {{[key: string]: boolean}}
             */
            $scope.loadingExplainResponse = {};

            // =========================
            // Private variables
            // =========================

            // =========================
            // Public functions
            // =========================
            $scope.regenerateQuestion = () => {
                $scope.onRegenerateQuestion({chatItem: $scope.chatItemDetail});
            };

            /**
             * Extract the explanation of how the answer was generated.
             * @param {string} answerId
             */
            $scope.explainResponse = (answerId) => {
                if (TTYGContextService.hasExplainResponse(answerId)) {
                    TTYGContextService.toggleExplainResponse(answerId);
                } else {
                    $scope.loadingExplainResponse[answerId] = true;
                    TTYGService.explainResponse($scope.chatItemDetail, answerId)
                        .then((explainResponse) => {
                            $scope.explainResponseModel = explainResponse;
                            TTYGContextService.addExplainResponseCache(explainResponse);
                        })
                        .catch(() => {
                            toastr.error($translate.instant('ttyg.chat_panel.messages.explain_response_failure'));
                        })
                        .finally(() => $scope.loadingExplainResponse[answerId] = false);
                }
            };

            /**
             * Triggers an asking how the answer was generated.
             */
            $scope.onAskHowAnswerWasDerived = () => {
                $scope.onAskHowDeliveredAnswer({chatItem: $scope.chatItemDetail});
            };

            /**
             * Opens <code>query</code> in sparql editor.
             * @param {string} query
             */
            $scope.onOpenInSparqlEditor = (query) => {
                if ($scope.chatItemDetail.agentId) {
                    const agent = TTYGContextService.getAgent($scope.chatItemDetail.agentId);
                    TTYGContextService.emit(TTYGEventName.GO_TO_SPARQL_EDITOR, {
                        query,
                        repositoryId: agent.repositoryId
                    });
                }
            };

            $scope.showRawQuery = (queryMethod) => {
                // TODO: Create a chat panel model and move this check there when the model is updated.
                const rawQueryNoSpaces = queryMethod.rawQuery.replace(/\s+/g, '');
                const queryNoSpaces = queryMethod.query.replace(/\s+/g, '');
                return rawQueryNoSpaces && rawQueryNoSpaces !== queryNoSpaces;
            };

            // =========================
            // Private functions
            // =========================
            const init = () => {
                updateExplainResponseModel();
            };

            const onExplainResponseCacheUpdated = () => {
                updateExplainResponseModel();
            };

            const updateExplainResponseModel = () => {
                $scope.chatItemDetail.answers.forEach((answer) => {
                    $scope.explainResponseModel[answer.id] = TTYGContextService.getExplainResponse(answer.id);
                });
            };

            const onAgentsListChanged = () => {
                $scope.agentNameByIdMap = TTYGContextService.getAgents().agentNameByIdMap;
            };

            // =========================
            // Subscriptions
            // =========================
            const subscriptions = [];

            const removeAllSubscribers = () => {
                subscriptions.forEach((subscription) => subscription());
            };

            subscriptions.push(TTYGContextService.onExplainResponseCacheUpdated(onExplainResponseCacheUpdated));
            subscriptions.push(TTYGContextService.onAgentsListChanged(onAgentsListChanged));

            // Deregister the watcher when the scope/directive is destroyed
            $scope.$on('$destroy', removeAllSubscribers);

            // =========================
            // Initialization
            // =========================
            init();
        }
    };
}
