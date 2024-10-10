import 'angular/ttyg/directives/chat-list.directive';
import 'angular/ttyg/directives/chat-panel.directive';
import 'angular/ttyg/directives/agent-list.directive';
import 'angular/ttyg/directives/agent-select-menu.directive';
import 'angular/ttyg/directives/no-agents-view.directive';
import 'angular/ttyg/controllers/agent-settings-modal.controller';
import 'angular/core/services/ttyg.service';
import 'angular/ttyg/services/ttyg-context.service';
import 'angular/ttyg/services/ttyg-storage.service';
import {TTYGEventName} from '../services/ttyg-context.service';
import {AGENT_OPERATION, AGENTS_FILTER_ALL_KEY} from '../services/constants';
import {AgentListFilterModel, AgentModel} from '../../models/ttyg/agents';
import {ChatModel, ChatsListModel} from '../../models/ttyg/chats';
import {agentFormModelMapper} from '../services/agents.mapper';
import {SelectMenuOptionsModel} from '../../models/form-fields';
import {repositoryInfoMapper} from '../../rest/mappers/repositories-mapper';
import {saveAs} from 'lib/FileSaver-patch';
import {AgentSettingsModal} from "../model/agent-settings-modal";
import {decodeHTML} from "../../../../app";
import {status as httpStatus} from "../../models/http-status";
import {md5HashGenerator} from "../../utils/hash-utils";

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

TTYGViewCtrl.$inject = [
    '$window',
    '$rootScope',
    '$scope',
    '$http',
    '$timeout',
    '$translate',
    '$uibModal',
    '$repositories',
    'toastr',
    'ModalService',
    'LocalStorageAdapter',
    'TTYGService',
    'TTYGContextService',
    'TTYGStorageService'];

