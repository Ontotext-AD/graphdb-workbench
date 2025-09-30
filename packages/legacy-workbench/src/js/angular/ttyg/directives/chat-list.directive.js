import 'angular/core/directives/inline-editable-text/inline-editable-text.directive';
import {TTYGEventName} from "../services/ttyg-context.service";
import {getHumanReadableTimestamp} from "../services/ttyg.utils";
import {decodeHTML} from "../../../../app";

const modules = [
    'graphdb.framework.core.directives.inline-editable-text',
];

angular
    .module('graphdb.framework.ttyg.directives.chat-list', modules)
    .directive('chatList', ChatListComponent);

ChatListComponent.$inject = ['TTYGContextService', 'ModalService', '$translate', '$filter'];

function ChatListComponent(TTYGContextService, ModalService, $translate, $filter) {
    return {
        restrict: 'E',
        templateUrl: 'js/angular/ttyg/templates/chat-list.html',
        link: ($scope) => {
            // =========================
            // Public variables
            // =========================

            $scope.selectedChat = undefined;
            $scope.renamedChat = undefined;
            $scope.deletingChat = undefined;

            // =========================
            // Private variables
            // =========================

            // =========================
            // Public functions
            // =========================

            /**
             * Handles the selection of a chat for renaming.
             * @param {ChatModel} chat
             */
            $scope.onSelectChatForRenaming = (chat) => {
                $scope.renamedChat = chat;
            };

            /**
             * Handles the selection of a chat.
             * @param {ChatModel} chat
             */
            $scope.onSelectChat = (chat) => {
                if (!$scope.selectedChat || $scope.selectedChat.id !== chat.id) {
                    const nonPersistedChat = TTYGContextService.getChats().getNonPersistedChat();
                    if (nonPersistedChat) {
                        TTYGContextService.deleteChat(nonPersistedChat);
                    }
                    TTYGContextService.selectChat(chat);
                    $scope.renamedChat = undefined;
                }
            };

            /**
             * Handles the deletion of a chat.
             * @param {ChatModel} chat
             */
            $scope.onDeleteChat = (chat) => {
                const title = $translate.instant('ttyg.dialog.delete.title');
                const confirmDeleteMessage = decodeHTML($translate.instant('ttyg.dialog.delete.body', {chatName: chat.name}));
                ModalService.openConfirmation(title, confirmDeleteMessage, () => TTYGContextService.emit(TTYGEventName.DELETE_CHAT, chat));
            };

            /**
             * Handles the renaming of a chat.
             * @param {string} newName - the new name of the chat
             * @param {ChatModel} chat
             */
            $scope.onRenameChat = (newName, chat) => {
                chat.name = newName;
                $scope.renamedChat = undefined;
                TTYGContextService.emit(TTYGEventName.RENAME_CHAT, chat);
            };

            /**
             * Handles the export of a chat.
             * @param {ChatModel} chat
             */
            $scope.onExportChat = (chat) => {
                TTYGContextService.emit(TTYGEventName.CHAT_EXPORT, chat);
            };

            /**
             * Handles the cancelation of the chat renaming.
             */
            $scope.onCancelChatRenaming = () => {
                $scope.renamedChat = undefined;
            };

            $scope.getHumanReadableChatGroupTimestamp = (timestamp) => {
                return getHumanReadableTimestamp($translate, $filter, timestamp);
            };

            // =========================
            // Private functions
            // =========================

            /**
             * Handles the change of the selected chat.
             * @param {ChatModel} chat
             */
            const onSelectedChatChanged = (chat) => {
                $scope.selectedChat = chat;
            };

            /**
             * Handles the change of the chats list.
             * @param {ChatsListModel} chatList
             */
            const onChatsListChanged = (chatList) => {
                $scope.chatList = chatList;
            };

            /**
             * Handles the progress of deletion of a chat.
             * @param {{chatId: string, inProgress: boolean}} event
             */
            const onDeletingChat = (event) => {
                $scope.deletingChat = event;
            };

            // =========================
            // Subscriptions
            // =========================
            const subscriptions = [];

            const removeAllSubscribers = () => {
                subscriptions.forEach((subscription) => subscription());
            };

            subscriptions.push(TTYGContextService.onSelectedChatChanged(onSelectedChatChanged));
            subscriptions.push(TTYGContextService.onSelectedChatUpdated(onSelectedChatChanged));
            subscriptions.push(TTYGContextService.onChatsListChanged(onChatsListChanged));
            subscriptions.push(TTYGContextService.subscribe(TTYGEventName.DELETING_CHAT, onDeletingChat));

            // Deregister the watcher when the scope/directive is destroyed
            $scope.$on('$destroy', removeAllSubscribers);

            // =========================
            // Initialization
            // =========================

            function initialize() {
            }
            initialize();
        },
    };
}
