import 'angular/ttyg/directives/chat-list.directive';
import 'angular/ttyg/directives/agent-list.directive';
import 'angular/ttyg/services/ttyg.service';
import 'angular/ttyg/services/ttyg-context.service';
import {TTYGEventName} from "../services/ttyg-context.service";
import {ChatQuestion} from "../../models/ttyg/chat-question";
import {chatQuestionToChatMessageMapper} from "../services/chat-message.mapper";
import {cloneDeep} from "lodash";

const modules = [
    'toastr',
    'graphdb.framework.utils.localstorageadapter',
    'graphdb.framework.ttyg.services.ttyg-service',
    'graphdb.framework.ttyg.services.ttygcontext',
    'graphdb.framework.ttyg.directives.chat-list',
    'graphdb.framework.ttyg.directives.agent-list'
];

angular
    .module('graphdb.framework.ttyg.controllers', modules)
    .controller('TTYGViewCtrl', TTYGViewCtrl);

TTYGViewCtrl.$inject = ['$scope', '$http', '$timeout', '$translate', '$uibModal', '$repositories', 'toastr', 'ModalService', 'LocalStorageAdapter', 'TTYGService', 'TTYGContextService'];

const CHATGPTRETRIEVAL_ENDPOINT = 'rest/chat/retrieval';

