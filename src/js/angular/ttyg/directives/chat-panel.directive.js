import './chat-item-detail.directive';
import {TTYGEventName} from "../services/ttyg-context.service";
import {CHAT_MESSAGE_ROLE, ChatMessageModel} from "../../models/ttyg/chat-message";
import {ChatItemModel} from "../../models/ttyg/chat-item";
import {cloneDeep} from "lodash";
import {decodeHTML} from "../../../../app";
import {ChatModel} from "../../models/ttyg/chats";

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
             * True while a question is being handled. It may involve multiple requests until it turns back to false.
             * @type {boolean}
             */
            $scope.waitingForLastMessage = false;

            /**
             * Flag that indicates that the chat is about to be changed.
             * @type {boolean}
             */
            $scope.loadingChat = true;

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
                $scope.chatItem.question.timestamp = Date.now();
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
                $scope.askingChatItem = regenerateChatItem;
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

            /**
             * Finds out if agent with such id exists and returns its name or a default message for deleted agent.
             * @param {string} agentId
             * @return {string}
             */
            $scope.getAgentName = (agentId) => {
              const agent = TTYGContextService.getAgent(agentId);
              return agent ? agent.name : decodeHTML($translate.instant('ttyg.chat_panel.deleted_agent'));
            };

            // =========================
            // Private functions
            // =========================

            const createNewChat = () => {
                $scope.waitingForLastMessage = true;
                TTYGContextService.emit(TTYGEventName.CREATE_CHAT, $scope.chatItem);
            };

            const askQuestion = (chatItem) => {
                $scope.waitingForLastMessage = true;
                TTYGContextService.emit(TTYGEventName.ASK_QUESTION, chatItem);
            };

            /**
             * Handles the update of the selected chat.
             * @param {ChatModel} chat - the new selected chat.
             */
            const onSelectedChatUpdated = (chat) => {
                $scope.chat = chat;
                if (!chat || !chat.id && $scope.askingChatItem) {
                    // Do nothing if the chat is new (dummy) and a question is currently being asked.
                    return;
                }
                $scope.loadingChat = false;
                $scope.chatItem = getEmptyChatItem();
                $scope.askingChatItem = undefined;
                if ($scope.chat) {
                    // TODO: Why on earth this is here? The chat changed handler is in the ttyg.view. Why doesn't it handle this
                    // but we need to go through 2 more events to achieve the same result?
                    const lastChatItem = $scope.chat.chatHistory.getLast();
                    if (lastChatItem && lastChatItem.agentId) {
                        TTYGContextService.selectAgent(TTYGContextService.getAgent(lastChatItem.agentId));
                    }
                }
                focusQuestionInput();
            };

            const onLastMessageReceived = () => {
                $scope.waitingForLastMessage = false;
            };

            /**
             * Handles the failure of loading the chat and the server returns 404. This might happen if the chat does
             * not exist anymore because it was deleted by another user for example.
             */
            const onLoadChatFailure = () => {
                $scope.loadingChat = false;
                $scope.chatItem = getEmptyChatItem();
                focusQuestionInput();
            };

            const onSelectedChatChanged = (chat) => {
                if (chat) {
                    // Skip the loading indication if it is a new (dummy) chat that has not been created yet.
                    $scope.loadingChat = chat && chat.id;
                    $scope.chatItem = getEmptyChatItem();
                    focusQuestionInput();
                } else {
                    reset();
                }
            };

            const onQuestionFailure = () => {
                $scope.chatItem = cloneDeep($scope.askingChatItem);
                $scope.askingChatItem = undefined;
                $scope.waitingForLastMessage = false;
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

            const onChatDeleted = (deletedChat) => {
                if ($scope.chat && deletedChat.id === $scope.chat.id) {
                    reset();
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
                const els = element.find('.question-input');
                if (els.length) {
                    els[0].focus();
                }
            };

            const scrollToBottom = () => {
                // Call it in a timeout to ensure that Angular's digest cycle is finished and all elements are displayed.
                setTimeout(() => {
                    const chatDetailsElement = element.find(".chat-details")[0];
                    if (chatDetailsElement) {
                        chatDetailsElement.scrollTop = chatDetailsElement.scrollHeight;
                    }
                });
            };

            const reset = () => {
                $scope.chat = ChatModel.getEmptyChat();
                $scope.loadingChat = false;
                $scope.chatItem = getEmptyChatItem();
                $scope.askingChatItem = undefined;
                $scope.waitingForLastMessage = false;
                focusQuestionInput();
            };

            const init = () => {
                $scope.chat = ChatModel.getEmptyChat();
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
            subscriptions.push(TTYGContextService.onSelectedChatUpdated(onSelectedChatUpdated));
            subscriptions.push(TTYGContextService.onLastMessageReceived(onLastMessageReceived));
            subscriptions.push(TTYGContextService.onSelectedAgentChanged(onSelectedAgentChanged));
            subscriptions.push(TTYGContextService.onSelectedChatChanged(onSelectedChatChanged));
            subscriptions.push(TTYGContextService.subscribe(TTYGEventName.LOAD_CHAT_FAILURE, onLoadChatFailure));
            subscriptions.push(TTYGContextService.subscribe(TTYGEventName.ASK_QUESTION_FAILURE, onQuestionFailure));
            subscriptions.push(TTYGContextService.subscribe(TTYGEventName.CREATE_CHAT_FAILURE, onQuestionFailure));
            subscriptions.push(TTYGContextService.subscribe(TTYGEventName.DELETE_CHAT_SUCCESSFUL, onChatDeleted));

            // Deregister the watcher when the scope/directive is destroyed
            $scope.$on('$destroy', removeAllSubscribers);

            // =========================
            // Initialization
            // =========================
            init();
        }
    };
}
