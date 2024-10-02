import './chat-item-detail.directive';
import {TTYGEventName} from "../services/ttyg-context.service";
import {CHAT_MESSAGE_ROLE, ChatMessageModel} from "../../models/ttyg/chat-message";
import {ChatItemModel} from "../../models/ttyg/chat-item";
import {cloneDeep} from "lodash";

const modules = [
    'graphdb.framework.ttyg.directives.chat-item-detail'
];

angular
    .module('graphdb.framework.ttyg.directives.chat-panel', modules)
    .directive('chatPanel', ChatPanelComponent);

ChatPanelComponent.$inject = ['toastr', '$translate', 'TTYGContextService'];

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
function ChatPanelComponent(toastr, $translate, TTYGContextService) {
    return {
        restrict: 'E',
        templateUrl: 'js/angular/ttyg/templates/chat-panel.html',
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

            /**
             * @type {ChatItemModel}
             */
            $scope.askingChatItem = undefined;

            /**
             * Flag that indicates that the chat is about to be changed.
             * @type {boolean}
             */
            $scope.loadingChat = false;

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
                $scope.askingChatItem = cloneDeep($scope.chatItem);
                if (!$scope.chatItem.chatId) {
                    createNewChat();
                } else {
                    askQuestion($scope.chatItem);
                }
                $scope.chatItem = getEmptyChatItem();
                scrollToBottom();
                focusQuestionInput();
            };

            /**
             * Regenerates the answer for the provided chat item.
             *
             * @param {ChatItemModel} chatItem - The chat item that contains the question to be regenerated.
             */
            $scope.regenerateQuestion = (chatItem) => {
                const regenerateChatItem = getEmptyChatItem();
                regenerateChatItem.setQuestionMessage(chatItem.getQuestionMessage());
                $scope.askingChatItem = cloneDeep(regenerateChatItem);
                askQuestion(regenerateChatItem);
                scrollToBottom();
            };

            /**
             * Handles pressing the Enter key in the question input.
             * Will not trigger if `Shift` or `Ctrl` keys are pressed.
             *
             * @param {KeyboardEvent} $event - The keyboard event triggered by the user interaction.
             */
            $scope.onKeypressOnInput = ($event) => {
                if ($event.key === 'Enter' && !$event.shiftKey && !$event.ctrlKey) {
                    $scope.ask();
                }
            };

            $scope.onAskHowDeliveredAnswer = () => {
                const askHowDerivedAnswerChatItem = getEmptyChatItem();
                askHowDerivedAnswerChatItem.setQuestionMessage($translate.instant('ttyg.chat_panel.btn.derive_answer.label'));
                $scope.askingChatItem = cloneDeep(askHowDerivedAnswerChatItem);
                askQuestion(askHowDerivedAnswerChatItem);
                scrollToBottom();
            };

            // =========================
            // Private functions
            // =========================
            const createNewChat = () => {
                TTYGContextService.emit(TTYGEventName.CREATE_CHAT, $scope.chatItem);
            };

            const askQuestion = (chatItem) => {
                TTYGContextService.emit(TTYGEventName.ASK_QUESTION, chatItem);
            };

            /**
             * Handles the change of the selected chat.
             * @param {ChatModel} chat - the new selected chat.
             */
            const onChatChanged = (chat) => {
                $scope.chat = chat;
                $scope.loadingChat = false;
                $scope.chatItem = getEmptyChatItem();
                $scope.askingChatItem = undefined;
                focusQuestionInput();
            };

            const onSelectedChatChanged = (chat) => {
                // Skip the loading indication if it is a new (dummy) chat that has not been created yet.
                $scope.loadingChat = chat && chat.id;
                $scope.chatItem = getEmptyChatItem();
                focusQuestionInput();
            };

            const onQuestionFailure = () => {
                $scope.chatItem = cloneDeep($scope.askingChatItem);
                $scope.askingChatItem = undefined;
            };

            /**
             * Handles the change of the selected agent.
             * @param {AgentModel} agent - the new selected agent.
             */
            const onSelectedAgentChanged = (agent) => {
                $scope.selectedAgent = agent;
                if ($scope.selectedAgent && $scope.chatItem) {
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

            const focusQuestionInput = () => {
                element.find('.question-input')[0].focus();
            };

            const scrollToBottom = () => {
                // Call it in a timeout to ensure that Angular's digest cycle is finished and all elements are displayed.
                setTimeout(() => {
                    const chatDetailsElement = element.find(".chat-details")[0];
                    chatDetailsElement.scrollTop = chatDetailsElement.scrollHeight;
                });
            };

            const init = () => {
                $scope.chatItem = getEmptyChatItem();
                focusQuestionInput();
            };

            // =========================
            // Subscriptions
            // =========================
            const subscriptions = [];

            const removeAllSubscribers = () => {
                subscriptions.forEach((subscription) => subscription());
            };

            subscriptions.push($scope.$watchCollection('chat.chatHistory.items', scrollToBottom));
            subscriptions.push(TTYGContextService.onSelectedChatUpdated(onChatChanged));
            subscriptions.push(TTYGContextService.onSelectedAgentChanged(onSelectedAgentChanged));
            subscriptions.push(TTYGContextService.onSelectedChatChanged(onSelectedChatChanged));
            subscriptions.push(TTYGContextService.subscribe(TTYGEventName.ASK_QUESTION_FAILURE, onQuestionFailure));
            subscriptions.push(TTYGContextService.subscribe(TTYGEventName.CREATE_CHAT_FAILURE, onQuestionFailure));

            // Deregister the watcher when the scope/directive is destroyed
            $scope.$on('$destroy', removeAllSubscribers);

            // =========================
            // Initialization
            // =========================
            init();
        }
    };
}
