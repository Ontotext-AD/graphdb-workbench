import {TtygRestServiceFakeBackend} from "./ttyg.rest.service.fake.backend";

angular
    .module('graphdb.framework.rest.ttyg.service', [])
    .factory('TTYGRestService', TTYGRestService);

TTYGRestService.$inject = ['$http'];

const CONVERSATIONS_ENDPOINT = 'rest/chat/conversations';
const DEVELOPMENT = true;

function TTYGRestService($http) {

    const _fakeBackend = new TtygRestServiceFakeBackend();

    const getConversations = (savedQueryName, owner) => {
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

    const renameConversation = (id, data) => {
        if (DEVELOPMENT) {
            return _fakeBackend.renameConversation(id, data);
        }
        return $http.post(`${CONVERSATIONS_ENDPOINT}/${id}`);
    };

    const askQuestion = (id, data) => {
        if (DEVELOPMENT) {
            return _fakeBackend.askQuestion(id, data);
        }
        return $http.post(`${CONVERSATIONS_ENDPOINT}/${id}`, data);
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
     * @return {Promise<*>}
     */
    const createConversation = () => {
        if (DEVELOPMENT) {
            return _fakeBackend.createConversation();
        }
        return $http.post(CONVERSATIONS_ENDPOINT);
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
