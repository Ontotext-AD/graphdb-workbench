import 'angular/ttyg/directives/chat-list.directive';
import 'angular/ttyg/directives/chat-panel.directive';
import 'angular/ttyg/directives/agent-list.directive';
import 'angular/ttyg/directives/agent-select-menu.directive';
import 'angular/ttyg/directives/no-agents-view.directive';
import 'angular/ttyg/directives/show-tooltip-on-overflow.directive';
import 'angular/ttyg/directives/help-info-popover.directive';
import 'angular/ttyg/controllers/agent-settings-modal.controller';
import 'angular/core/services/ttyg.service';
import 'angular/ttyg/services/ttyg-context.service';
import 'angular/ttyg/services/ttyg-storage.service';
import {TTYGEventName} from '../services/ttyg-context.service';
import {AGENT_OPERATION, AGENTS_FILTER_ALL_KEY, TTYG_ERROR_MSG_LENGTH} from '../services/constants';
import {AgentListFilterModel, AgentModel} from '../../models/ttyg/agents';
import {ChatModel, ChatsListModel} from '../../models/ttyg/chats';
import {agentFormModelMapper} from '../services/agents.mapper';
import {SelectMenuOptionsModel} from '../../models/form-fields';
import {repositoryInfoMapper} from '../../rest/mappers/repositories-mapper';
import {saveAs} from 'lib/FileSaver-patch';
import {AgentSettingsModal} from "../model/agent-settings-modal";
import {decodeHTML} from "../../../../app";
import {status as httpStatus} from "../../models/http-status";
import {ContinueChatRun} from "../../models/ttyg/chat-answer";
import {ChatMessageModel} from "../../models/ttyg/chat-message";
import {service, AuthorizationService} from "@ontotext/workbench-api";

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
    'graphdb.framework.ttyg.directives.show-tooltip-on-overflow',
    'graphdb.framework.ttyg.controllers.agent-settings-modal',
    'graphdb.framework.core.directives.help-info-popover',
];

angular
    .module('graphdb.framework.ttyg.controllers.ttyg-view', modules)
    .controller('TTYGViewCtrl', TTYGViewCtrl);

