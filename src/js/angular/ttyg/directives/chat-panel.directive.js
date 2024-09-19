import {TTYGEventName} from "../services/ttyg-context.service";
import {CHAT_MESSAGE_ROLE, ChatMessageModel} from "../../models/ttyg/chat-message";
import {ChatItemModel} from "../../models/ttyg/chat-item";

const modules = [];

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
                    askQuestion($scope.chatItem);
                }
            };

            /**
             * Regenerates the answer for the provided chat item.
             *
             * @param {ChatItemModel} chatItem - The chat item that contains the question to be regenerated.
             */
            $scope.regenerateQuestion = (chatItem) => {
                const regenerateChatItem = getEmptyChatItem();
                regenerateChatItem.setQuestionMessage(chatItem.getQuestionMessage());
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

            const setupNewChatItem = () => {
                $scope.chatItem = getEmptyChatItem();
            };

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
                // TODO: Remove the manual update of $scope.chat and $scope.chatItem wrapped in $apply,
                // as AngularJS currently does not detect the changes automatically for some reason.
                if (!$scope.$$phase) {
                    $scope.$apply(() => {
                        $scope.chat = chat;
                        setupNewChatItem();
                    });
                } else {
                    $scope.chat = chat;
                    setupNewChatItem();
                }
                scrollToBottom();
            };

            const onCopied = () => {
                toastr.success($translate.instant('ttyg.chat_panel.messages.answer_copy_successful'));
            };

            const onCopyFailed = () => {
                toastr.success($translate.instant('ttyg.chat_panel.messages.answer_copy_failed'));
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

            const scrollToBottom = () => {
                const chatDetailsElement = element.find(".chat-details")[0];
                chatDetailsElement.scrollTop = chatDetailsElement.scrollHeight;
            };

            const init = () => {
                $scope.chatItem = getEmptyChatItem();
            };

            // =========================
            // Subscriptions
            // =========================
            const subscriptions = [];

            const removeAllSubscribers = () => {
                subscriptions.forEach((subscription) => subscription());
            };

            subscriptions.push(TTYGContextService.onSelectedChatUpdated(onChatChanged));
            subscriptions.push(TTYGContextService.subscribe(TTYGEventName.COPY_ANSWER_TO_CLIPBOARD_SUCCESSFUL, onCopied));
            subscriptions.push(TTYGContextService.subscribe(TTYGEventName.COPY_ANSWER_TO_CLIPBOARD_FAILURE, onCopyFailed));
            subscriptions.push(TTYGContextService.subscribe(TTYGEventName.AGENT_SELECTED, onSelectedAgentChanged));
            // TODO: add subscription for agent changed, and call "onSelectedAgentChanged"

            // Deregister the watcher when the scope/directive is destroyed
            $scope.$on('$destroy', removeAllSubscribers);

            // =========================
            // Initialization
            // =========================
            init();
        }
    };
}
