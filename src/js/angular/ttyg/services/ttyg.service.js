import {chatModelMapper, chatsListMapper} from "./chats.mapper";
import 'angular/rest/ttyg.rest.service';
import {askQuestionChatRequestMapper, renameChatRequestMapper} from "./chat-request.mapper";
import {chatMessageModelMapper} from "./chat-message.mapper";
import {agentListMapper} from "./agents.mapper";

const modules = ['graphdb.framework.rest.ttyg.service'];

angular
    .module('graphdb.framework.ttyg.services.ttyg-service', modules)
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
        return TTYGRestService.renameConversation(chat.id, renameChatRequestMapper(chat))
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
     * @param {ChatQuestion} chatQuestion - the question to be asked.
     * @return {Promise<ChatMessageModel>} the answer of the question.
     */
    const askQuestion = (chatQuestion) => {
        return TTYGRestService.askQuestion(askQuestionChatRequestMapper(chatQuestion))
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
     * @param {*} data - the conversation data
     * @return {Promise<string>} created conversation id;
     */
    const createConversation = (data = {}) => {
        return TTYGRestService.createConversation(askQuestionChatRequestMapper(data))
            .then((response) => response.data.conversationId);
    };

    /**
     * Loads all agents from the server and converts the response to a list of AgentModels.
     * @return {Promise<*>}
     */
    const getAgents = () => {
        return TTYGRestService.getAgents()
            .then((response) => agentListMapper(response.data));
    };

    return {
        getConversation,
        renameConversation,
        exportConversation,
        askQuestion,
        getConversations,
        deleteConversation,
        createConversation,
        getAgents
    };
}
