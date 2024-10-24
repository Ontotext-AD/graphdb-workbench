import {AdditionalExtractionMethodModel, AgentInstructionsModel, AgentListModel, AgentModel, ExtractionMethodModel} from '../../models/ttyg/agents';
import {AgentFormModel, AgentInstructionsFormModel, ExtractionMethodFormModel} from '../../models/ttyg/agent-form';
import {NumericRangeModel, TextFieldModel} from '../../models/form-fields';
import {md5HashGenerator} from '../../utils/hash-utils';
import {AGENT_OPERATION} from "./constants";

/**
 * Converts an agent model to an agent form model.
 * @param {AgentModel} agentModel
 * @param {AgentModel} defaultAgentModel
 * @param {string} operation
 * @return {AgentFormModel}
 */
export const agentFormModelMapper = (agentModel, defaultAgentModel, operation ) => {
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
    agentFormModel.instructions = agentInstructionsFormMapper(agentModel.instructions, defaultAgentModel.instructions);
    extractionMethodsFormMapper(agentFormModel, operation, defaultAgentModel.assistantExtractionMethods, agentModel.assistantExtractionMethods);
    // Select additional methods if they are present in the list returned from the backend (BE).
    agentFormModel.additionalExtractionMethods.additionalExtractionMethods.forEach((method) => {
        method.selected = agentModel.additionalExtractionMethods && agentModel.additionalExtractionMethods.some((agentMethod) => agentMethod.method === method.method);
    });
    return agentFormModel;
};

/**
 * @param {AgentInstructionsModel} currentAgentModelInstructions
 * @param {AgentInstructionsModel} defaultInstructions
 * @return {AgentInstructionsFormModel}
 */
const agentInstructionsFormMapper = (currentAgentModelInstructions, defaultInstructions) => {
    if (!currentAgentModelInstructions && !defaultInstructions) {
        return;
    }
    const systemInstruction = currentAgentModelInstructions && currentAgentModelInstructions.systemInstruction || defaultInstructions.systemInstruction;
    const userInstruction = currentAgentModelInstructions && currentAgentModelInstructions.userInstruction || defaultInstructions.userInstruction;
    return new AgentInstructionsFormModel({
        systemInstruction: systemInstruction,
        userInstruction: userInstruction,
        defaultSystemInstruction: defaultInstructions.systemInstruction,
        defaultUserInstruction: defaultInstructions.userInstruction
    });
};

/**
 * @param {AgentFormModel} agentFormModel
 * @param {string} operation
 * @param {ExtractionMethodModel[]} defaultData
 * @param {ExtractionMethodModel[]} data
 */
const extractionMethodsFormMapper = (agentFormModel, operation, defaultData, data = []) => {
    const defaultExtractionMethods = defaultData.filter((defaultExtractionMethod) => !data.some((agentMethod) => agentMethod.method === defaultExtractionMethod.method));
    const extractionMethods = [...data, ...defaultExtractionMethods];
    extractionMethods.forEach((extractionMethod) => {
        const isMethodSelected = data.some((method) => method.method === extractionMethod.method);
        // The sparqlOption is applicable only for the sparql_search method.
        let sparqlOption = '';
        if (isMethodSelected && extractionMethod.method === 'sparql_search') {
            if (AGENT_OPERATION.CREATE === operation) {
                sparqlOption = '';
            } else if (extractionMethod.sparqlQuery) {
                sparqlOption = 'sparqlQuery';
            } else if (extractionMethod.ontologyGraph) {
                sparqlOption = 'ontologyGraph';
            }
        }
        // In edit and clone operations we have an existing agent instance, so we should show the selected methods from it.
        const shouldShowSelectedMethods = operation === AGENT_OPERATION.EDIT || operation === AGENT_OPERATION.CLONE;
        const existingMethod = new ExtractionMethodFormModel({
            selected: shouldShowSelectedMethods && isMethodSelected,
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
        .map((agent) => agentModelMapper(agent, localRepositoryIds));
    return new AgentListModel(agentModels);
};

export const agentModelMapper = (data, localRepositoryIds) => {
    if (!data) {
        return;
    }
    const hashGenerator = md5HashGenerator();
    return new AgentModel({
        id: data.id,
        name: data.name,
        repositoryId: data.repositoryId,
        // Sets the isRepositoryDeleted flag based on whether the repository ID is not in the list of repositories.
        isRepositoryDeleted: !localRepositoryIds.includes(data.repositoryId),
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
