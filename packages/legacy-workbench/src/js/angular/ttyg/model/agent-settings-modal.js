/**
 * A model for the agent settings modal configuration.
 */
export class AgentSettingsModal {
    /**
     * Constructor.
     * @param {RepositoryInfoModel} activeRepositoryInfo
     * @param {string[]} activeRepositoryList
     * @param {AgentFormModel} agentFormModel
     * @param {'create'|'edit'|'clone'} operation
     */
    constructor(
        activeRepositoryInfo,
        activeRepositoryList,
        agentFormModel,
        operation
    ) {
        this.activeRepositoryInfo = activeRepositoryInfo;
        this.activeRepositoryList = activeRepositoryList;
        this.agentFormModel = agentFormModel;
        this.operation = operation;
    }
}