TTYGViewCtrl.$inject = [
    '$jwtAuth',
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
    $jwtAuth,
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
        filter_all: $translate.instant('ttyg.agent.btn.filter.all'),
    };

    /**
     * A promise that resolves when the active question cancellation completes,
     * or rejects if the cancellation fails.
     */
    let pendingQuestionCancelingPromise;

    /**
     * This is not translated, because the back-end sends it like this.
     * When the page is refreshed, any unnamed chat will be called "New chat",
     * regardless of the user selected language.
     * @type {string}
     */
    const newChatDefaultName = 'New chat';

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
    $scope.showAgents = false;

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
     * Flag controls when component is initialized.
     * @type {boolean}
     */
    $scope.initialized = false;

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
     * A flag that determines whether buttons that modify an agent should be disabled.
     * @type {boolean}
     */
    $scope.canModifyAgent = false;

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

    // =========================
    // Public functions
    // =========================

    // Needed by the slidepanel directive
    $scope.onopen = $scope.onclose = () => angular.noop();

    /**
     * Creates a new chat and selects it.
     */
    $scope.startNewChat = () => {
        if (!TTYGContextService.getChats().containsNewChats()) {
            TTYGContextService.deselectChat();
        }
    };

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

    /**
     * Handles the help message toggle event.
     */
    $scope.onToggleHelp = () => {
        $scope.isHelpVisible = !$scope.isHelpVisible;
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
                const agentFormModel = agentFormModelMapper(new AgentModel({}), agentDefaultValues, AGENT_OPERATION.CREATE);
                return {
                    templateUrl: 'js/angular/ttyg/templates/modal/agent-settings-modal.html',
                    controller: 'AgentSettingsModalController',
                    windowClass: 'agent-settings-modal',
                    backdrop: 'static',
                    resolve: {
                        dialogModel: function() {
                            return new AgentSettingsModal(
                                activeRepositoryInfo,
                                $scope.activeRepositoryList,
                                agentFormModel,
                                AGENT_OPERATION.CREATE,
                            );
                        },
                    },
                    size: 'lg',
                };
            })
            .then((options) => {
                $uibModal.open(options).result.then(reloadAgents);
            })
            .catch((error) => {
                toastr.error(getError(error, 0, TTYG_ERROR_MSG_LENGTH));
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
                const agentFormModel = agentFormModelMapper(agentToEdit, agentDefaultValues, AGENT_OPERATION.EDIT);
                const activeRepositoryInfo = repositoryInfoMapper($repositories.getActiveRepositoryObject());
                return {
                    templateUrl: 'js/angular/ttyg/templates/modal/agent-settings-modal.html',
                    controller: 'AgentSettingsModalController',
                    windowClass: 'agent-settings-modal',
                    backdrop: 'static',
                    resolve: {
                        dialogModel: function() {
                            return new AgentSettingsModal(
                                activeRepositoryInfo,
                                $scope.activeRepositoryList,
                                agentFormModel,
                                AGENT_OPERATION.EDIT,
                            );
                        },
                    },
                    size: 'lg',
                };
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
            })
            .catch((error) => {
                toastr.error(getError(error, 0, TTYG_ERROR_MSG_LENGTH));
            });
    };

    /**
     * Opens the agent settings modal with the agent to clone.
     * @param {AgentModel} agentToClone
     */
    $scope.onOpenCloneAgentSettings = (agentToClone) => {
        getDefaultAgent()
            .then((agentDefaultValues) => {
                const agentFormModel = agentFormModelMapper(agentToClone, agentDefaultValues, AGENT_OPERATION.CLONE);
                agentFormModel.name = `clone-${agentFormModel.name}`;
                const activeRepositoryInfo = repositoryInfoMapper($repositories.getActiveRepositoryObject());
                return {
                    templateUrl: 'js/angular/ttyg/templates/modal/agent-settings-modal.html',
                    controller: 'AgentSettingsModalController',
                    windowClass: 'agent-settings-modal',
                    backdrop: 'static',
                    resolve: {
                        dialogModel: function() {
                            return new AgentSettingsModal(
                                activeRepositoryInfo,
                                $scope.activeRepositoryList,
                                agentFormModel,
                                AGENT_OPERATION.CLONE,
                            );
                        },
                    },
                    size: 'lg',
                };
            }).then((options) => {
            $uibModal.open(options).result.then(
                (updatedAgent) => {
                    const hasSelectedAgent = TTYGContextService.getSelectedAgent();
                    if (hasSelectedAgent && updatedAgent.id === hasSelectedAgent.id) {
                        TTYGContextService.selectAgent(updatedAgent);
                    }
                    reloadAgents();
                });
        }).catch((error) => {
            toastr.error(getError(error, 0, TTYG_ERROR_MSG_LENGTH));
        });
    };

    // =========================
    // Private functions
    // =========================

    const loadChats = () => {
        $scope.loadingChats = true;
        return TTYGService.getConversations()
            .then((chats) => {
                return TTYGContextService.updateChats(chats);
            })
            .catch((error) => {
                toastr.error(getError(error, 0, TTYG_ERROR_MSG_LENGTH));
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
                toastr.error(getError(error, 0, TTYG_ERROR_MSG_LENGTH));
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
                toastr.error(getError(error, 0, TTYG_ERROR_MSG_LENGTH));
            })
            .finally(() => {
                $scope.reloadingAgents = false;
            });
    };

    const updateCanModifyAgent = () => {
        TTYGContextService.setCanModifyAgent($jwtAuth.isRepoManager());
    };

    const getActiveRepositoryObjectHandler = (activeRepo) => {
        const authorizationService = service(AuthorizationService);
        if (activeRepo && !authorizationService.hasGqlRights(activeRepo)) {
            onInit();
        }
    };

    /**
     * @param {ChatItemModel} chatItem
     */
    const onCreateNewChat = (chatItem) => {
        TTYGService.createChat(chatItem).then((conversationId) => {
            const newChat = ChatModel.getNewChat();
            newChat.name = newChatDefaultName;
            newChat.id = conversationId;
            TTYGContextService.createChat(newChat);
            TTYGStorageService.saveChat(newChat);

            chatItem.chatId = conversationId;
            TTYGContextService.emit(TTYGEventName.ASK_QUESTION, chatItem);
        }).catch((error) => {
                TTYGContextService.emit(TTYGEventName.CREATE_CHAT_FAILURE);
                toastr.error(getError(error, 0, TTYG_ERROR_MSG_LENGTH));
            });
    };

    /**
     * @param {ChatItemModel} chatItem
     */
    const onAskQuestion = (chatItem) => {
        TTYGContextService.emit(TTYGEventName.ASK_QUESTION_STARTING);
        // Reset the pending question cancellation promise to avoid interfering with the next question.
        // Currently, we can only ask a question for the selected chat, so it's safe to reset the promise here.
        pendingQuestionCancelingPromise = undefined;
        TTYGService.askQuestion(chatItem)
            .then((chatAnswer) => {
                const selectedChat = TTYGContextService.getSelectedChat();
                // If still the same chat selected
                if (selectedChat && selectedChat.id === chatItem.chatId) {
                    if (selectedChat.isNew()) {
                        selectedChat.new = false;
                        const chats = TTYGContextService.getChats();
                        chats.setChatAsOld(selectedChat.id);
                        TTYGContextService.updateChats(chats);
                    }
                    // just process the messages
                    updateChatAnswersFirstResponse(selectedChat, chatItem, chatAnswer);
                }
            })
            .catch((error) => {
                TTYGContextService.emit(TTYGEventName.ASK_QUESTION_FAILURE);
                toastr.error(getError(error, 0, TTYG_ERROR_MSG_LENGTH));
            });
    };

    const onContinueChatRun = (continueData) => {
        TTYGService.continueChatRun(continueData)
            .then((chatAnswer) => {
                const chatId = continueData.chatId;
                const selectedChat = TTYGContextService.getSelectedChat();
                // If still the same chat selected
                if (selectedChat && selectedChat.id === chatId) {
                    // just process the additional answers (with a recovered ChatItemModel)
                    const items = selectedChat.chatHistory.items;
                    const lastItem = items[items.length - 1];
                    updateChatAnswers(selectedChat, lastItem, chatAnswer);
                }
            })
            .catch((error) => {
                // TODO failure event
                TTYGContextService.emit(TTYGEventName.ASK_QUESTION_FAILURE);
                toastr.error(getError(error, 0, TTYG_ERROR_MSG_LENGTH));
            });
    };

    const updateChatAnswers = (selectedChat, chatItem, chatAnswer) => {
        selectedChat.timestamp = chatAnswer.timestamp;
        chatItem.answers = chatItem.answers || [];
        chatItem.answers.push(...chatAnswer.messages);
        TTYGContextService.updateSelectedChat(selectedChat);

        if (chatAnswer.continueRunId) {
            TTYGContextService.emit(TTYGEventName.CONTINUE_CHAT_RUN,
                new ContinueChatRun(chatItem, chatAnswer.continueRunId));
        } else {
            // Last message - update the timestamp and the name of the chat in the chat list
            const chats = TTYGContextService.getChats();
            // Updating the timestamp in the list gets the chat moved to the top.
            chats.updateChatTimestamp(selectedChat.id, chatAnswer.timestamp);
            // Strictly speaking the chat name update is needed only for new chats,
            // but it doesn't hurt for every chat.
            chats.updateChatName(selectedChat.id, chatAnswer.chatName);
            // and also in the chat - doesn't seem to matter atm
            selectedChat.name = chatAnswer.name;
            TTYGContextService.updateChats(chats);
            TTYGContextService.emit(TTYGEventName.LAST_MESSAGE_RECEIVED, selectedChat);
        }
    };

    const updateChatAnswersFirstResponse = (selectedChat, chatItem, chatAnswer) => {
        if (pendingQuestionCancelingPromise) {
            // If the answer is canceled, we need to wait for the cancellation to complete
            // and prepare a proper answer message that describes the reason for the cancellation.
            pendingQuestionCancelingPromise.then((cancelingResponse) => {
                const currentSelectedChat = TTYGContextService.getSelectedChat();
                // If selected chat is changed while waiting for the canceling response,
                // Skip the response processing.
                if (currentSelectedChat && currentSelectedChat.id !== chatItem.chatId) {
                    return;
                }
                const message = new ChatMessageModel({
                    message: cancelingResponse.data.message,
                    status: cancelingResponse.data.runStatus,
                    isTerminalState: true,
                    tokenUsageInfo: chatAnswer.tokenUsageInfo,
                });

                message.addToChatAnswer(chatAnswer);
                selectedChat.chatHistory.appendItem(chatItem);
                updateChatAnswers(selectedChat, chatItem, chatAnswer);
            });
        } else {
            // If the answer is not canceled, we can process it immediately.
            selectedChat.chatHistory.appendItem(chatItem);
            updateChatAnswers(selectedChat, chatItem, chatAnswer);
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

    const onCanUpdateAgentUpdated = (canModifyAgent) => {
        $scope.canModifyAgent = canModifyAgent;
    };

    /**
     * @param {ChatsListModel} chats - the new chats list.
     */
    const setupChatListPanel = (chats) => {
        if (chats.isEmpty()) {
            $scope.showChats = false;
        } else {
            $scope.showChats = true;
            if (!TTYGContextService.getSelectedChat() && !TTYGStorageService.getChatId()) {
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
                const chats = TTYGContextService.getChats();
                chats.deleteChat(chat);
                TTYGContextService.updateChats(chats);
            })
            .catch(() => {
                TTYGContextService.emit(TTYGEventName.DELETE_CHAT_FAILURE);
                toastr.error($translate.instant('ttyg.chat.messages.delete_failure'));
            })
            .finally(() => TTYGContextService.emit(TTYGEventName.DELETING_CHAT, {chatId: chat.id, inProgress: false}));
    };

    const onCancelPendingQuestion = (chatItem) => {
        const selectedChatId = chatItem.chatId || TTYGContextService.getSelectedChat().id;
        pendingQuestionCancelingPromise = TTYGService.cancelPendingQuestion(selectedChatId)
            .then((answer) => {
                TTYGContextService.emit(TTYGEventName.PENDING_QUESTION_CANCELED_SUCCESSFUL);
                return answer;
            })
            .catch((error) => {
            TTYGContextService.emit(TTYGEventName.CANCEL_PENDING_QUESTION_FAILURE);
            return error;
        });
    };

    /**
     * Handles the export of a chat by calling the service and updating the chats list.
     * @param {ChatModel} chat - the chat to be exported.
     */
    const onExportChat = (chat) => {
        TTYGService.exportConversation(chat.id)
            .then(function({data, filename}) {
                saveAs(data, filename);
                TTYGContextService.emit(TTYGEventName.CHAT_EXPORT_SUCCESSFUL, chat);
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
                toastr.error(getError(error, 0, TTYG_ERROR_MSG_LENGTH));
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
        const repositoryObjects = $repositories.getLocalReadableGraphdbRepositories()
            .map((repo) => (
                new AgentListFilterModel(repo.id, repo.id, repo.id === currentRepository)
            ));
        $scope.agentListFilterModel = [
            new AgentListFilterModel(AGENTS_FILTER_ALL_KEY, labels.filter_all),
            ...repositoryObjects,
        ];
    };

    const onSelectedChatChanged = (selectedChat) => {
        // Reset the pending question cancellation promise because the chat has changed,
        // and any previous promise is no longer relevant.
        pendingQuestionCancelingPromise = undefined;
        // If the selected chat is a chat and does not need to be loaded from the server.
        if (selectedChat && !selectedChat.isNew()) {
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
        } else if (selectedChat) {
            TTYGContextService.updateSelectedChat(selectedChat);
        }
    };

    const notifyForMissingChat = (selectedChat) => {
        ModalService.openModalAlert({
            title: $translate.instant('ttyg.chat.dialog.chat_is_missing.title'),
            message: $translate.instant('ttyg.chat.dialog.chat_is_missing.body'),
        }).result
            .then(function() {
                TTYGContextService.deleteChat(selectedChat);
            });
    };

    /**
     * Handles the selection of an agent.
     * @param {AgentModel} agent
     */
    const onAgentSelected = (agent) => {
        $scope.selectedAgent = agent;
    };

    /**
     * Opens the create similarity view. It checks if the passed repository ID matches the one selected by the workbench.
     * If they do not match, a confirmation dialog is shown to inform the user that the selected repository
     * will be automatically changed upon confirmation.
     *
     * @param {{repositoryId: string}} payload - The payload containing the repository ID.
     */
    const onGoToCreateSimilarityView = (payload) => {
        goToView(payload.repositoryId, 'ttyg.agent.create_agent_modal.dialog.confirm_repository_change_before_open_similarity.body', 'similarity/index/create');
    };

    /**
     * Opens the "Autocomplete index" view. It checks if the passed repository ID matches the one selected by the workbench.
     * If they do not match, a confirmation dialog is shown to inform the user that the selected repository
     * will be automatically changed upon confirmation.
     *
     * @param {{repositoryId: string}} payload - The payload containing the repository ID.
     */
    const goToAutocompleteIndexView = (payload) => {
        goToView(payload.repositoryId, 'ttyg.agent.create_agent_modal.dialog.confirm_repository_change_before_open_autocomplete_index.body', 'autocomplete');
    };

    /**
     * Opens the connectors view. It checks if the passed repository ID matches the one selected by the workbench.
     * If they do not match, a confirmation dialog is shown to inform the user that the selected repository
     * will be automatically changed upon confirmation.
     *
     * @param {{repositoryId: string}} payload - The payload containing the repository ID.
     */
    const onGoToConnectorsView = (payload) => {
        goToView(payload.repositoryId, 'ttyg.agent.create_agent_modal.dialog.confirm_repository_change_before_open_connectors.body', 'connectors');
    };

    /**
     * Navigates to a specified view URL, potentially after switching the active repository.
     * If the target repository is different from the currently active one, a confirmation modal is shown.
     * Upon user confirmation, the repository is switched and the view is opened in a new browser tab.
     *
     * @param {string} repositoryId - The ID of the target repository to switch to.
     * @param {string} confirmMessageLabelKey - The translation key for the confirmation message to be shown in the modal.
     * @param {string} viewURL - The URL of the view to be opened in a new browser tab.
     */
    const goToView = (repositoryId, confirmMessageLabelKey, viewURL) => {
        if (repositoryId !== $repositories.getActiveRepository()) {
            const repository = $repositories.getRepository(repositoryId);
            if (repository) {
                ModalService.openConfirmationModal({
                        title: $translate.instant('common.confirm'),
                        message: decodeHTML($translate.instant(confirmMessageLabelKey, {repositoryId: repository.id})),
                        confirmButtonKey: 'ttyg.chat_panel.btn.proceed.label',
                    },
                    () => {
                        $repositories.setRepository(repository);
                        openView(viewURL);
                    });
            }
        } else {
            openView(viewURL);
        }
    };

    /**
     * Opens the specified URL in a new browser tab.
     *
     * @param {string} viewURL - The URL to open.
     */
    const openView = (viewURL) => {
        $window.open(viewURL, '_blank');
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
        const chats = TTYGContextService.getChats();
        // If the chat ID is not stored in the local storage, there is no need to load it.
        // Also, if a chat id is found in the storage but is not present in the chat list, then it probably was deleted,
        // and it will be replaced with a new one on next selection.
        if (!chatId || !chats?.getChat(chatId)) {
            return;
        }
        TTYGContextService.selectChat(TTYGContextService.getChats().getChat(chatId));
    };

    const updateLabels = () => {
        labels.filter_all = $translate.instant('ttyg.agent.btn.filter.all');
        // recreate the repository list to trigger the update in the view
        buildAgentsFilterModel();
    };

    const buildRepositoryList = () => {
        $scope.activeRepositoryList = $repositories.getLocalReadableGraphdbRepositories()
            .map((repo) => (
                new SelectMenuOptionsModel({
                    value: repo.id,
                    label: repo.id,
                    data: {
                        repository: repo,
                    },
                })),
            );
    };


    // =========================
    // Subscriptions
    // =========================

    function cleanUp() {
        subscriptions.forEach((subscription) => subscription());
        TTYGContextService.resetContext();
    }

    subscriptions.push(
        $scope.$watch($scope.getActiveRepositoryObject, getActiveRepositoryObjectHandler),
        TTYGContextService.onSelectedChatChanged(onSelectedChatChanged),
        TTYGContextService.onChatsListChanged(onChatsChanged),
        TTYGContextService.onCanUpdateAgentUpdated(onCanUpdateAgentUpdated),
        TTYGContextService.subscribe(TTYGContextService.onAgentsListChanged(onAgentListChanged)),
        TTYGContextService.subscribe(TTYGEventName.CREATE_CHAT, onCreateNewChat),
        TTYGContextService.subscribe(TTYGEventName.RENAME_CHAT, onRenameChat),
        TTYGContextService.subscribe(TTYGEventName.DELETE_CHAT, onDeleteChat),
        TTYGContextService.subscribe(TTYGEventName.CANCEL_PENDING_QUESTION, onCancelPendingQuestion),
        TTYGContextService.subscribe(TTYGEventName.CHAT_EXPORT, onExportChat),
        TTYGContextService.subscribe(TTYGEventName.ASK_QUESTION, onAskQuestion),
        TTYGContextService.subscribe(TTYGEventName.CONTINUE_CHAT_RUN, onContinueChatRun),
        TTYGContextService.subscribe(TTYGEventName.LOAD_CHATS, loadChats),
        TTYGContextService.subscribe(TTYGEventName.OPEN_AGENT_SETTINGS, $scope.onOpenNewAgentSettings),
        TTYGContextService.subscribe(TTYGEventName.EDIT_AGENT, $scope.onOpenAgentSettings),
        TTYGContextService.subscribe(TTYGEventName.CLONE_AGENT, $scope.onOpenCloneAgentSettings),
        TTYGContextService.subscribe(TTYGEventName.DELETE_AGENT, onDeleteAgent),
        TTYGContextService.subscribe(TTYGEventName.AGENT_SELECTED, onAgentSelected),
        TTYGContextService.subscribe(TTYGEventName.GO_TO_CREATE_SIMILARITY_VIEW, onGoToCreateSimilarityView),
        TTYGContextService.subscribe(TTYGEventName.GO_TO_AUTOCOMPLETE_INDEX_VIEW, goToAutocompleteIndexView),
        TTYGContextService.subscribe(TTYGEventName.GO_TO_CONNECTORS_VIEW, onGoToConnectorsView),
        TTYGContextService.subscribe(TTYGEventName.GO_TO_SPARQL_EDITOR, onGoToSparqlEditorView),
        $rootScope.$on('$translateChangeSuccess', updateLabels),
        $rootScope.$on('securityInit', updateCanModifyAgent),
    );
    $scope.$on('$destroy', cleanUp);

    // =========================
    // Initialization
    // =========================

    function onInit() {
        buildRepositoryList();
        loadAgents()
            .then(() => {
                $scope.initialized = true;
                buildAgentsFilterModel();
                return loadChats();
            })
            .then(setCurrentChat);
        updateCanModifyAgent();
    }
}
