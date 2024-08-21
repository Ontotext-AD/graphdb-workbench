import 'angular/core/filters/readableTimestamp';
import 'angular/core/directives/inline-editable-text/inline-editable-text.directive';
import {decodeHTML} from "../../../../app";
import {TTYGEventName} from "../services/ttyg-context.service";

const modules = [
    'graphdb.framework.core.filters.readable_titmestamp',
    'graphdb.framework.core.directives.inline-editable-text'
];

angular
    .module('graphdb.framework.ttyg.directives.chats-list', modules)
    .directive('chatList', ChatListComponent);

ChatListComponent.$inject = ['TTYGContextService', 'ModalService', '$translate'];

function ChatListComponent(TTYGContextService, ModalService, $translate) {
    return {
        restrict: 'E',
        templateUrl: 'js/angular/ttyg/templates/chat-list.html',
        scope: {
            chatList: '='
        },
        link: ($scope, element, attrs) => {

            // =========================
            // Public variables
            // =========================

            $scope.selectedChat = undefined;
            $scope.renamedChat = undefined;

            // =========================
            // Private variables
            // =========================

            // =========================
            // Public functions
            // =========================

            $scope.onSelectChatForRenaming = (chat) => {
                $scope.renamedChat = chat;
            };
            /**
             * Handles the selection of a chat.
             * @param {ChatModel} chat
             */
            $scope.onSelectChat = (chat) => {
                TTYGContextService.selectChat(chat);
                $scope.renamedChat = undefined;
            };

            $scope.onDeleteChat = (chat) => {
                const title = $translate.instant('ttyg.dialog.delete.title');
                const confirmDeleteMessage = decodeHTML($translate.instant('ttyg.dialog.delete.body', {chatName: chat.name}));
                ModalService.openConfirmation(title, confirmDeleteMessage, () => TTYGContextService.emit(TTYGEventName.DELETE_CHAT, chat));
            };

            $scope.onRenameChat = (newName, chat) => {
                chat.name = newName;
                $scope.renamedChat = undefined;
                TTYGContextService.emit(TTYGEventName.RENAME_CHAT, chat);
            };

            $scope.onCancelChatRenaming = () => {
                $scope.renamedChat = undefined;
            };

            // =========================
            // Subscription handlers
            // =========================

            const onSelectedChatChanged = (chat) => {
                $scope.selectedChat = chat;
            };

            // =========================
            // Subscriptions
            // =========================
            const subscriptions = [];

            const removeAllSubscribers = () => {
                subscriptions.forEach((subscription) => subscription());
            };

            subscriptions.push(TTYGContextService.onSelectedChatChanged(onSelectedChatChanged));

            // Deregister the watcher when the scope/directive is destroyed
            $scope.$on('$destroy', removeAllSubscribers);

            // =========================
            // Initialization
            // =========================

            function initialize() {
                console.log('ChatListComponent initialized');
            }
            initialize();
        }
    };
}
