import {AgentInstructionsModel, AgentListModel, AgentModel, ExtractionMethodModel} from "../../models/ttyg/agents";
import {md5HashGenerator} from "../../utils/hash-utils";

/**
 * Converts the response from the server to a list of AgentModel.
 * @param {*[]} data
 * @return {AgentListModel}
 */
export const agentListMapper = (data) => {
    if (!data) {
        return new AgentListModel();
    }
    const agentModels = data.map((chat) => agentModelMapper(chat));
    return new AgentListModel(agentModels);
};

export const agentModelMapper = (data) => {
    if (!data) {
        return;
    }
    const hashGenerator = md5HashGenerator();
    return new AgentModel({
        id: data.id,
        name: data.name,
        repositoryId: data.repositoryId,
        model: data.model,
        temperature: data.temperature,
        topP: data.topP,
        seed: data.seed,
        maxNumberOfTriplesPerCall: data.maxNumberOfTriplesPerCall,
        instructions: agentInstructionsMapper(data.instructions),
        extractionMethods: extractionMethodsMapper(data.assistantExtractionMethods)
    }, hashGenerator);
};

const extractionMethodsMapper = (data) => {
    if (!data) {
        return;
    }
    return data.map((extractionMethod) => extractionMethodMapper(extractionMethod));
};

const extractionMethodMapper = (data) => {
    if (!data) {
        return;
    }
    return new ExtractionMethodModel({
        name: data.name
    });
};

const agentInstructionsMapper = (data) => {
    if (!data) {
        return;
    }
    return new AgentInstructionsModel({
        systemInstruction: data.systemInstruction,
        userInstruction: data.userInstruction
    });
};
