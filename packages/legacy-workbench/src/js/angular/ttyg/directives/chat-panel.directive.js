import './chat-item-detail.directive';
import 'angular/core/directives/editable-content/editable-content';
import {TTYGEventName} from "../services/ttyg-context.service";
import {CHAT_MESSAGE_ROLE, ChatMessageModel} from "../../models/ttyg/chat-message";
import {ChatItemModel} from "../../models/ttyg/chat-item";
import {cloneDeep} from "lodash";
import {decodeHTML} from "../../../../app";

const modules = [
    'graphdb.framework.ttyg.directives.chat-item-detail',
    'graphdb.framework.core.directives.editable-content',
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

            $scope.showCancelButton = false;

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
             * Cancels a pending question tied to the current scope.
             * Hides cancel button.
             */
            $scope.cancelPendingQuestion = () => {
                $scope.showCancelButton = false;
                TTYGContextService.emit(TTYGEventName.CANCEL_PENDING_QUESTION, $scope.chatItem);
            };

            /**
             * Regenerates the answer for the provided chat item.
             *
             * @param {ChatItemModel} chatItem - The chat item that contains the question to be regenerated.
             */
            $scope.regenerateQuestion = (chatItem) => {
                const regenerateChatItem = getEmptyChatItem();
                regenerateChatItem.setQuestionMessage(chatItem.getQuestionMessage());
                regenerateChatItem.question.timestamp = Date.now();
                $scope.askingChatItem = regenerateChatItem;
                askQuestion(regenerateChatItem);
                scrollToBottom();
            };

            /**
             * Handles pressing the Enter key in the question input.
             * Will not trigger if `Shift` or `Ctrl` keys are pressed, or if Ask button is disabled.
             *
             * @param {KeyboardEvent} $event - The keyboard event triggered by the user interaction.
             */
            $scope.onKeypressOnInput = ($event) => {
                if (!$scope.askingChatItem && $event.key === 'Enter' && !$event.shiftKey && !$event.ctrlKey) {
                    $scope.ask();
                }
            };

            $scope.onAskHowDeliveredAnswer = () => {
                const askHowDerivedAnswerChatItem = getEmptyChatItem();
                askHowDerivedAnswerChatItem.setQuestionMessage($translate.instant('ttyg.chat_panel.btn.derive_answer.label'));
                askHowDerivedAnswerChatItem.question.timestamp = Date.now();
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
                TTYGContextService.emit(TTYGEventName.CREATE_CHAT, $scope.chatItem);
            };

            const askQuestion = (chatItem) => {
                TTYGContextService.emit(TTYGEventName.ASK_QUESTION, chatItem);
            };

            const setAskingState = (isAsking) => {
                $scope.waitingForLastMessage = isAsking;
                $scope.showCancelButton = isAsking;
            };

            const onAskQuestionStarted = () => {
                setAskingState(true);
            };

            /**
             * Handles the update of the selected chat.
             * @param {ChatModel} chat - the new selected chat.
             */
            const onSelectedChatUpdated = (chat) => {
                $scope.chat = chat;
                if (!$scope.chat || $scope.chat.isNew()) {
                    // Do nothing if the chat is new and a question is currently being asked.
                    return;
                }
                $scope.loadingChat = false;
                const message = $scope.chatItem.question.message;
                $scope.chatItem = getEmptyChatItem();
                $scope.chatItem.question.message = message;
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
                setAskingState(false);
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
                    // Skip the loading indication if it is a new chat that hasn't received an answer yet.
                    $scope.loadingChat = !chat.isNew();
                    $scope.chatItem = getEmptyChatItem();
                    setAskingState(false);
                    focusQuestionInput();
                } else {
                    reset();
                }
            };

            const onQuestionFailure = () => {
                $scope.chatItem = cloneDeep($scope.askingChatItem);
                $scope.askingChatItem = undefined;
                setAskingState(false);
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
                focusQuestionInput();
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
                // Moving focus to the end of the JS call stack with a timeout, because on first Agent select,
                // the dropdown .agent-option steals the focus, or the browser assigns it to the document <body>.
                setTimeout(() => {
                    const inputElement = document.querySelector('.question-input');
                    if (inputElement) {
                        inputElement.focus();
                    }
                });
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
                $scope.chat = undefined;
                $scope.loadingChat = false;
                $scope.chatItem = getEmptyChatItem();
                $scope.askingChatItem = undefined;
                setAskingState(false);
                focusQuestionInput();
            };

            const init = () => {
                $scope.chatItem = getEmptyChatItem();
                focusQuestionInput();
            };

            // =========================
            // Subscriptions
            // =========================
            const subscriptions = [
                $scope.$watchCollection('chat.chatHistory.items', scrollToBottom),
                TTYGContextService.onSelectedChatUpdated(onSelectedChatUpdated),
                TTYGContextService.onLastMessageReceived(onLastMessageReceived),
                TTYGContextService.onSelectedAgentChanged(onSelectedAgentChanged),
                TTYGContextService.onSelectedChatChanged(onSelectedChatChanged),
                TTYGContextService.subscribe(TTYGEventName.LOAD_CHAT_FAILURE, onLoadChatFailure),
                TTYGContextService.subscribe(TTYGEventName.ASK_QUESTION_FAILURE, onQuestionFailure),
                TTYGContextService.subscribe(TTYGEventName.CREATE_CHAT_FAILURE, onQuestionFailure),
                TTYGContextService.subscribe(TTYGEventName.DELETE_CHAT_SUCCESSFUL, onChatDeleted),
                TTYGContextService.subscribe(TTYGEventName.ASK_QUESTION_STARTING, onAskQuestionStarted),
            ];

            const removeAllSubscribers = () => {
                subscriptions.forEach((subscription) => subscription());
            };

            // Deregister the watcher when the scope/directive is destroyed
            $scope.$on('$destroy', removeAllSubscribers);

            // =========================
            // Initialization
            // =========================
            init();
        },
    };
}