function TTYGViewCtrl(
    $window,
    $rootScope,
    $scope,
    $http,
    $timeout,
    $translate,
    $uibModal,
    $repositories,
    toastr,
    ModalService,
    LocalStorageAdapter,
    TTYGService,
    TTYGContextService,
    TTYGStorageService) {

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
     * Controls the visibility of the help panel.
     * @type {boolean}
     */
    $scope.isHelpVisible = false;

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
     * The model of the selected agent.
     * @type {AgentModel|undefined}
     */
    $scope.selectedAgent = undefined;
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
        let nonPersistedChat = TTYGContextService.getChats().getNonPersistedChat();
        if (!nonPersistedChat) {
            nonPersistedChat = getEmptyChat();
            TTYGContextService.addChat(nonPersistedChat);
        }
        TTYGContextService.selectChat(nonPersistedChat);
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
     * Handles the help message open event.
     */
    $scope.onOpenHelp = () => {
        $scope.isHelpVisible = true;
    };

    /**
     * Handles the export of a chat by calling the service and updating the chats list.
     */
    $scope.onExportSelectedChat = () => {
        onExportChat(TTYGContextService.getSelectedChat());
    };

    /**
     * Gets the default agent from the TTYGContextService or fetches it from the server if not available.
     *
     * @return {Promise<AgentModel>} A promise that resolves to the default agent.
     */
    const getDefaultAgent = () => {
        const defaultAgent = TTYGContextService.getDefaultAgent();
        if (defaultAgent) {
            return Promise.resolve(defaultAgent);
        } else {
            return TTYGService.getDefaultAgent()
                .then((response) => {
                    TTYGContextService.setDefaultAgent(response);
                    return response;
                });
        }
    };

    /**
     * Configures and opens the modal for creating a new agent.
     */
    $scope.onOpenNewAgentSettings = () => {
        getDefaultAgent()
            .then((agentDefaultValues) => {
                const activeRepositoryInfo = repositoryInfoMapper($repositories.getActiveRepositoryObject());
                agentDefaultValues.repositoryId = activeRepositoryInfo.id;
                const agentFormModel = agentFormModelMapper(new AgentModel({}), agentDefaultValues, true);
                const options = {
                    templateUrl: 'js/angular/ttyg/templates/modal/agent-settings-modal.html',
                    controller: 'AgentSettingsModalController',
                    windowClass: 'agent-settings-modal',
                    resolve: {
                        dialogModel: function () {
                            return new AgentSettingsModal(
                                activeRepositoryInfo,
                                $scope.activeRepositoryList,
                                agentFormModel,
                                AGENT_OPERATION.CREATE
                            );
                        }
                    },
                    size: 'lg'
                };
                return options;
            })
            .then((options) => {
                $uibModal.open(options).result.then(reloadAgents);
            });
    };

    /**
     * Handles the agent edit operation. If the agent is not provided it is assumed that we need to edit the selected
     * agent which can be obtained from the context service.
     * @param {AgentModel|undefined} agent
     */
    $scope.onOpenAgentSettings = (agent) => {
        let agentToEdit = agent;
        if (!agentToEdit) {
            agentToEdit = TTYGContextService.getSelectedAgent();
        }
        getDefaultAgent()
            .then((agentDefaultValues) => {
                const agentFormModel = agentFormModelMapper(agentToEdit, agentDefaultValues);
                const activeRepositoryInfo = repositoryInfoMapper($repositories.getActiveRepositoryObject());
                const options = {
                    templateUrl: 'js/angular/ttyg/templates/modal/agent-settings-modal.html',
                    controller: 'AgentSettingsModalController',
                    windowClass: 'agent-settings-modal',
                    resolve: {
                        dialogModel: function () {
                            return new AgentSettingsModal(
                                activeRepositoryInfo,
                                $scope.activeRepositoryList,
                                agentFormModel,
                                AGENT_OPERATION.EDIT
                            );
                        }
                    },
                    size: 'lg'
                };
                return options;
            })
            .then((options) => {
                $uibModal.open(options).result.then(
                    (updatedAgent) => {
                        const hasSelectedAgent = TTYGContextService.getSelectedAgent();
                        if (hasSelectedAgent && updatedAgent.id === hasSelectedAgent.id) {
                            TTYGContextService.selectAgent(updatedAgent);
                        }
                        reloadAgents();
                    });
            });
    };

    /**
     * Opens the agent settings modal with the agent to clone.
     * @param {AgentModel} agentToClone
     */
    $scope.onOpenCloneAgentSettings = (agentToClone) => {
        const agentFormModel = agentFormModelMapper(agentToClone, agentToClone);
        agentFormModel.name = `clone-${agentFormModel.name}`;
        const activeRepositoryInfo = repositoryInfoMapper($repositories.getActiveRepositoryObject());
        const options = {
            templateUrl: 'js/angular/ttyg/templates/modal/agent-settings-modal.html',
            controller: 'AgentSettingsModalController',
            windowClass: 'agent-settings-modal',
            resolve: {
                dialogModel: function () {
                    return new AgentSettingsModal(
                        activeRepositoryInfo,
                        $scope.activeRepositoryList,
                        agentFormModel,
                        AGENT_OPERATION.CLONE
                    );
                }
            },
            size: 'lg'
        };
        $uibModal.open(options).result.then(
            (updatedAgent) => {
                const hasSelectedAgent = TTYGContextService.getSelectedAgent();
                if (hasSelectedAgent && updatedAgent.id === hasSelectedAgent.id) {
                    TTYGContextService.selectAgent(updatedAgent);
                }
                reloadAgents();
            });
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

    /**
     * Loads the agents list from the server and updates the context service.
     * @param {boolean} showLoader
     * @return {Promise<void>}
     */
    const loadAgents = (showLoader = true) => {
        $scope.loadingAgents = showLoader;
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
     * Reloads the agents list. Basically the same as loadAgents but this sets the reloadingAgents flag that cause only
     * the agents list panel to be masked by the loader.
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

    const getEmptyChat = () => {
        const data = {
            name: "\u00B7 \u00B7 \u00B7",
            timestamp: Math.floor(Date.now() / 1000)
        };
        return new ChatModel(data, md5HashGenerator());
    };

    /**
     * @param {ChatItemModel} chatItem
     */
    const onCreateNewChat = (chatItem) => {
        $scope.startNewChat();

        TTYGService.createConversation(chatItem)
            .then((chatAnswer) => {
                TTYGContextService.emit(TTYGEventName.CREATE_CHAT_SUCCESSFUL);
                // TODO discuse we have all answers id and can update selected chats without loading it.
                return TTYGService.getConversation(chatAnswer.chatId);
            })
            .then((chat) => {
                const selectedChat = TTYGContextService.getSelectedChat();
                // If the selected chat is not changed during the creation process.
                if (selectedChat && !selectedChat.id) {
                    const nonPersistedChat = TTYGContextService.getChats().getNonPersistedChat();
                    TTYGContextService.updateSelectedChat(chat);
                    TTYGContextService.replaceChat(chat, nonPersistedChat);
                }
                TTYGContextService.emit(TTYGEventName.LOAD_CHATS);
            })
            .catch(() => {
                TTYGContextService.emit(TTYGEventName.CREATE_CHAT_FAILURE);
                toastr.error($translate.instant('ttyg.chat.messages.create_failure'));
            });
    };

    /**
     * @param {ChatItemModel} chatItem
     */
    const onAskQuestion = (chatItem) => {
        TTYGService.askQuestion(chatItem)
            .then((chatAnswer) => {
                const selectedChat = TTYGContextService.getSelectedChat();
                if (selectedChat && selectedChat.id === chatItem.chatId) {
                    selectedChat.timestamp = chatAnswer.timestamp;
                    const item = chatItem;
                    chatItem.answers = chatAnswer.messages;
                    selectedChat.chatHistory.appendItem(item);
                    TTYGContextService.updateSelectedChat(selectedChat);
                    // TODO reorder the list of chats
                }
            })
            .catch((error) => {
                TTYGContextService.emit(TTYGEventName.ASK_QUESTION_FAILURE);
                toastr.error(getError(error, 0, 100));
            });
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
                TTYGContextService.emit(TTYGEventName.LOAD_CHATS);
            })
            .catch(() => {
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
        TTYGContextService.emit(TTYGEventName.DELETING_CHAT, {chatId: chat.id, inProgress: true});
        TTYGService.deleteConversation(chat.id)
            .then(() => {
                TTYGContextService.emit(TTYGEventName.DELETE_CHAT_SUCCESSFUL, chat);
                TTYGContextService.emit(TTYGEventName.LOAD_CHATS);
            })
            .catch(() => {
                TTYGContextService.emit(TTYGEventName.DELETE_CHAT_FAILURE);
                toastr.error($translate.instant('ttyg.chat.messages.delete_failure'));
            })
            .finally(() => TTYGContextService.emit(TTYGEventName.DELETING_CHAT, {chatId: chat.id, inProgress: false}));
    };

    /**
     * Handles the export of a chat by calling the service and updating the chats list.
     * @param {ChatModel} chat - the chat to be exported.
     */
    const onExportChat = (chat) => {
        TTYGService.exportConversation(chat.id)
            .then(function ({data, filename}) {
                saveAs(data, filename);
                TTYGContextService.emit(TTYGEventName.CHAT_EXPORT_SUCCESSFUL, chat);
                TTYGContextService.emit(TTYGEventName.LOAD_CHATS);
            })
            .catch(() => {
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
        $scope.showAgents = !agents.isEmpty();
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
                if ($scope.selectedAgent && $scope.selectedAgent.id === agent.id) {
                    $scope.selectedAgent = undefined;
                }
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
        const repositoryObjects = $repositories.getReadableGraphdbRepositories()
            .map((repo) => (
           new AgentListFilterModel(repo.id, repo.id, repo.id === currentRepository)
        ));
        $scope.agentListFilterModel = [
            new AgentListFilterModel(AGENTS_FILTER_ALL_KEY, labels.filter_all),
            ...repositoryObjects
        ];
    };

    const onSelectedChatChanged = (selectedChat) => {
        // If the selected chat has no ID, it indicates that this is a new (dummy) chat
        // and does not need to be loaded from the server.
        if (selectedChat && selectedChat.id) {
            TTYGService.getConversation(selectedChat.id)
                .then((chat) => {
                    TTYGContextService.updateSelectedChat(chat);
                    TTYGStorageService.saveChat(selectedChat);
                })
                .catch((error) => {
                    // If the chat is not found and the server returns 404, then we notify the user
                    // and remove the chat from the chat list. It's expected that the backend would
                    // also remove it and next time the list is loaded the chat will no longer be there.
                    if (error.status === httpStatus.NOT_FOUND) {
                        notifyForMissingChat(selectedChat);
                        TTYGContextService.emit(TTYGEventName.LOAD_CHAT_FAILURE, selectedChat);
                    }
                });
        } else {
            TTYGContextService.updateSelectedChat(selectedChat);
        }
    };

    const notifyForMissingChat = (selectedChat) => {
        ModalService.openModalAlert({
            title: $translate.instant('ttyg.chat.dialog.chat_is_missing.title'),
            message: $translate.instant('ttyg.chat.dialog.chat_is_missing.body')
        }).result
            .then(function () {
                TTYGContextService.deleteChat(selectedChat);
            });
    };

    /**
     * Handles the selection of an agent.
     * @param {AgentModel} agent
     */
    const onAgentSelected = (agent) => {
        $scope.selectedAgent = agent;
        TTYGStorageService.saveAgent(agent);
    };

    /**
     * Loads an agent using the agent ID stored in the local storage and selects it.
     */
    const setCurrentAgent = () => {
        const agentId = TTYGStorageService.getAgentId();
        if (!agentId) {
            return;
        }
        TTYGService.getAgent(agentId).then((agent) => {
            if (agent) {
                TTYGContextService.selectAgent(agent);
            }
        });
    };

    /**
     * Opens the create similarity view. It checks if the passed repository ID matches the one selected by the workbench.
     * If they do not match, a confirmation dialog is shown to inform the user that the selected repository
     * will be automatically changed upon confirmation.
     *
     * @param {{repositoryId: string}} payload - The payload containing the repository ID.
     */
    const onGoToCreateSimilarityView = (payload) => {
        if (payload.repositoryId !== $repositories.getActiveRepository()) {
            const repository = $repositories.getRepository(payload.repositoryId);
            if (repository) {
                ModalService.openConfirmation(
                    $translate.instant('common.confirm'),
                    decodeHTML($translate.instant('ttyg.agent.create_agent_modal.dialog.confirm_repository_change_before_open_similarity.body', {repositoryId: repository.id})),
                    () => {
                        $repositories.setRepository(repository);
                        openCreateSimilarityView();
                    });
            }

        } else {
            openCreateSimilarityView();
        }
    };

    const openCreateSimilarityView = () => {
        $window.open('/similarity/index/create', '_blank');
    };

    /**
     * Opens the connectors view. It checks if the passed repository ID matches the one selected by the workbench.
     * If they do not match, a confirmation dialog is shown to inform the user that the selected repository
     * will be automatically changed upon confirmation.
     *
     * @param {{repositoryId: string}} payload - The payload containing the repository ID.
     */
    const onGoToConnectorsView = (payload) => {
        if (payload.repositoryId !== $repositories.getActiveRepository()) {
            const repository = $repositories.getRepository(payload.repositoryId);
            if (repository) {
                ModalService.openConfirmation(
                    $translate.instant('common.confirm'),
                    decodeHTML($translate.instant('ttyg.agent.create_agent_modal.dialog.confirm_repository_change_before_open_connectors.body', {repositoryId: repository.id})),
                    () => {
                        $repositories.setRepository(repository);
                        openConnectorsView();
                    });
            }

        } else {
            openConnectorsView();
        }
    };

    const openConnectorsView = () => {
        $window.open('/connectors', '_blank');
    };

    /**
     * Opens SPARQL editor view with passed query.
     * @param {{query: string, repositoryId: string}} payload
     */
    const onGoToSparqlEditorView = (payload) => {
        if (payload.repositoryId !== $repositories.getActiveRepository()) {
            const repository = $repositories.getRepository(payload.repositoryId);
            if (repository) {
                ModalService.openConfirmation(
                    $translate.instant('common.confirm'),
                    decodeHTML($translate.instant('ttyg.chat_panel.dialog.confirm_repository_change.body', {repositoryId: payload.repositoryId})),
                    () => {
                        $repositories.setRepository(repository);
                        openInSparqlEditorInNewTab(payload.query);
                    });
            }

        } else {
            openInSparqlEditorInNewTab(payload.query);
        }
    };

    const openInSparqlEditorInNewTab = (query) => {
        $window.open(`/sparql?query=${encodeURIComponent(query)}&execute=true`, '_blank');
    };

    /**
     * Loads a chat using the chat ID stored in the local storage and selects it.
     */
    const setCurrentChat = () => {
        const chatId = TTYGStorageService.getChatId();
        if (!chatId) {
            return;
        }
        TTYGService.getConversation(chatId).then((chat) => {
            if (chat) {
                TTYGContextService.selectChat(chat);
            }
        });
    };

    const updateLabels = () => {
        labels.filter_all = $translate.instant('ttyg.agent.btn.filter.all');
        // recreate the repository list to trigger the update in the view
        buildAgentsFilterModel();
    };

    const buildRepositoryList = () => {
        $scope.activeRepositoryList = $repositories.getReadableGraphdbRepositories()
            .map((repo) => (
                new SelectMenuOptionsModel({
                    value: repo.id,
                    label: repo.id,
                    data: {
                        repository: repo
                    }
                }))
            );
    };


    // =========================
    // Subscriptions
    // =========================

    function cleanUp() {
        subscriptions.forEach((subscription) => subscription());
        TTYGContextService.resetContext();
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
    subscriptions.push(TTYGContextService.subscribe(TTYGEventName.LOAD_CHATS, loadChats));
    subscriptions.push(TTYGContextService.subscribe(TTYGEventName.OPEN_AGENT_SETTINGS, $scope.onOpenNewAgentSettings));
    subscriptions.push(TTYGContextService.subscribe(TTYGEventName.EDIT_AGENT, $scope.onOpenAgentSettings));
    subscriptions.push(TTYGContextService.subscribe(TTYGEventName.CLONE_AGENT, $scope.onOpenCloneAgentSettings));
    subscriptions.push(TTYGContextService.subscribe(TTYGEventName.DELETE_AGENT, onDeleteAgent));
    subscriptions.push(TTYGContextService.subscribe(TTYGEventName.AGENT_SELECTED, onAgentSelected));
    subscriptions.push(TTYGContextService.subscribe(TTYGEventName.GO_TO_CREATE_SIMILARITY_VIEW, onGoToCreateSimilarityView));
    subscriptions.push(TTYGContextService.subscribe(TTYGEventName.GO_TO_CONNECTORS_VIEW, onGoToConnectorsView));
    subscriptions.push(TTYGContextService.subscribe(TTYGEventName.GO_TO_SPARQL_EDITOR, onGoToSparqlEditorView));
    subscriptions.push($rootScope.$on('$translateChangeSuccess', updateLabels));
    $scope.$on('$destroy', cleanUp);

    // =========================
    // Initialization
    // =========================

    function onInit() {
        setCurrentAgent();
        setCurrentChat();
        buildRepositoryList();
        loadAgents().then(() => {
            buildAgentsFilterModel();
            return loadChats();
        });
        initView();
    }
}
