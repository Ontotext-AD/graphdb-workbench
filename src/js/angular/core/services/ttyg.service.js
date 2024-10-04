import {chatModelMapper, chatsListMapper} from "../../ttyg/services/chats.mapper";
import 'angular/rest/ttyg.rest.service';
import {chatMessageModelMapper} from "../../ttyg/services/chat-message.mapper";
import {agentListMapper, agentModelMapper} from "../../ttyg/services/agents.mapper";
import {explainResponseMapper} from "../../ttyg/services/explain.mapper";

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
     * @return {Promise<{Blob, string}>} Returns the conversation as a Blob and the filename wrapped in a Promise
     * */
    const exportConversation = (id) => {
        return TTYGRestService.exportConversation(id)
            .then(function (res) {
                const data = res.data;
                const headers = res.headers();
                const contentDispositionHeader = headers['content-disposition'];
                let filename = 'chat-export';
                if (contentDispositionHeader) {
                    filename = contentDispositionHeader.split('filename=')[1];
                    filename = filename.substring(0, filename.length);
                }
                return {data, filename};
            });
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
     * Creates a new conversation. The creation of a chat and asking a question share the same endpoint. If the request payload
     * doesn't contain the chat ID, the backend will create a new chat and return the answer, which includes the ID of the created chat.
     *
     * @param {ChatItemModel} chatItem - The conversation data.
     * @return {Promise<string>} The ID of the created conversation.
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
     * Loads an agent by its ID.
     * @param {string} id
     * @return {Promise<AgentModel|undefined>}
     */
    const getAgent = (id) => {
        return TTYGRestService.getAgent(id)
            .then((response) => agentModelMapper(response.data));
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

    /**
     * Updates the agent with the provided <code>payload</code>.
     * @param {*} payload - The data for updating the agent.
     * @return {Promise<AgentModel>} A promise that resolves to the updated agent.
     */
    const editAgent = (payload) => {
        return TTYGRestService.editAgent(payload)
            .then((response) => {
                return agentModelMapper(response.data);
            });
    };

    /**
     * Deletes an agent by its ID.
     * @param {string} id
     * @return {Promise<void>|*}
     */
    const deleteAgent = (id) => {
        return TTYGRestService.deleteAgent(id);
    };

    /**
     * Returns an explanation of how the answer was generated.
     * @param {ChatItemModel} chatItem
     * @return {ExplainResponseModel}
     */
    const explainResponse = (chatItem) => {
        return TTYGRestService.explainResponse(chatItem.toExplainResponsePayload())
            .then((response) => {
                return explainResponseMapper(response.data);
            });
    };

    /**
     * Get the default agent values from server.
     * @return {Promise<AgentModel>}
     */
    const getDefaultAgent = () => {
        return TTYGRestService.getAgentDefaultValues()
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
        getAgent,
        createAgent,
        editAgent,
        deleteAgent,
        explainResponse,
        getDefaultAgent
    };
}
