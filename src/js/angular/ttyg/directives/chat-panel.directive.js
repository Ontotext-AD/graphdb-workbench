import 'angular/core/services/markdown.service';
import {TTYGEventName} from "../services/ttyg-context.service";
import {CHAT_MESSAGE_ROLE, ChatMessageModel} from "../../models/ttyg/chat-message";
import {ChatItemModel, ChatItemsListModel} from "../../models/ttyg/chat-item";

const modules = [
    'graphdb.framework.core.services.markdown-service'
];

angular
    .module('graphdb.framework.ttyg.directives.chat-panel', modules)
    .directive('chatPanel', ChatPanelComponent);

ChatPanelComponent.$inject = ['toastr', '$translate', 'TTYGContextService', 'MarkdownService'];

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
function ChatPanelComponent(toastr, $translate, TTYGContextService, MarkdownService) {
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
             * @type {ChatItemsListModel}
             */
            $scope.chatHistory = undefined;

            /**
             * @type {AgentModel}
             */
            $scope.selectedAgent = undefined;

            /**
             * @type {ChatItemModel}
             */
            $scope.chatItem = undefined;

            /**
             * Flag that indicates when a question is being asked.
             * @type {boolean}
             */
            $scope.asking = false;

            /**
             * Flag that indicates that the chat is about to be changed.
             * @type {boolean}
             */
            $scope.loadChat = false;

            $scope.MarkdownService = MarkdownService;

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
                $scope.asking = true;
                $scope.chatHistory.appendItem($scope.chatItem);
                if (!$scope.chatItem.chatId) {
                    createNewChat();
                } else {
                    askQuestion($scope.chatItem);
                }
                $scope.chatItem = getEmptyChatItem();
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
                $scope.chatHistory.appendItem(regenerateChatItem);
                askQuestion(regenerateChatItem);
            };

            /**
             * Copies the answer of the provided chat item to the clipboard.
             *
             * @param {ChatItemModel} chatItem - The chat item containing the answer to be copied to the clipboard.
             */
            $scope.copyAnswerToClipboard = (chatItem) => {
                TTYGContextService.emit(TTYGEventName.COPY_ANSWER_TO_CLIPBOARD, chatItem);
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
                $scope.loadChat = false;
                if ($scope.chat) {
                    $scope.chatHistory = new ChatItemsListModel(chat.chatHistory.items);
                } else {
                    $scope.chatHistory = new ChatItemsListModel();
                }
                $scope.chatItem = getEmptyChatItem();
                $scope.asking = false;
                focusQuestionInput();
            };

            const onCopied = () => {
                toastr.success($translate.instant('ttyg.chat_panel.messages.answer_copy_successful'));
            };

            const onBeforeSelectedChatChanged = (chatId) => {
                // Skip loading indication if the chat is a dummy.
                $scope.loadChat = chatId;
                $scope.chatHistory = new ChatItemsListModel();
                $scope.chatItem = getEmptyChatItem();
                focusQuestionInput();
            };

            const onCopyFailed = () => {
                toastr.success($translate.instant('ttyg.chat_panel.messages.answer_copy_failed'));
            };

            const onAskingQuestionFailure = () => {
                $scope.asking = false;
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
                element.find('.question-input').focus();
            };

            const scrollToBottom = () => {
                // Call it in a timeout to ensure that Angular's digest cycle is finished and all elements are displayed.
                setTimeout(() => {
                    const chatDetailsElement = element.find(".chat-details")[0];
                    chatDetailsElement.scrollTop = chatDetailsElement.scrollHeight;
                });
            };

            const init = () => {
                $scope.chatHistory = new ChatItemsListModel();
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

            subscriptions.push($scope.$watchCollection('chatHistory.items', scrollToBottom));
            subscriptions.push(TTYGContextService.onSelectedChatUpdated(onChatChanged));
            subscriptions.push(TTYGContextService.onSelectedAgentChanged(onSelectedAgentChanged));
            subscriptions.push(TTYGContextService.subscribe(TTYGEventName.COPY_ANSWER_TO_CLIPBOARD_SUCCESSFUL, onCopied));
            subscriptions.push(TTYGContextService.subscribe(TTYGEventName.COPY_ANSWER_TO_CLIPBOARD_FAILURE, onCopyFailed));
            subscriptions.push(TTYGContextService.subscribe(TTYGEventName.ASK_QUESTION_FAILURE, onAskingQuestionFailure));
            subscriptions.push(TTYGContextService.subscribe(TTYGEventName.SELECTED_CHAT_WILL_CHANGE, onBeforeSelectedChatChanged));

            // Deregister the watcher when the scope/directive is destroyed
            $scope.$on('$destroy', removeAllSubscribers);

            // =========================
            // Initialization
            // =========================
            init();
        }
    };
}
