import 'angular/core/directives/inline-editable-text/inline-editable-text.directive';
import {decodeHTML} from "../../../../app";
import {TTYGEventName} from "../services/ttyg-context.service";

import {ChatModel, DUMMY_CHAT_ID} from "../../models/ttyg/chats";
import {md5HashGenerator} from "../../utils/hash-utils";

const modules = [
    'graphdb.framework.core.directives.inline-editable-text'
];

angular
    .module('graphdb.framework.ttyg.directives.chat-list', modules)
    .directive('chatList', ChatListComponent);

ChatListComponent.$inject = ['TTYGContextService', 'ModalService', '$translate'];

function ChatListComponent(TTYGContextService, ModalService, $translate) {
    return {
        restrict: 'E',
        templateUrl: 'js/angular/ttyg/templates/chat-list.html',
        link: ($scope, element, attrs) => {

            // =========================
            // Public variables
            // =========================

            $scope.DUMMY_CHAT_ID = DUMMY_CHAT_ID;
            $scope.selectedChat = undefined;
            $scope.renamedChat = undefined;

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

            $scope.getHumanReadableTimestamp = (timestamp) => {
                const date = new Date(timestamp);
                const today = new Date();

                // Get start of today
                const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());

                // Get start of yesterday
                const yesterdayStart = new Date(todayStart);
                yesterdayStart.setDate(todayStart.getDate() - 1);

                // Get start of the timestamp's day
                const dateStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());

                if (dateStart.getTime() === todayStart.getTime()) {
                    return $translate.instant('common.dates.today');
                } else if (dateStart.getTime() === yesterdayStart.getTime()) {
                    return $translate.instant('common.dates.yesterday');
                } else {
                    // returns in format like "8/16/2024"
                    return date.toLocaleDateString();
                }
            };

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

            const onNewChat = () => {
                if ($scope.selectedChat && $scope.selectedChat.id === $scope.DUMMY_CHAT_ID) {
                    return;
                }
                const data = {
                    id: $scope.DUMMY_CHAT_ID,
                    timestamp: Math.floor(Date.now() / 1000)
                };
                const chatModel = new ChatModel(data, md5HashGenerator());
                $scope.chatList.appendChat(chatModel);
                TTYGContextService.selectChat(chatModel);
            };

            // =========================
            // Subscriptions
            // =========================
            const subscriptions = [];

            const removeAllSubscribers = () => {
                subscriptions.forEach((subscription) => subscription());
            };

            subscriptions.push(TTYGContextService.onSelectedChatChanged(onSelectedChatChanged));
            subscriptions.push(TTYGContextService.onChatsListChanged(onChatsListChanged));
            subscriptions.push(TTYGContextService.subscribe(TTYGEventName.NEW_CHAT, onNewChat));

            // Deregister the watcher when the scope/directive is destroyed
            $scope.$on('$destroy', removeAllSubscribers);

            // =========================
            // Initialization
            // =========================

            function initialize() {
            }
            initialize();
        }
    };
}
