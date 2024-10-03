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
             * Extract the explanation of how the answer was generated.
             */
            $scope.explainResponse = () => {
                if (TTYGContextService.hasExplainResponse($scope.chatItemDetail.answer.id)) {
                    TTYGContextService.toggleExplainResponse($scope.chatItemDetail.answer.id);
                } else {
                    $scope.loadingExplainResponse = true;
                    TTYGService.explainResponse($scope.chatItemDetail)
                        .then((explainResponse) => {
                            $scope.explainResponseModel = explainResponse;
                            TTYGContextService.addExplainResponseCache(explainResponse);
                        })
                        .catch(() => {
                            toastr.error($translate.instant('ttyg.chat_panel.messages.explain_response_failure'));
                        })
                        .finally(() => $scope.loadingExplainResponse = false);
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
                    if (agent) {
                        TTYGContextService.emit(TTYGEventName.GO_TO_SPARQL_EDITOR, {
                            query,
                            repositoryId: agent.repositoryId
                        });
                    }
                }
            };

            // =========================
            // Private functions
            // =========================
            const init = () => {
                if ($scope.chatItemDetail.answer) {
                    $scope.explainResponseModel = TTYGContextService.getExplainResponse($scope.chatItemDetail.answer.id);
                }
            };

            const onExplainResponseCacheUpdated = () => {
                if ($scope.chatItemDetail.answer) {
                    $scope.explainResponseModel = TTYGContextService.getExplainResponse($scope.chatItemDetail.answer.id);
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
