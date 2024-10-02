import {cloneDeep} from "lodash";

angular
    .module('graphdb.framework.ttyg.services.ttygcontext', [])
    .factory('TTYGContextService', TTYGContextService);

TTYGContextService.$inject = ['EventEmitterService'];

function TTYGContextService(EventEmitterService) {

    /**
     * The list of agents.
     * @type {AgentListModel}
     * @private
     */
    let _agents = undefined;

    /**
     * The ChatsListModel.
     * @type {ChatsListModel}
     * @private
     */
    let _chats = undefined;

    /**
     * The currently selected in the UI chat which is used for conversation.
     * @type {ChatModel|undefined}
     * @private
     */
    let _selectedChat = undefined;

    /**
     * The currently selected in the UI agent which is used for conversation.
     * @type {AgentModel|undefined}
     * @private
     */
    let _selectedAgent = undefined;

    /**
     * Stores information about loaded explain responses.
     * The key is the answer ID, and the value is an instance of {@see ExplainResponseModel} that holds the explanation message.
     *
     * @type {{[key: string]: ExplainResponseModel}}
     */
    let _explainCache = {};

    /**
     * @return {AgentListModel}
     */
    const getAgents = () => {
        return cloneDeep(_agents);
    };

    /**
     * @return {ChatsListModel}
     */
    const getChats = () => {
        return cloneDeep(_chats);
    };

    /**
     * @param {ChatsListModel} chats
     */
    const updateChats = (chats) => {
        _chats = cloneDeep(chats);
        emit(TTYGEventName.CHAT_LIST_UPDATED, getChats());
    };

    /** Subscribes to the 'chatListUpdated' event.
     * @param {function} callback - The callback to be called when the event is fired.
     *
     * @return {function} unsubscribe function.
     */
    const onChatsListChanged = (callback) => {
        if (_chats && angular.isFunction(callback)) {
            callback(getChats());
        }
        return subscribe(TTYGEventName.CHAT_LIST_UPDATED, (chats) => callback(chats));
    };

    /**
     * @return {ChatModel}
     */
    const getSelectedChat = () => {
        return cloneDeep(_selectedChat);
    };

    /**
     * Updates the selected chat with the provided <code>selectedChat</code> and emits the 'selectChat' event
     * to notify listeners that a new chat has been selected.
     *
     * @param {ChatModel} selectedChat - The chat object to select.
     */
    const selectChat = (selectedChat) => {
        if (!_selectedChat || _selectedChat.id !== selectedChat.id) {
            _selectedChat = cloneDeep(selectedChat);
            emit(TTYGEventName.SELECT_CHAT, getSelectedChat());
        }
    };

    /**
     * Subscribes to the 'selectChat' event.
     * @param {function} callback - The callback to be called when the event is fired.
     *
     * @return {function} unsubscribe function.
     */
    const onSelectedChatChanged = (callback) => {
        if (_selectedChat && angular.isFunction(callback)) {
            callback(getSelectedChat());
        }
        return subscribe(TTYGEventName.SELECT_CHAT, (selectedChat) => callback(selectedChat));
    };

    /**
     * Updates the selected chat and emits the 'selectChatUpdated' event to notify listeners that a property
     * of the selected chat has changed.
     *
     * If the ID of the passed chat differs from the current selected chat, no action will occur.
     *
     * The selected chat can be updated through {@link TTYGContextService#selectChat}.
     *
     * @param {ChatModel} chat - The chat object that is being updated.
     */
    const updateSelectedChat = (chat) => {
        if (!_selectedChat || !chat || _selectedChat.id === chat.id) {
            _selectedChat = cloneDeep(chat);
            emit(TTYGEventName.SELECTED_CHAT_UPDATED, getSelectedChat());
        }
    };

    /** Subscribes to the 'selectChat' event.
     * @param {function} callback - The callback to be called when the event is fired.
     *
     * @return {function} unsubscribe function.
     */
    const onSelectedChatUpdated = (callback) => {
        if (_selectedChat && angular.isFunction(callback)) {
            callback(getSelectedChat());
        }
        return subscribe(TTYGEventName.SELECTED_CHAT_UPDATED, (selectedChat) => callback(selectedChat));
    };

    /**
     * @param {AgentListModel} agents
     */
    const updateAgents = (agents) => {
        _agents = cloneDeep(agents);
        emit(TTYGEventName.AGENT_LIST_UPDATED, getAgents());
    };

    /**
     * Subscribes to the 'agentListUpdated' event.
     * @param {function} callback - The callback to be called when the event is fired.
     *
     * @return {function} unsubscribe function.
     */
    const onAgentsListChanged = (callback) => {
        if (_agents && angular.isFunction(callback)) {
            callback(getAgents());
        }
        return subscribe(TTYGEventName.AGENT_LIST_UPDATED, (selectedChat) => callback(selectedChat));
    };

    /**
     * @return {AgentModel}
     */
    const getSelectedAgent = () => {
        return cloneDeep(_selectedAgent);
    };

    /**
     * Updates the selected agent with the provided <code>selectedAgent</code> and emits the 'agentSelected' event
     * to notify listeners that a new agent has been selected.
     *
     * @param {AgentModel} selectedAgent - The instance of selected agent.
     */
    const selectAgent = (selectedAgent) => {
        _selectedAgent = cloneDeep(selectedAgent);
        emit(TTYGEventName.AGENT_SELECTED, getSelectedAgent());
    };

    /**
     * @return {{[key: string]: ExplainResponseModel}} the cache of explain responses.
     */
    const getExplainResponseCache = () => {
        return cloneDeep(_explainCache);
    };

    /**
     *  Updates the explain response catch.
     *
     * @param {ExplainResponseModel} explainResponse
     */
    const updateExplainResponseCache = (explainResponse) => {
        _explainCache[explainResponse.answerId] = explainResponse;
        _explainCache = cloneDeep(_explainCache);
        emit(TTYGEventName.EXPLAIN_RESPONSE_CACHE_UPDATED, getExplainResponseCache());
    };

    /** Subscribes to the 'explainResponseCacheUpdated' event.
     * @param {function} callback - The callback to be called when the event is fired.
     *
     * @return {function} unsubscribe function.
     */
    const onExplainResponseCacheUpdated = (callback) => {
        if (angular.isFunction(callback)) {
            callback(getExplainResponseCache());
        }
        return subscribe(TTYGEventName.EXPLAIN_RESPONSE_CACHE_UPDATED, (chats) => callback(chats));
    };

    /**
     * Subscribes to the 'agentSelected' event.
     * @param {function} callback - The callback to be called when the event is fired.
     *
     * @return {function} unsubscribe function.
     */
    const onSelectedAgentChanged = (callback) => {
        if (_selectedAgent && angular.isFunction(callback)) {
            callback(getSelectedAgent());
        }
        return subscribe(TTYGEventName.AGENT_SELECTED, (selectedChat) => callback(selectedChat));
    };

    /**
     * Emits an event with a deep-cloned payload using the EventEmitterService.
     *
     * @param {string} tTYGEventName - The name of the event to emit. It must be a value from {@link TTYGEventName}.
     * @param {*} payload - The data to emit with the event. The payload is deep-cloned before emission.
     */
    const emit = (tTYGEventName, payload) => {
        EventEmitterService.emitSync(tTYGEventName, cloneDeep(payload));
    };

    /**
     * Subscribes to an event with the specified callback using the EventEmitterService.
     *
     * @param {string} tTYGEventName - The name of the event to subscribe to. It must be a value from {@link TTYGEventName}.
     * @param {function} callback - The function to call when the event is emitted.
     * @return {function} - Returns a function that can be called to unsubscribe from the event.
     */
    const subscribe = (tTYGEventName, callback) => {
        return EventEmitterService.subscribeSync(tTYGEventName, (payload) => callback(payload));
    };

    return {
        emit,
        subscribe,
        getChats,
        updateChats,
        onChatsListChanged,
        getSelectedChat,
        selectChat,
        onSelectedChatChanged,
        updateSelectedChat,
        onSelectedChatUpdated,
        updateAgents,
        onAgentsListChanged,
        getAgents,
        selectAgent,
        getSelectedAgent,
        onSelectedAgentChanged,
        getExplainResponseCache,
        updateExplainResponseCache,
        onExplainResponseCacheUpdated
    };
}