function TTYGViewCtrl($scope, $http, $timeout, $translate, $uibModal, $repositories, toastr, ModalService, LocalStorageAdapter, TTYGService, TTYGContextService) {

    // =========================
    // Private variables
    // =========================

    const subscriptions = [];

    // =========================
    // Public variables
    // =========================

    $scope.helpTemplateUrl = "js/angular/ttyg/templates/chatInfo.html";
    /**
     * Controls the visibility of the chats list sidebar. By default, it is visible unless there are no chats.
     * @type {boolean}
     */
    $scope.showChats = true;
    /**
     * Controls the visibility of the agents list sidebar.
     * @type {boolean}
     */
    $scope.showAgents = true;
    /**
     * Chats list.
     * @type {ChatsListModel|undefined}
     */
    $scope.chats = undefined;
    /**
     * Flag to control the visibility of the loader when loading chat list.
     * @type {boolean}
     */
    $scope.loadingChats = false;
    $scope.loadingChat = false;
    /**
     * Current chat being displayed.
     * @type {ChatModel|undefined}
     */
    $scope.selectedChat = undefined;
    $scope.selectedAgent = undefined;

    /**
     * Agents list model.
     * @type {AgentListModel|undefined}
     */
    $scope.agents = undefined;
    /**
     * Flag to control the visibility of the loader when loading agent list.
     * @type {boolean}
     */
    $scope.loadingAgents = false;

    $scope.connectorID = undefined;
    $scope.chatQuestion = new ChatQuestion();

    $scope.history = [];
    $scope.askSettings = {
        "queryTemplate": {
            "query": "string"
        },
        "groundTruths": [],
        "echoVectorQuery": false,
        "topK": 5
    };

    // =========================
    // Public functions
    // =========================

    /**
     * Creates a new chat and selects it.
     */
    $scope.startNewChat = () => {
        $scope.chatQuestion = new ChatQuestion();
        TTYGContextService.selectChat(undefined);
    };

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

    $scope.onopen = $scope.onclose = () => angular.noop();

    $scope.toggleChatsListSidebar = () => {
        $scope.showChats = !$scope.showChats;
    };

    $scope.toggleAgentsListSidebar = () => {
        $scope.showAgents = !$scope.showAgents;
    };

    $scope.getIcon = (role) => {
        if (role === "question") {
            return "user";
        } else if (role === "assistant") {
            return "data";
        } else {
            return "help";
        }
    };

    $scope.clear = () => {
        ModalService.openSimpleModal({
            title: $translate.instant('common.confirm'),
            message: $translate.instant('ttyg.clear.history.confirmation'),
            warning: true
        }).result
            .then(function () {
                $scope.history = [];
                persist();
            });
    };

    $scope.openSettings = () => {
        const modalInstance = $uibModal.open({
            templateUrl: 'js/angular/ttyg/templates/modal/settings.html',
            controller: 'AgentSettingsDialogCtrl',
            size: 'lg',
            resolve: {
                data: function () {
                    return {
                        askSettings: $scope.askSettings,
                        connectorID: $scope.connectorID
                    };
                }
            }
        });

        modalInstance.result.then(function (result) {
            $scope.connectorID = result.connectorID;
            $scope.askSettings = result.askSettings;
            persist();
        });
    };

    /**
     * Handles the export of a chat by calling the service and updating the chats list.
     */
    $scope.onExportSelectedChat = () => {
        onExportChat(TTYGContextService.getSelectedChat());
    };

    // =========================
    // Private functions
    // =========================

    const createNewChat = () => {
        let newConversationid = undefined;
        TTYGService.createConversation($scope.chatQuestion)
            .then((conversationId) => {
                newConversationid = conversationId;
                return loadChats();
            })
            .then(() => {
                TTYGContextService.emit(TTYGEventName.CREATE_CHAT_SUCCESSFUL);
                TTYGContextService.selectChat(TTYGContextService.getChats().getChat(newConversationid));
            })
            .catch((error) => {
                TTYGContextService.emit(TTYGEventName.CREATE_CHAT_FAILURE);
                toastr.error($translate.instant('ttyg.chat.messages.create_failure'));
            });
    };

    const askQuestion = () => {
        if ($scope.selectedChat) {
            $scope.chatQuestion.role = 'user';
            $scope.selectedChat.messages.push(chatQuestionToChatMessageMapper($scope.chatQuestion));
        }
        const question = cloneDeep($scope.chatQuestion);
        createNewChatQuestion();
        TTYGService.askQuestion(question)
            .then((answer) => {
                $scope.selectedChat.messages.push(answer);
            })
            .catch((error) => toastr.error(getError(error, 0, 100)));
    };

    const createNewChatQuestion = () => {
        const chatQuestion = new ChatQuestion();
        if ($scope.selectedChat) {
            chatQuestion.conversationId = $scope.selectedChat.id;
        }

        if ($scope.selectedAgent) {
            chatQuestion.agentId = $scope.selectedAgent.id;
        }
        $scope.chatQuestion = chatQuestion;
    };

    const scrollToEnd = () => {
        $timeout(() => {
            const element = document.getElementById("messages-scrollable");
            element.scrollIntoView({behavior: "smooth", block: "end", inline: "nearest"});
        }, 0);
    };

    const persist = () => {
        const persisted = LocalStorageAdapter.get('ttyg') || {};
        persisted[$repositories.getActiveRepository()] = {
            "history": $scope.history,
            "connectorID": $scope.connectorID,
            "askSettings": $scope.askSettings
        };
        LocalStorageAdapter.set('ttyg', persisted);
    };

    const loadChats = () => {
        $scope.loadingChats = true;
        return TTYGService.getConversations()
            .finally(() => $scope.loadingChats = false);
    };

    const loadAgents = () => {
        $scope.loadingAgents = true;
        return TTYGService.getAgents()
            .finally(() => $scope.loadingAgents = false);
    };

    const initView = () => {
        const repoId = $repositories.getActiveRepository();
        if (repoId) {
            const stored = LocalStorageAdapter.get('ttyg');
            if (stored && stored[repoId]) {
                const s = stored[repoId];
                if (s.history) {
                    $scope.history = s.history;
                }
                $scope.connectorID = s.connectorID;
                if (s.askSettings) {
                    $scope.askSettings = s.askSettings;
                }
            }

            scrollToEnd();
        }
    };

    const getActiveRepositoryObjectHandler = (activeRepo) => {
        if (activeRepo) {
            onInit();
        }
    };

    /**
     * Handles the renaming of a chat by calling the service and updating the chats list.
     * Events are fired for success and failure cases.
     * @param {ChatModel} chat - the chat to be renamed.
     */
    const onRenameChat = (chat) => {
        TTYGService.renameConversation(chat)
            .then(() => {
                return loadChats();
            })
            .then(() => {
                TTYGContextService.emit(TTYGEventName.RENAME_CHAT_SUCCESSFUL);
            })
            .catch((error) => {
                TTYGContextService.emit(TTYGEventName.RENAME_CHAT_FAILURE);
                toastr.error($translate.instant('ttyg.chat.messages.rename_failure'));
            });
    };

    /**
     * Handles the change of the chats list.
     * When the list is empty, the chats list should be hidden.
     * When the list is not empty, the first chat should be selected
     * @param {ChatsListModel} chats - the new chats list.
     */
    const onChatsChanged = (chats) => {
        $scope.chats = chats;
        if (chats.isEmpty()) {
            $scope.showChats = false;
            $scope.selectedChat = undefined;
        } else {
            $scope.showChats = true;
            if (!TTYGContextService.getSelectedChat()) {
                TTYGContextService.selectChat($scope.chats.getFirstChat());
            }
        }
    };

    /**
     * Handles the deletion of a chat by calling the service and updating the chats list.
     * Events are fired for success and failure cases.
     * @param {ChatModel} chat - the chat to be deleted.
     */
    const onDeleteChat = (chat) => {
        TTYGService.deleteConversation(chat.id)
            .then(() => {
                return loadChats();
            })
            .then(() => {
                TTYGContextService.emit(TTYGEventName.DELETE_CHAT_SUCCESSFUL, chat);
            })
            .catch((error) => {
                TTYGContextService.emit(TTYGEventName.DELETE_CHAT_FAILURE);
                toastr.error($translate.instant('ttyg.chat.messages.delete_failure'));
            });
    };

    /**
     * Handles the export of a chat by calling the service and updating the chats list.
     * @param {ChatModel} chat - the chat to be exported.
     */
    const onExportChat = (chat) => {
        TTYGService.exportConversation(chat.id)
            .then(() => {
                return loadChats();
            })
            .then(() => {
                TTYGContextService.emit(TTYGEventName.CHAT_EXPORT_SUCCESSFUL, chat);
            })
            .catch((error) => {
                TTYGContextService.emit(TTYGEventName.CHAT_EXPORT_FAILURE);
                toastr.error($translate.instant('ttyg.chat.messages.export_failure'));
            });
    };

    /**
     * Handles the change of the selected chat.
     * @param {ChatModel} chat - the new selected chat.
     */
    const onSelectedChatChanged = (chat) => {
        if (!chat) {
            $scope.selectedChat = undefined;
            return;
        }
        if ($scope.selectedChat && $scope.selectedChat.id === chat.id) {
            return;
        }

        TTYGService.getConversation(chat.id)
            .then((chat) => {
                $scope.selectedChat = chat;
                createNewChatQuestion();
            });
    };

    /**
     * Handles the change of the agents list.
     * @param {AgentListModel} agents - the new agents list.
     */
    const onAgentListChanged = (agents) => {
        $scope.agents = agents;
        if (agents.isEmpty()) {
            $scope.showAgents = false;
        } else {
            $scope.showAgents = true;
        }
    };


    // =========================
    // Subscriptions
    // =========================

    function removeAllListeners() {
        subscriptions.forEach((subscription) => subscription());
    }

    subscriptions.push($scope.$watch($scope.getActiveRepositoryObject, getActiveRepositoryObjectHandler));
    subscriptions.push(TTYGContextService.onChatsListChanged(onChatsChanged));
    subscriptions.push(TTYGContextService.subscribe(TTYGEventName.RENAME_CHAT, onRenameChat));
    subscriptions.push(TTYGContextService.subscribe(TTYGEventName.DELETE_CHAT, onDeleteChat));
    subscriptions.push(TTYGContextService.subscribe(TTYGEventName.CHAT_EXPORT, onExportChat));
    subscriptions.push(TTYGContextService.onSelectedChatChanged(onSelectedChatChanged));
    subscriptions.push(TTYGContextService.subscribe(TTYGEventName.AGENT_LIST_UPDATED, onAgentListChanged));
    $scope.$on('$destroy', removeAllListeners);

    // =========================
    // Initialization
    // =========================

    function onInit() {
        Promise.all([loadChats(), loadAgents()])
            .then(([chats, agents]) => {
                // TODO: directly set the chats and agents in the scope instead of going through the context event
                TTYGContextService.updateChats(chats);
                TTYGContextService.updateAgents(agents);
            })
        .catch((error) => toastr.error(getError(error, 0, 100)));
        initView();
    }
}
