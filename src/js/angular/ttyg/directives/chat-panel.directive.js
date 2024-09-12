import {TTYGEventName} from "../services/ttyg-context.service";
import {CHAT_MESSAGE_ROLE, ChatMessageModel} from "../../models/ttyg/chat-message";
import {ChatItemModel} from "../../models/ttyg/chat-item";

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
             * @type {ChatItemModel}
             */
            $scope.chatItem = undefined;

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
                if (!$scope.chatItem.chatId) {
                    createNewChat();
                } else {
                    askQuestion();
                }
            };

            // =========================
            // Private functions
            // =========================

            const setupNewChatItem = () => {
                $scope.chatItem = getEmptyChatItem();
            };

            const createNewChat = () => {
                TTYGContextService.emit(TTYGEventName.CREATE_CHAT, $scope.chatItem);
            };

            const askQuestion = () => {
                TTYGContextService.emit(TTYGEventName.ASK_QUESTION, $scope.chatItem);
            };

            /**
             * Handles answering a chat question.
             *
             * @param {ChatItemModel} chatItem
             */
            const onQuestionAnswer = (chatItem) => {
                if ($scope.chat && $scope.chat.id === chatItem.chatId) {
                    $scope.chat.chatHistory.appendItem(chatItem);
                    setupNewChatItem();
                }
            };

            /**
             * Handles the change of the selected chat.
             * @param {ChatModel} chat - the new selected chat.
             */
            const onChatChanged = (chat) => {
                // The chat can be empty when a new chat is initialized. In this case, we only show the question input and the "Ask" button.
                // The chat will be automatically created by the backend when the first question is sent.
                if (!chat) {
                    $scope.chat = undefined;
                    setupNewChatItem();
                    return;
                }

                // TODO: Check if the agent needs to be changed when the chat is switched.
                TTYGService.getConversation(chat.id)
                    .then((chat) => {
                        $scope.chat = chat;
                        setupNewChatItem();
                    });
            };

            /**
             * Handles the change of the selected agent.
             * @param {AgentModel} agent - the new selected agent.
             */
            const onSelectedAgentChanged = (agent) => {
                $scope.selectedAgent = agent;
                if ($scope.selectedAgent) {
                    $scope.chatItem.agentId = $scope.selectedAgent.id;
                }
            };

            const getEmptyChatItem = () => {
                const chatItem = new ChatItemModel();
                chatItem.question = new ChatMessageModel({role: CHAT_MESSAGE_ROLE.USER});

                if ($scope.chat) {
                    chatItem.chatId = $scope.chat.id;
                }

                if ($scope.selectedAgent) {
                    chatItem.agentId = $scope.selectedAgent.id;
                }

                return chatItem;
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
            // TODO: add subscription for agent changed, and call "onSelectedAgentChanged"

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
