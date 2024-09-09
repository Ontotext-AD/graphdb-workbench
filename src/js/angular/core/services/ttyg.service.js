import {chatModelMapper, chatsListMapper} from "../../ttyg/services/chats.mapper";
import 'angular/rest/ttyg.rest.service';
import {chatMessageModelMapper} from "../../ttyg/services/chat-message.mapper";
import {agentListMapper, agentModelMapper} from "../../ttyg/services/agents.mapper";

const modules = ['graphdb.framework.rest.ttyg.service'];

angular
    .module('graphdb.framework.core.services.ttyg-service', modules)
    .factory('TTYGService', TTYGService);

TTYGService.$inject = ['TTYGRestService'];

function TTYGService(TTYGRestService) {

    const getConversations = (savedQueryName, owner) => {
        return TTYGRestService.getConversations()
            .then((response) => chatsListMapper(response.data));
    };

    /**
     * Loads a conversation by its ID.
     * @param {string} id
     * @return {Promise<ChatModel>}
     */
    const getConversation = (id) => {
        return TTYGRestService.getConversation(id)
            .then((response) => chatModelMapper(response.data));
    };

    /**
     * Renames the conversation (<code>chart</code>).
     * @param {ChatModel} chat - the conversation to be renamed.
     * @return {*}
     */
    const renameConversation = (chat) => {
        return TTYGRestService.renameConversation(chat.id, chat.toRenameRequestPayload())
            .then((response) => chatModelMapper(response.data));
    };

    /**
     * Exports the conversation (<code>chart</code>).
     * @param {string} id - the conversation to be exported.
     * @return {*}
     */
    const exportConversation = (id) => {
        return TTYGRestService.exportConversation(id);
    };

    /**
     * Asks a question.
     * @param {ChatItemModel} chatItem .
     * @return {Promise<ChatMessageModel>} the answer of the question.
     */
    const askQuestion = (chatItem) => {
        return TTYGRestService.askQuestion(chatItem.toAskRequestPayload())
            .then((response) => chatMessageModelMapper(response.data));
    };

    /**
     * Deletes a conversation by its ID.
     * @param {string} id
     * @return {Promise<void>}
     */
    const deleteConversation = (id) => {
        return TTYGRestService.deleteConversation(id);
    };

    /**
     * Creates a new conversation.
     * @param {ChatItemModel} chatItem - the conversation data
     * @return {Promise<string>} created conversation id;
     */
    const createConversation = (chatItem) => {
        return TTYGRestService.createConversation(chatItem.toCreateChatRequestPayload())
            .then((response) => response.data.conversationId);
    };

    /**
     * Loads all agents from the server and converts the response to a list of AgentModels.
     * @return {Promise<AgentListModel>}
     */
    const getAgents = () => {
        return TTYGRestService.getAgents()
            .then((response) => {
                return agentListMapper(response.data);
            });
    };

    /**
     * Creates a new agent.
     * @param {*} payload - the agent data
     * @return {Promise<AgentModel>} created agent;
     */
    const createAgent = (payload) => {
        return TTYGRestService.createAgent(payload)
            .then((response) => {
                return agentModelMapper(response.data);
            });
    };

    return {
        getConversation,
        renameConversation,
        exportConversation,
        askQuestion,
        getConversations,
        deleteConversation,
        createConversation,
        getAgents,
        createAgent
    };
}
