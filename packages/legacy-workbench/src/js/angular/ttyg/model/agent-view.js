import {AgentModel} from '../../models/ttyg/agents';

export class AgentViewModel extends AgentModel {
    /**
     * @param agent
     * @type {AgentModel}
     */
    constructor(agent) {
        super(agent);
        this.canEditAgent = false;
        this.canCopyAgent = false;
        this.canDeleteAgent = false;
        this.canOpenExternalIntegrationConfiguration = false;
    }
}
