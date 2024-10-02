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
            onRegenerateQuestion: '&',
            onAskHowDeliveredAnswer: '&'
        },
        link: ($scope, element, attrs) => {

            // =========================
            // Public variables
            // =========================
            $scope.MarkdownService = MarkdownService;

            /**
             * @type {ExplainResponseModel}
             */
            $scope.explainResponseModel = undefined;
            $scope.loadingExplainResponse = false;

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
             * Copies the message to the clipboard.
             *
             * @param {string} message
             */
            $scope.copy = (message) => {
                TTYGContextService.emit(TTYGEventName.COPY_TEXT_TO_CLIPBOARD, message);
            };

            /**
             * Extract the explanation of how the answer was generated.
             */
            $scope.explainResponse = () => {
                const explainResponse = TTYGContextService.getExplainResponseCache()[$scope.chatItemDetail.answer.id];
                if (explainResponse) {
                    explainResponse.expanded = !explainResponse.expanded;
                    TTYGContextService.updateExplainResponseCache(explainResponse);
                } else {
                    $scope.loadingExplainResponse = true;
                    TTYGService.explainResponse($scope.chatItemDetail)
                        .then((explainResponse) => {
                            $scope.explainResponseModel = explainResponse;
                            TTYGContextService.updateExplainResponseCache(explainResponse);
                        })
                        .catch((error) => {
                            toastr.error(getError(error.data), $translate.instant('similarity.get.resource.error'));
                        })
                        .finally(() => $scope.loadingExplainResponse = false);
                }
            };

            /**
             * Triggers an asking how the answer was generated.
             */
            $scope.askHowDerivedAnswer = () => {
                $scope.onAskHowDeliveredAnswer({chatItem: $scope.chatItemDetail});
            };

            /**
             * Opens <code>query</code> in sparql editor.
             * @param {string} query
             */
            $scope.openInSparqlEditor = (query) => {
                if ($scope.chatItemDetail.answer) {
                    const agents = TTYGContextService.getAgents();
                    if (agents) {
                        const agent = agents.getAgent($scope.chatItemDetail.answer.agentId);
                        if (agent) {
                            TTYGContextService.emit(TTYGEventName.GO_TO_SPARQL_EDITOR, {
                                query,
                                repositoryId: agent.repositoryId
                            });
                        }

                    }
                }
            };

            // =========================
            // Private functions
            // =========================
            const init = () => {
                if ($scope.chatItemDetail.answer) {
                    $scope.explainResponseModel = TTYGContextService.getExplainResponseCache()[$scope.chatItemDetail.answer.id];
                }
            };

            const onExplainResponseCacheUpdated = (explainResponseModel) => {
                if ($scope.chatItemDetail.answer) {
                    $scope.explainResponseModel = explainResponseModel[$scope.chatItemDetail.answer.id];
                }
            };

            // =========================
            // Subscriptions
            // =========================
            const subscriptions = [];

            const removeAllSubscribers = () => {
                subscriptions.forEach((subscription) => subscription());
            };

            subscriptions.push(TTYGContextService.onExplainResponseCacheUpdated(onExplainResponseCacheUpdated));

            // Deregister the watcher when the scope/directive is destroyed
            $scope.$on('$destroy', removeAllSubscribers);

            // =========================
            // Initialization
            // =========================
            init();
        }
    };
}
