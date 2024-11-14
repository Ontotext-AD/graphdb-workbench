import {AgentInstructionsExplain, AgentInstructionsExplainList} from "../../models/ttyg/agent-instructions-explain";

/**
 * Maps the response from the backend to the AgentInstructionsExplainList model.
 * @param {*} data
 * @return {AgentInstructionsExplainList}
 */
export const agentInstructionsExplainMapper = (data) => {
    if (!data) {
        return new AgentInstructionsExplainList([]);
    }
    return data.map((instruction) => new AgentInstructionsExplain(instruction));
};
