import {ChatQuestion} from "../../models/ttyg/chat-question";
import {TTYGEventName} from "../services/ttyg-context.service";
import {chatQuestionToChatMessageMapper} from "../services/chat-message.mapper";
import {cloneDeep} from "lodash";
import {CHAT_MESSAGE_ROLE} from "../../models/ttyg/chat-message";

const modules = [];

angular
    .module('graphdb.framework.ttyg.directives.chat-panel', modules)
    .directive('chatPanel', ChatPanelComponent);

ChatPanelComponent.$inject = ['toastr', '$translate', 'TTYGContextService', 'TTYGService'];

/**
 * @ngdoc directive
 * @name graphdb.framework.ttyg.directives.chat-panel:chatPanel
 * @restrict E
 * @description
 *
 * This directive represents a chat panel component that allows users to interact with a chat. It provides functionality for asking questions,
 * regenerating chat content, and other interactive features.
 *
 * It encapsulates the logic and presentation for displaying and managing chat-related interactions.
 *
 * @example
 * <chat-panel></chat-panel>
 */
function ChatPanelComponent(toastr, $translate, TTYGContextService, TTYGService) {
    return {
        restrict: 'E',
        templateUrl: 'js/angular/ttyg/templates/chat-panel.html',
        scope: {},
        link: ($scope, element, attrs) => {

            // =========================
            // Public variables
            // =========================

            /**
             * @type {ChatModel}
             */
            $scope.chat = undefined;

            /**
             * @type {AgentModel}
             */
            $scope.selectedAgent = undefined;

            /**
             * @type {ChatQuestion}
             */
            $scope.chatQuestion = undefined;

            // =========================
            // Private variables
            // =========================

            // =========================
            // Public functions
            // =========================

            /**
             * Handles the ask question action.
             */
            $scope.ask = () => {
                if (!$scope.chatQuestion.conversationId) {
                    createNewChat();
                } else {
                    askQuestion();
                }
            };

            // =========================
            // Private functions
            // =========================

            const setupNewChatQuestion = () => {
                $scope.chatQuestion = getEmptyChatQuestion();
            };

            const createNewChat = () => {
                TTYGContextService.emit(TTYGEventName.CREATE_CHAT, $scope.chatQuestion);
            };

            const askQuestion = () => {
                if ($scope.chat) {
                    $scope.chat.appendMessage(chatQuestionToChatMessageMapper($scope.chatQuestion));
                }
                const question = cloneDeep($scope.chatQuestion);
                setupNewChatQuestion();
                TTYGContextService.emit(TTYGEventName.ASK_QUESTION, question);
            };

            /**
             * Handles answering a chat question.
             *
             * @param {ChatMessageModel} answer
             */
            const onQuestionAnswer = (answer) => {
                if ($scope.chat && $scope.chat.id === answer.conversationId) {
                    $scope.chat.appendMessage(answer);
                }
            };

            /**
             * Handles the change of the selected chat.
             * @param {ChatModel} chat - the new selected chat.
             */
            const onChatChanged = (chat) => {
                if (!chat) {
                    $scope.chat = undefined;
                    setupNewChatQuestion();
                    return;
                }
                if ($scope.chat && $scope.chat.id === chat.id) {
                    return;
                }

                // TODO: Check if the agent needs to be changed when the chat is switched.
                TTYGService.getConversation(chat.id)
                    .then((chat) => {
                        $scope.chat = chat;
                        setupNewChatQuestion();
                    });
            };

            /**
             * Handles the change of the selected agent.
             * @param {AgentModel} agent - the new selected agent.
             */
            const onSelectedAgentChanged = (agent) => {
                $scope.selectedAgent = agent;
                if ($scope.selectedAgent) {
                    $scope.chatQuestion.agentId = $scope.selectedAgent.id;
                }
            };

            const getEmptyChatQuestion = () => {
                const chatQuestion = new ChatQuestion();
                chatQuestion.role = CHAT_MESSAGE_ROLE.USER;

                if ($scope.chat) {
                    chatQuestion.conversationId = $scope.chat.id;
                }

                if ($scope.selectedAgent) {
                    chatQuestion.agentId = $scope.selectedAgent.id;
                }

                return chatQuestion;
            };

            // =========================
            // Subscriptions
            // =========================
            const subscriptions = [];

            const removeAllSubscribers = () => {
                subscriptions.forEach((subscription) => subscription());
            };

            subscriptions.push(TTYGContextService.onSelectedChatChanged(onChatChanged));
            subscriptions.push(TTYGContextService.subscribe(TTYGEventName.ASK_QUESTION_SUCCESSFUL, onQuestionAnswer));
            // TODO add subscription for agent changed, and call "onSelectedAgentChanged"

            // Deregister the watcher when the scope/directive is destroyed
            $scope.$on('$destroy', removeAllSubscribers);

            // =========================
            // Initialization
            // =========================

            function init() {
            }

            init();
        }
    };
}
