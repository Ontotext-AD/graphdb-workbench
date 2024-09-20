import 'angular/ttyg/directives/chat-list.directive';
import 'angular/ttyg/directives/chat-panel.directive';
import 'angular/ttyg/directives/agent-list.directive';
import 'angular/ttyg/directives/agent-select-menu.directive';
import 'angular/ttyg/directives/no-agents-view.directive';
import 'angular/ttyg/controllers/agent-settings-modal.controller';
import 'angular/core/services/ttyg.service';
import 'angular/ttyg/services/ttyg-context.service';
import 'angular/ttyg/services/ttyg-storage.service';
import {TTYGEventName} from "../services/ttyg-context.service";
import {AGENTS_FILTER_ALL_KEY} from "../services/constants";
import {AgentListFilterModel} from "../../models/ttyg/agents";
import {ChatsListModel} from "../../models/ttyg/chats";
import {newAgentFormModelProvider} from "../services/agents.mapper";
import {SelectMenuOptionsModel} from "../../models/form-fields";
import {repositoryInfoMapper} from "../../rest/mappers/repositories-mapper";

const modules = [
    'toastr',
    'graphdb.framework.utils.localstorageadapter',
    'graphdb.framework.core.services.ttyg-service',
    'graphdb.framework.ttyg.services.ttygcontext',
    'graphdb.framework.ttyg.services.ttygstorage',
    'graphdb.framework.ttyg.directives.chat-list',
    'graphdb.framework.ttyg.directives.chat-panel',
    'graphdb.framework.ttyg.directives.agent-list',
    'graphdb.framework.ttyg.directives.agent-select-menu',
    'graphdb.framework.ttyg.directives.no-agents-view',
    'graphdb.framework.ttyg.controllers.agent-settings-modal'
];

angular
    .module('graphdb.framework.ttyg.controllers.ttyg-view', modules)
    .controller('TTYGViewCtrl', TTYGViewCtrl);

TTYGViewCtrl.$inject = ['$rootScope', '$scope', '$http', '$timeout', '$translate', '$uibModal', '$repositories', 'toastr', 'ModalService', 'LocalStorageAdapter', 'TTYGService', 'TTYGContextService', 'TTYGStorageService'];

