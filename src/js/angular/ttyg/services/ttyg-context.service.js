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
     * @param {ChatModel} selectedChat
     */
    const selectChat = (selectedChat) => {
        _selectedChat = cloneDeep(selectedChat);
        emit(TTYGEventName.SELECT_CHAT, getSelectedChat());
    };

    /** Subscribes to the 'selectChat' event.
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
     * @param {AgentListModel} agents
     */
    const updateAgents = (agents) => {
        _agents = cloneDeep(agents);
        emit(TTYGEventName.AGENT_LIST_UPDATED, getAgents());
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
        updateAgents
    };
}

export const TTYGEventName = {
    CREATE_CHAT_SUCCESSFUL: 'chatCreated',
    CREATE_CHAT_FAILURE: 'chatCreationFailed',
    RENAME_CHAT: 'renameChat',
    RENAME_CHAT_SUCCESSFUL: 'chatRenamed',
    RENAME_CHAT_FAILURE: 'chatRenamedFailure',
    SELECT_CHAT: 'selectChat',
    DELETE_CHAT: 'deleteChat',
    DELETE_CHAT_SUCCESSFUL: 'chatDeleted',
    DELETE_CHAT_FAILURE: 'chatDeletedFailure',
    CHAT_EXPORT: 'chatExport',
    CHAT_EXPORT_SUCCESSFUL: 'chatExportSuccess',
    CHAT_EXPORT_FAILURE: 'chatExportFailure',
    CHAT_LIST_UPDATED: 'chatListUpdated',
    AGENT_LIST_UPDATED: 'agentListUpdated'
};