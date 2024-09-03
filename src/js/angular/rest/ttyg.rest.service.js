import {TtygRestServiceFakeBackend} from "./ttyg.rest.service.fake.backend";

angular
    .module('graphdb.framework.rest.ttyg.service', [])
    .factory('TTYGRestService', TTYGRestService);

TTYGRestService.$inject = ['$http'];

const CONVERSATIONS_ENDPOINT = 'rest/chat/conversations';
const DEVELOPMENT = false;

function TTYGRestService($http) {

    const _fakeBackend = new TtygRestServiceFakeBackend();

    const getConversations = () => {
        if (DEVELOPMENT) {
            return _fakeBackend.getConversations();
        }
        return $http.get(CONVERSATIONS_ENDPOINT);
    };

    /**
     * Loads a conversation by its ID.
     * @param {string} id
     * @return {Promise<*>}
     */
    const getConversation = (id) => {
        if (DEVELOPMENT) {
            return _fakeBackend.getConversation(id);
        }
        return $http.get(`${CONVERSATIONS_ENDPOINT}/${id}`);
    };

    /**
     * Calls the REST API to rename the conversation.
     *
     * Bear in mind that the backend doesn't return the whole conversation object, but only the name and the ID.
     *
     * @param {string} id - the conversation ID
     * @param {{name: string}} data - request payload containing the new name
     * @return {Promise<{name: string, id: string}>}
     */
    const renameConversation = (id, data) => {
        if (DEVELOPMENT) {
            return _fakeBackend.renameConversation(id, data);
        }
        return $http.put(`${CONVERSATIONS_ENDPOINT}/${id}`, data);
    };

    /**
     * Exports a conversation by its ID.
     *
     * TODO: this should give the user a file to download, but the backend doesn't support it yet.
     *
     * @param {string} id
     * @return {*}
     */
    const exportConversation = (id) => {
        if (DEVELOPMENT) {
            return _fakeBackend.exportConversation(id);
        }
        return $http.post(`${CONVERSATIONS_ENDPOINT}/export/${id}`);
    };

    /**
     * Calls the REST API to ask a question.
     * @param {*} data
     * @return {*}
     */
    const askQuestion = (data) => {
        if (DEVELOPMENT) {
            return _fakeBackend.askQuestion(data);
        }
        return $http.post(`${CONVERSATIONS_ENDPOINT}`, data);
    };

    /**
     * Deletes a conversation by its ID.
     * @param {string} id
     * @return {Promise<void>}
     */
    const deleteConversation = (id) => {
        if (DEVELOPMENT) {
            return _fakeBackend.deleteConversation(id);
        }
        return $http.delete(`${CONVERSATIONS_ENDPOINT}/${id}`);
    };

    /**
     * Creates a new conversation.
     * @param {*} data - the data to be sent to the backend
     * @return {Promise<*>}
     */
    const createConversation = (data = {}) => {
        if (DEVELOPMENT) {
            return _fakeBackend.createConversation();
        }
        return $http.post(CONVERSATIONS_ENDPOINT, data);
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