export const TTYGEventName = {
    /**
     * Emitting the "newChat" event notifies that a new chat is about to be created.
     */
    NEW_CHAT: 'newChat',

    /**
     * Emitting the "createChat" event triggers a backend request to create a new chat.
     */
    CREATE_CHAT: 'createChat',

    /**
     * This event is emitted when a chat is successfully created.
     */
    CREATE_CHAT_SUCCESSFUL: 'chatCreated',

    /**
     * This event is emitted when the creation of a chat fails.
     */
    CREATE_CHAT_FAILURE: 'chatCreationFailed',

    RENAME_CHAT: 'renameChat',
    RENAME_CHAT_SUCCESSFUL: 'chatRenamed',
    RENAME_CHAT_FAILURE: 'chatRenamedFailure',

    /**
     * Emitting the "selectChat" event when the selected chat has been changed.
     */
    SELECT_CHAT: 'selectChat',

    /**
     * Emitting the "selectChatUpdated" event when the selected chat has been updated.
     */
    SELECTED_CHAT_UPDATED: 'selectChatUpdated',
    DELETE_CHAT: 'deleteChat',
    DELETE_CHAT_SUCCESSFUL: 'chatDeleted',
    DELETE_CHAT_FAILURE: 'chatDeletedFailure',
    CHAT_EXPORT: 'chatExport',
    CHAT_EXPORT_SUCCESSFUL: 'chatExportSuccess',
    CHAT_EXPORT_FAILURE: 'chatExportFailure',
    CHAT_LIST_UPDATED: 'chatListUpdated',

    /**
     * Emitting the "askQuestion" event triggers a request to the backend to retrieve an answer to a question.
     */
    ASK_QUESTION: 'askQuestion',

    /**
     * This event will be emitted when the attempt to answer the question fails.
     */
    ASK_QUESTION_FAILURE: 'askQuestionFailure',

    /**
     * Emitting the "loadChats" event will trigger an action to loads all chats from backend server.
     */
    LOAD_CHATS: 'loadChats',
    LOAD_CHAT_SUCCESSFUL: 'loadChatSuccess',
    LOAD_CHAT_FAILURE: 'loadChatFailure',
    AGENT_LIST_UPDATED: 'agentListUpdated',

    /**
     * This event will be emitted when the create agent process is triggered but before the agent create request is sent.
     */
    CREATE_AGENT: 'createAgent',

    /**
     * This event will be emitted when an agent needs to be edited.
     */
    EDIT_AGENT: 'editAgent',

    /**
     * This event will be emitted when an agent needs to be cloned.
     */
    CLONE_AGENT: 'cloneAgent',

    /**
     * This event will be emitted when the delete agent process is triggered but before the agent delete request is sent.
     */
    DELETE_AGENT: 'deleteAgent',

    /**
     * This event will be emitted when the agent was successfully deleted.
     */
    AGENT_DELETED: 'agentDeleted',

    /**
     * This event will be emitted when the agent delete request is in progress. The payload will contain the agent ID
     * and a boolean indicating if the deletion is in progress.
     */
    DELETING_AGENT: 'deletingAgent',

    /**
     * This event will be emitted when an agent is selected by the user through the UI.
     */
    AGENT_SELECTED: 'agentSelected',

    /**
     * Emitting the "copyTextToClipboard" event will trigger an action to copy a copyTextToClipboard to the clipboard.
     */
    COPY_TEXT_TO_CLIPBOARD: 'copyTextToClipboard',

    /**
     * This event will trigger the opening of the similarity view.
     */
    GO_TO_CREATE_SIMILARITY_VIEW: "goToCreateSimilarityView",

    /**
     * This event will trigger the opening of the connectors view.
     */
    GO_TO_CONNECTORS_VIEW: "goToConnectorsView",

    EXPLAIN_RESPONSE: "explainResponse",
    EXPLAIN_RESPONSE_SUCCESSFUL: "explainResponseSuccess",
    EXPLAIN_RESPONSE_FAILURE: "explainResponseFailure",

    EXPLAIN_RESPONSE_CACHE_UPDATED: "explainResponseCacheUpdated",

    GO_TO_SPARQL_EDITOR: "openQueryInSparqlEditor"
};
