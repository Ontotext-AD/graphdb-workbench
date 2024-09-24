angular
    .module('graphdb.framework.ttyg.services.ttygstorage', [])
    .factory('TTYGStorageService', TTYGStorageService);

TTYGStorageService.$inject = ['LocalStorageAdapter', 'LSKeys'];

function TTYGStorageService(localStorageAdapter, LSKeys) {

    const defaultSettings = {
        agent: {
            id: undefined
        },
        chat: {
            id: undefined
        }
    };

    /**
     * Gets the TTYG settings from the local storage or returns the default settings if there are none.
     * @return {{agent: {id: undefined}, chat: {id: undefined}}}
     */
    const getTtygSettings = () => {
        let settings = localStorageAdapter.get(LSKeys.TTYG);
        if (!settings) {
            settings = defaultSettings;
        }
        if (!settings.agent) {
            settings.agent = {};
        }
        if (!settings.chat) {
            settings.chat = {};
        }
        return settings;
    };

    /**
     * Saves the agent in the local storage.
     * @param {AgentModel} agent
     */
    function saveAgent(agent) {
        const settings = getTtygSettings();
        settings.agent.id = agent.id;
        localStorageAdapter.set(LSKeys.TTYG, settings);
    }

    /**
     * Gets the agent id from the local storage.
     * @return {string|undefined}
     */
    function getAgentId() {
        const settings = getTtygSettings();
        if (settings.agent) {
            return settings.agent.id;
        }
    }

    return {
        saveAgent,
        getAgentId
    };
}
