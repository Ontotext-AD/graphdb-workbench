import {AdditionalExtractionMethodModel, AgentInstructionsModel, AgentListModel, AgentModel, ExtractionMethodModel} from '../../models/ttyg/agents';
import {AgentFormModel, AgentInstructionsFormModel, ExtractionMethodFormModel} from '../../models/ttyg/agent-form';
import {NumericRangeModel, TextFieldModel} from '../../models/form-fields';
import {md5HashGenerator} from '../../utils/hash-utils';

/**
 * Converts an agent model to an agent form model.
 * @param {AgentModel} agentModel
 * @param {AgentModel} defaultAgentModel
 * @param {boolean} isNew
 * @return {AgentFormModel}
 */
export const agentFormModelMapper = (agentModel, defaultAgentModel, isNew = false) => {
    if (!agentModel) {
        return;
    }
    const agentFormModel = new AgentFormModel();
    agentFormModel.id = agentModel.id || defaultAgentModel.id;
    agentFormModel.name = agentModel.name || defaultAgentModel.name;
    agentFormModel.repositoryId = agentModel.repositoryId || defaultAgentModel.repositoryId;
    agentFormModel.model = agentModel.model || defaultAgentModel.model;
    agentFormModel.temperature.value = agentModel.temperature !== undefined ? agentModel.temperature : defaultAgentModel.temperature;
    agentFormModel.topP.value = agentModel.topP !== undefined ? agentModel.topP : defaultAgentModel.topP;
    agentFormModel.seed = agentModel.seed || defaultAgentModel.seed;
    agentFormModel.instructions = agentInstructionsFormMapper(agentModel.instructions || defaultAgentModel.instructions);
    extractionMethodsFormMapper(agentFormModel, isNew, defaultAgentModel.assistantExtractionMethods, agentModel.assistantExtractionMethods);
    // Select additional methods if they are present in the list returned from the backend (BE).
    agentFormModel.additionalExtractionMethods.additionalExtractionMethods.forEach((method) => {
        method.selected = agentModel.additionalExtractionMethods && agentModel.additionalExtractionMethods.some((agentMethod) => agentMethod.method === method.method);
    });
    return agentFormModel;
};

/**
 * @param {AgentInstructionsModel} data
 * @return {AgentInstructionsFormModel}
 */
const agentInstructionsFormMapper = (data) => {
    if (!data) {
        return;
    }
    return new AgentInstructionsFormModel({
        systemInstruction: data.systemInstruction,
        userInstruction: data.userInstruction
    });
};

/**
 * @param {AgentFormModel} agentFormModel
 * @param {boolean} isNew
 * @param {ExtractionMethodModel[]} defaultData
 * @param {ExtractionMethodModel[]} data
 */
const extractionMethodsFormMapper = (agentFormModel, isNew, defaultData, data = []) => {
    const defaultExtractionMethods = defaultData.filter((defaultExtractionMethod) => !data.some((agentMethod) => agentMethod.method === defaultExtractionMethod.method));
    const extractionMethods = [...data, ...defaultExtractionMethods];
    extractionMethods.forEach((extractionMethod) => {
        let sparqlOption = '';
        if (isNew) {
            sparqlOption = '';
        } else if (extractionMethod.sparqlQuery) {
            sparqlOption = 'sparqlQuery';
        } else if (extractionMethod.ontologyGraph) {
            sparqlOption = 'ontologyGraph';
        }
        const existingMethod = new ExtractionMethodFormModel({
            selected: !isNew && data.some((method) => method.method === extractionMethod.method),
            method: extractionMethod.method,
            sparqlOption: sparqlOption,
            ontologyGraph: extractionMethod.ontologyGraph,
            addMissingNamespaces: extractionMethod.addMissingNamespaces,
            sparqlQuery: extractionMethod.sparqlQuery && new TextFieldModel({
                value: extractionMethod.sparqlQuery,
                minLength: 1,
                maxLength: 2380
            }),
            similarityIndex: extractionMethod.similarityIndex,
            similarityIndexThreshold: extractionMethod.similarityIndexThreshold && new NumericRangeModel({
                value: extractionMethod.similarityIndexThreshold,
                minValue: 0,
                maxValue: 1,
                step: 0.1
            }),
            // In case backend returns 0 as a default value this means that there is no limit, so we set the null in order
            // to show the placeholder in the input field.
            maxNumberOfTriplesPerCall: extractionMethod.maxNumberOfTriplesPerCall === 0 ? null : extractionMethod.maxNumberOfTriplesPerCall,
            queryTemplate: extractionMethod.queryTemplate && new TextFieldModel({
                value: extractionMethod.queryTemplate,
                minLength: 1,
                maxLength: 2380
            }),
            retrievalConnectorInstance: extractionMethod.retrievalConnectorInstance
        });
        agentFormModel.assistantExtractionMethods.setExtractionMethod(existingMethod);
    });
};

/**
 * Converts the response from the server to a list of AgentModel.
 * @param {*[]} data
 * @param {string[]} localRepositoryIds
 * @return {AgentListModel}
 */
export const agentListMapper = (data, localRepositoryIds) => {
    if (!data) {
        return new AgentListModel();
    }
    const agentModels = data
        .map((agent) => agentModelMapper(agent))
        .map((agent) => {
            // If the agent is not in the list of local repositories, then set the repositoryId to null in order to show
            // the agent is not assigned to any repository in this GDB instance.
            if (!localRepositoryIds.includes(agent.repositoryId)) {
                agent.repositoryId = null;
            }
            return agent;
        });
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
        instructions: agentInstructionsMapper(data.instructions),
        assistantExtractionMethods: extractionMethodsMapper(data.assistantExtractionMethods),
        additionalExtractionMethods: additionalExtractionMethodsMapper(data.additionalExtractionMethods)
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
        method: data.method,
        ontologyGraph: data.ontologyGraph,
        addMissingNamespaces: data.addMissingNamespaces,
        sparqlQuery: data.sparqlQuery,
        similarityIndex: data.similarityIndex,
        similarityIndexThreshold: data.similarityIndexThreshold,
        maxNumberOfTriplesPerCall: data.maxNumberOfTriplesPerCall,
        queryTemplate: data.queryTemplate,
        retrievalConnectorInstance: data.retrievalConnectorInstance
    });
};

const additionalExtractionMethodsMapper = (data) => {
    if (!data) {
        return;
    }
    return data.map((additionalExtractionMethod) => additionalExtractionMethodMapper(additionalExtractionMethod));
};

const additionalExtractionMethodMapper = (data) => {
    if (!data) {
        return;
    }
    return new AdditionalExtractionMethodModel({
        method: data.method
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
