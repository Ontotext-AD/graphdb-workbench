import {TtygRestServiceFakeBackend} from './ttyg.rest.service.fake.backend';

angular
    .module('graphdb.framework.rest.ttyg.service', [])
    .factory('TTYGRestService', TTYGRestService);

TTYGRestService.$inject = ['$http'];

const CONVERSATIONS_ENDPOINT = 'rest/chat/conversations';
const AGENTS_ENDPOINT = 'rest/chat/agents';
const EXPLAIN_RESPONSE_ENDPOINT = `${CONVERSATIONS_ENDPOINT}/explain`;

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
     * @param {string} id
     * @return {Promise<{Blob}>} Returns the conversation as a Blob
     */
    const exportConversation = (id) => {
        if (DEVELOPMENT) {
            return _fakeBackend.exportConversation(id);
        }
        return $http.get(`${CONVERSATIONS_ENDPOINT}/export/${id}`, {responseType: 'blob'});
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
     * Calls the REST API to continue a chat run.
     * @param {*} data
     * @return {*}
     */
    const continueChatRun = (data) => {
        if (DEVELOPMENT) {
            return _fakeBackend.continueChatRun(data);
        }
        return $http.post(`${CONVERSATIONS_ENDPOINT}/continue`, data);
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
            return _fakeBackend.createConversation(data);
        }
        return $http.post(CONVERSATIONS_ENDPOINT, data);
    };

    /**
     * Fetches agents from the backend.
     * @return {Promise<*>|*}
     */
    const getAgents = () => {
        if (DEVELOPMENT) {
            // return _fakeBackend.simulateHttpError();
            return _fakeBackend.getAgents();
            // return new Promise((resolve) => {
            //     setTimeout(() => resolve(_fakeBackend.getAgents()), 3000);
            // });
        }
        return $http.get(AGENTS_ENDPOINT);
    };

    /**
     * Fetches an agent by its ID from the backend.
     * @param {string} id
     * @return {Promise<Awaited<{data: T}>>|*}
     */
    const getAgent = (id) => {
        if (DEVELOPMENT) {
            return _fakeBackend.getAgent(id);
        }
        return $http.get(`${AGENTS_ENDPOINT}/${id}`);
    };

    /**
     * Creates a new agent in the backend.
     * @param {*} agent
     * @return {Promise<AgentModel>}
     */
    const createAgent = (agent) => {
        if (DEVELOPMENT) {
            return _fakeBackend.createAgent(agent);
        }
        return $http.post(AGENTS_ENDPOINT, agent);
    };

    /**
     * Updates the specified <code>agent</code>.
     * @param {AgentModel} agent - The agent to be updated.
     * @return {Promise<AgentModel>} A promise that resolves the updated agent.
     */
    const editAgent = (agent) => {
        if (DEVELOPMENT) {
            return _fakeBackend.editAgent(agent);
        }
        return $http.put(`${AGENTS_ENDPOINT}`, agent);
    };

    /**
     * Deletes an agent by its ID from the backend.
     * @param {string} id
     * @return {Promise<void>}
     */
    const deleteAgent = (id) => {
        if (DEVELOPMENT) {
            return _fakeBackend.deleteAgent(id);
        }
        return $http.delete(`${AGENTS_ENDPOINT}/${id}`);
    };

    /**
     * Calls backend server to fetch an explanation of how the answer was generated.
     * @param {*} data
     * @return {Promise}
     */
    const explainResponse = (data = {}) => {
        if (DEVELOPMENT) {
            return _fakeBackend.explainResponse(data);
        }
        return $http.post(EXPLAIN_RESPONSE_ENDPOINT, data);
    };

    /**
     * Calls the backend server to fetch the default values for an agent.
     * @return {Promise}
     */
    const getAgentDefaultValues = () => {
        if (DEVELOPMENT) {
            return _fakeBackend.getAgentDefaultValues();
        }
        return $http.get(`${AGENTS_ENDPOINT}/default`);
    };

    /**
     * Calls the backend server to fetch an explanation of how the agent settings were generated.
     * @param {*} data
     * @return {Promise}
     */
    const explainAgentSettings = (data) => {
        if (DEVELOPMENT) {
            return _fakeBackend.explainAgentSettings();
        }
        return $http.post(`${AGENTS_ENDPOINT}/explain`, data);
    };

    return {
        getConversation,
        renameConversation,
        exportConversation,
        askQuestion,
        continueChatRun,
        getConversations,
        deleteConversation,
        createConversation,
        getAgents,
        getAgent,
        createAgent,
        editAgent,
        deleteAgent,
        explainResponse,
        getAgentDefaultValues,
        explainAgentSettings
    };
}