function TTYGViewCtrl($rootScope, $scope, $http, $timeout, $translate, $uibModal, $repositories, toastr, ModalService, LocalStorageAdapter, TTYGService, TTYGContextService, TTYGStorageService) {

    // =========================
    // Private variables
    // =========================

    const subscriptions = [];

    const labels = {
        filter_all: $translate.instant('ttyg.agent.btn.filter.all')
    };

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
     * Agents list model.
     * @type {AgentListModel|undefined}
     */
    $scope.agents = undefined;
    /**
     * Flag to control the visibility of the loader when loading agent list on initial page load.
     * @type {boolean}
     */
    $scope.loadingAgents = false;
    /**
     * Flag to control the visibility of the loader when reloading agent list.
     * @type {boolean}
     */
    $scope.reloadingAgents = false;
    /**
     * Flag to control the visibility of the loader when creating an agent.
     * @type {boolean}
     */
    $scope.creatingAgent = false;

    $scope.connectorID = undefined;

    /**
     * A list of available repository IDs as a model for the agent list filter.
     * @type {AgentListFilterModel[]}
     */
    $scope.agentListFilterModel = [];

    /**
     * A list with the active repositories that is used in child components.
     * @type {string[]}
     */
    $scope.activeRepositoryList = [];

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
        TTYGContextService.selectChat(undefined);
    };

    $scope.onopen = $scope.onclose = () => angular.noop();

    /**
     * Toggles the visibility of the chats list sidebar.
     */
    $scope.toggleChatsListSidebar = () => {
        $scope.showChats = !$scope.showChats;
    };

    /**
     * Toggles the visibility of the agents list sidebar.
     */
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

    /**
     * Configures and opens the modal for creating a new agent.
     */
    $scope.onCreateAgent = () => {
        const activeRepositoryInfo = repositoryInfoMapper($repositories.getActiveRepositoryObject());
        const options = {
            templateUrl: 'js/angular/ttyg/templates/modal/agent-settings-modal.html',
            controller: 'AgentSettingsModalController',
            windowClass: 'agent-settings-modal',
            resolve: {
                dialogModel: function () {
                    return {
                        activeRepositoryInfo: activeRepositoryInfo,
                        activeRepositoryList: $scope.activeRepositoryList,
                        agentFormModel: newAgentFormModelProvider()
                    };
                }
            },
            size: 'lg'
        };
        $uibModal.open(options).result.then(
            // confirmed handler
            (data) => {
                createAgent(data);
            },
            // rejected handler
            (data) => {
                console.log(`create agent rejected`, data);
            });
    };

    /**
     * Handles the agent edit operation.
     * @param {AgentModel} agent
     */
    $scope.onEditAgent = (agent) => {
        console.log(`Edit agent`, agent);
    };

    // =========================
    // Private functions
    // =========================

    // TODO: remove
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
            .then((chats) => {
                return TTYGContextService.updateChats(chats);
            })
            .catch((error) => {
                toastr.error(getError(error, 0, 100));
                setupChatListPanel(new ChatsListModel());
            })
            .finally(() => {
                $scope.loadingChats = false;
            });
    };

    const loadAgents = () => {
        $scope.loadingAgents = true;
        return TTYGService.getAgents()
            .then((agents) => {
                return TTYGContextService.updateAgents(agents);
            })
            .catch((error) => {
                toastr.error(getError(error, 0, 100));
            })
            .finally(() => {
                $scope.loadingAgents = false;
            });
    };

    /**
     * Reloads the agents list.
     * @return {Promise<void>}
     */
    const reloadAgents = () => {
        $scope.reloadingAgents = true;
        return TTYGService.getAgents()
            .then((agents) => {
                return TTYGContextService.updateAgents(agents);
            })
            .catch((error) => {
                toastr.error(getError(error, 0, 100));
            })
            .finally(() => {
                $scope.reloadingAgents = false;
            });
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
        }
    };

    const getActiveRepositoryObjectHandler = (activeRepo) => {
        if (activeRepo) {
            onInit();
        }
    };

    /**
     * @param {ChatItemModel} chatItem
     */
    const onCreateNewChat = (chatItem) => {
        TTYGService.createConversation(chatItem)
            .then((newChatId) => {
                TTYGContextService.emit(TTYGEventName.CREATE_CHAT_SUCCESSFUL);
                TTYGContextService.selectChat(TTYGContextService.getChats().getChat(newChatId));
                TTYGContextService.emit(TTYGEventName.LOAD_CHAT);
            })
            .catch((error) => {
                TTYGContextService.emit(TTYGEventName.CREATE_CHAT_FAILURE);
                toastr.error($translate.instant('ttyg.chat.messages.create_failure'));
            });
    };

    /**
     * @param {ChatItemModel} chatItem
     */
    const onAskQuestion = (chatItem) => {
        TTYGService.askQuestion(chatItem)
            .then((answer) => {
                const selectedChat = TTYGContextService.getSelectedChat();
                if (selectedChat && selectedChat.id === chatItem.chatId) {
                    const item = chatItem;
                    item.answer = answer;
                    selectedChat.chatHistory.appendItem(item);
                    TTYGContextService.updateSelectedChat(selectedChat);
                }
            })
            .catch((error) => toastr.error(getError(error, 0, 100)));
    };

    /**
     * Handles the renaming of a chat by calling the service and updating the chats list.
     * Events are fired for success and failure cases.
     * @param {ChatModel} chat - the chat to be renamed.
     */
    const onRenameChat = (chat) => {
        TTYGService.renameConversation(chat)
            .then(() => {
                TTYGContextService.emit(TTYGEventName.RENAME_CHAT_SUCCESSFUL);
                TTYGContextService.emit(TTYGEventName.LOAD_CHAT);
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
        setupChatListPanel(chats);
    };

    /**
     * @param {ChatsListModel} chats - the new chats list.
     */
    const setupChatListPanel = (chats) => {
        if (chats.isEmpty()) {
            $scope.showChats = false;
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
                TTYGContextService.emit(TTYGEventName.DELETE_CHAT_SUCCESSFUL, chat);
                TTYGContextService.emit(TTYGEventName.LOAD_CHAT);
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
                TTYGContextService.emit(TTYGEventName.CHAT_EXPORT_SUCCESSFUL, chat);
                TTYGContextService.emit(TTYGEventName.LOAD_CHAT);
            })
            .catch((error) => {
                TTYGContextService.emit(TTYGEventName.CHAT_EXPORT_FAILURE);
                toastr.error($translate.instant('ttyg.chat.messages.export_failure'));
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

    /**
     * Creates a new agent with the given payload and reload the view components.
     * @param {*} newAgentPayload - the payload for the new agent
     */
    const createAgent = (newAgentPayload) => {
        $scope.creatingAgent = true;
        TTYGService.createAgent(newAgentPayload)
            .then((agent) => {
                return loadAgents();
            })
            .then(() => {
                // TODO: select the agent
            })
            .catch((error) => {
                toastr.error(getError(error, 0, 100));
            })
            .finally(() => {
                $scope.creatingAgent = false;
            });
    };

    /**
     * Handles the deletion of an agent by calling the service and reloading the agents list.
     * @param {AgentModel} agent - the agent to be deleted.
     */
    const onDeleteAgent = (agent) => {
        TTYGContextService.emit(TTYGEventName.DELETING_AGENT, {agentId: agent.id, inProgress: true});
        TTYGService.deleteAgent(agent.id)
            .then(() => {
                return reloadAgents();
            })
            .then(() => {
                TTYGContextService.emit(TTYGEventName.AGENT_DELETED, agent);
            })
            .catch((error) => {
                toastr.error(getError(error, 0, 100));
            })
            .finally(() => {
                TTYGContextService.emit(TTYGEventName.DELETING_AGENT, {agentId: agent.id, inProgress: false});
            });
    };

    /**
     * Creates a filter model for the agents list.
     */
    const buildAgentsFilterModel = () => {
        const currentRepository = $repositories.getActiveRepository();
        // TODO: this should be refreshed automatically when the repositories change
        const repositoryObjects = $repositories.getReadableRepositories().map((repo) => (
           new AgentListFilterModel(repo.id, repo.id, repo.id === currentRepository)
        ));
        $scope.agentListFilterModel = [
            new AgentListFilterModel(AGENTS_FILTER_ALL_KEY, labels.filter_all),
            ...repositoryObjects
        ];
    };

    const onSelectedChatChanged = (selectedChat) => {
        if (selectedChat) {
            TTYGService.getConversation(selectedChat.id)
                .then((chat) => {
                    TTYGContextService.updateSelectedChat(chat);
                });
        } else {
            TTYGContextService.updateSelectedChat(selectedChat);
        }
    };

    const onCopiedAnswerToClipboard = (chatItem) => {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(chatItem.answer.message)
                .then(() => TTYGContextService.emit(TTYGEventName.COPY_ANSWER_TO_CLIPBOARD_SUCCESSFUL))
                .catch(() => TTYGContextService.emit(TTYGEventName.COPY_ANSWER_TO_CLIPBOARD_FAILURE));
        }
    };

    /**
     * Handles the selection of an agent..
     * @param {AgentModel} agent
     */
    const onAgentSelected = (agent) => {
        TTYGStorageService.saveAgent(agent);
    };

    /**
     * Loads an agent using the agent ID stored in the local storage and selects it.
     */
    const setCurrentAgent = () => {
        const agentId = TTYGStorageService.getAgentId();
        TTYGService.getAgent(agentId).then((agent) => {
            if (agent) {
                TTYGContextService.selectAgent(agent);
            }
        });
    };

    const updateLabels = () => {
        labels.filter_all = $translate.instant('ttyg.agent.btn.filter.all');
        // recreate the repository list to trigger the update in the view
        buildAgentsFilterModel();
    };

    const buildRepositoryList = () => {
        $scope.activeRepositoryList = $repositories.getReadableRepositories()
            .map((repo) => (
                new SelectMenuOptionsModel({value: repo.id, label: repo.id}))
            );
    };


    // =========================
    // Subscriptions
    // =========================

    function removeAllListeners() {
        subscriptions.forEach((subscription) => subscription());
    }

    subscriptions.push($scope.$watch($scope.getActiveRepositoryObject, getActiveRepositoryObjectHandler));
    subscriptions.push(TTYGContextService.onSelectedChatChanged(onSelectedChatChanged));
    subscriptions.push(TTYGContextService.onChatsListChanged(onChatsChanged));
    subscriptions.push(TTYGContextService.subscribe(TTYGContextService.onAgentsListChanged(onAgentListChanged)));
    subscriptions.push(TTYGContextService.subscribe(TTYGEventName.CREATE_CHAT, onCreateNewChat));
    subscriptions.push(TTYGContextService.subscribe(TTYGEventName.RENAME_CHAT, onRenameChat));
    subscriptions.push(TTYGContextService.subscribe(TTYGEventName.DELETE_CHAT, onDeleteChat));
    subscriptions.push(TTYGContextService.subscribe(TTYGEventName.CHAT_EXPORT, onExportChat));
    subscriptions.push(TTYGContextService.subscribe(TTYGEventName.ASK_QUESTION, onAskQuestion));
    subscriptions.push(TTYGContextService.subscribe(TTYGEventName.LOAD_CHAT, loadChats));
    subscriptions.push(TTYGContextService.subscribe(TTYGEventName.CREATE_AGENT, $scope.onCreateAgent));
    subscriptions.push(TTYGContextService.subscribe(TTYGEventName.EDIT_AGENT, $scope.onEditAgent));
    subscriptions.push(TTYGContextService.subscribe(TTYGEventName.DELETE_AGENT, onDeleteAgent));
    subscriptions.push(TTYGContextService.subscribe(TTYGEventName.AGENT_SELECTED, onAgentSelected));
    subscriptions.push(TTYGContextService.subscribe(TTYGEventName.COPY_ANSWER_TO_CLIPBOARD, onCopiedAnswerToClipboard));
    subscriptions.push($rootScope.$on('$translateChangeSuccess', updateLabels));
    $scope.$on('$destroy', removeAllListeners);

    // =========================
    // Initialization
    // =========================

    function onInit() {
        setCurrentAgent();
        buildRepositoryList();
        loadAgents().then(() => {
            buildAgentsFilterModel();
            return loadChats();
        });
        initView();
    }
}
