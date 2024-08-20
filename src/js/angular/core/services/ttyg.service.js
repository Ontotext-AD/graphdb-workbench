import {chatModelMapper, chatsListMapper} from "../../ttyg/services/chats.mapper";
import 'angular/rest/ttyg.rest.service';
import {askQuestionChatRequestMapper, renameChatRequestMapper} from "../../ttyg/services/edit-chat-request.mapper";

const modules = ['graphdb.framework.rest.ttyg.service'];

angular
    .module('graphdb.framework.core.services.ttyg-service', modules)
    .factory('TTYGService', TTYGService);

TTYGService.$inject = ['TTYGRestService'];

function TTYGService(TTYGRestService) {

    const getConversations = (savedQueryName, owner) => {
        return TTYGRestService.getConversations()
            .then((data) => chatsListMapper(data));
    };

    /**
     * Loads a conversation by its ID.
     * @param {string} id
     * @return {Promise<ChatModel>}
     */
    const getConversation = (id) => {
        return TTYGRestService.getConversation(id)
            .then((data) => chatModelMapper(data));
    };

    /**
     * Renames the conversation (<code>chart</code>).
     * @param {ChatModel} chat - the conversation to be edited.
     * @return {*}
     */
    const renameConversation = (chat) => {
        return TTYGRestService.renameConversation(chat.id, renameChatRequestMapper(chat))
            .then((data) => chatModelMapper(data));
    };

    /**
     * Asks a question.
     * @param {ChatMessageModel} messageChat
     * return {ChatMessageModel} the answer of the question.
     */
    const askQuestion = (messageChat) => {
        return TTYGRestService.askQuestion(messageChat.conversationId, askQuestionChatRequestMapper(messageChat))
            .then((data) => chatModelMapper(data));
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
     * @return {Promise<ChatModel>}
     */
    const createConversation = () => {
        return TTYGRestService.createConversation()
            .then((data) => chatModelMapper(data));
    };

    return {
        getConversation,
        renameConversation,
        askQuestion,
        getConversations,
        deleteConversation,
        createConversation
    };
}
