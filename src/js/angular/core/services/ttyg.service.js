import {chatModelMapper, chatsListMapper} from "../../ttyg/services/chats.mapper";
import 'angular/rest/ttyg.rest.service';
import {askQuestionChatRequestMapper, renameChatRequestMapper} from "../../ttyg/services/chat-request.mapper";
import {chatMessageModelMapper} from "../../ttyg/services/chat-message.mapper";

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
     * @param {ChatQuestion} chatQuestion
     * return {Promise<ChatMessageModel>} the answer of the question.
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
     * @return {Promise<string>} created conversation id;
     */
    const createConversation = (data = {}) => {
        return TTYGRestService.createConversation(askQuestionChatRequestMapper(data))
            .then((response) => response.data.conversationId);
    };

    return {
        getConversation,
        renameConversation,
        exportConversation,
        askQuestion,
        getConversations,
        deleteConversation,
        createConversation
    };
}
