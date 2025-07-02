import {
    AdditionalExtractionMethod,
    AdditionalExtractionMethodModel,
    AgentInstructionsModel,
    AgentListModel,
    AgentModel,
    ExtractionMethodModel
} from '../../models/ttyg/agents';
import {
    AdditionalExtractionMethodFormModel,
    AgentFormModel,
    AgentInstructionsFormModel,
    ExtractionMethodFormModel
} from '../../models/ttyg/agent-form';
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
    additionalExtractionMethodsFormMapper(agentModel.additionalExtractionMethods, defaultAgentModel.additionalExtractionMethods, agentFormModel);
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
    const defaultSparqlMethodValues = defaultData.find((defaultExtractionMethod) => defaultExtractionMethod.method === 'sparql_query');
    const extractionMethods = [...data, ...defaultExtractionMethods];
    extractionMethods.forEach((extractionMethod) => {
        const isMethodSelected = data.some((method) => method.method === extractionMethod.method);
        // The sparqlOption is applicable only for the sparql_search method.
        let sparqlOption = '';
        if (isMethodSelected && extractionMethod.method === 'sparql_query') {
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
            ontologyGraph: extractionMethod.ontologyGraph ? extractionMethod.ontologyGraph : defaultSparqlMethodValues.ontologyGraph,
            addMissingNamespaces: extractionMethod.addMissingNamespaces,
            sparqlQuery: new TextFieldModel({
                value: extractionMethod.sparqlQuery ? extractionMethod.sparqlQuery : defaultSparqlMethodValues.sparqlQuery,
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
 * @param {AdditionalExtractionMethodsModel} additionalExtractionMethodsResponse
 * @param {AdditionalExtractionMethodsModel} defaultAdditionalExtractionMethodData
 * @param {AgentFormModel} agentFormModel
 */
function additionalExtractionMethodsFormMapper(additionalExtractionMethodsResponse, defaultAdditionalExtractionMethodData, agentFormModel) {
    // No Additional extraction methods on new agent creation
    if (!additionalExtractionMethodsResponse) {
        return;
    }
    const additionalExtractionMethods = additionalExtractionMethodsResponse.map(method => {
        let data = {
            method: method.method || defaultAdditionalExtractionMethodData.method,
            expanded: method.expanded || defaultAdditionalExtractionMethodData.expanded,
        };
        if (method.method === AdditionalExtractionMethod.IRI_DISCOVERY || method.method === AdditionalExtractionMethod.AUTOCOMPLETE_IRI_DISCOVERY_SEARCH) {
            data.selected = additionalExtractionMethodsResponse.some((agentMethod) => agentMethod.method === method.method);
        }

        if (method.method === AdditionalExtractionMethod.AUTOCOMPLETE_IRI_DISCOVERY_SEARCH) {
            data.maxNumberOfResultsPerCall = method._maxNumberOfResultsPerCall || defaultAdditionalExtractionMethodData.maxNumberOfResultsPerCall;
        }
        return new AdditionalExtractionMethodFormModel(data);
    });
    agentFormModel.additionalExtractionMethods.setAdditionalExtractionMethod(additionalExtractionMethods);
}

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
        instructions: agentInstructionsMapper(data.assistantsInstructions),
        assistantExtractionMethods: extractionMethodsMapper(data.assistantExtractionMethods),
        additionalExtractionMethods: additionalExtractionMethodsMapper(data.additionalExtractionMethods),
        compatibility: data.compatibility,
    }, hashGenerator);
};

const extractionMethodsMapper = (data) => {
    if (!data) {
        return;
    }
    const methods = [];

    if (data.sparql_query) {
        methods.push(new ExtractionMethodModel({
            method: 'sparql_query',
            ontologyGraph: data.sparql_query.ontologyGraph,
            addMissingNamespaces: data.sparql_query.addMissingNamespaces,
            sparqlQuery: data.sparql_query.ontologyQuery
        }));
    }

    if (data.fts_search) {
        methods.push(new ExtractionMethodModel({
            method: 'fts_search',
            limit: data.fts_search.limit
        }));
    }

    if (data.similarity_search) {
        methods.push(new ExtractionMethodModel({
            method: 'similarity_search',
            similarityIndex: data.similarity_search.similarityIndex,
            similarityIndexThreshold: data.similarity_search.resultThreshold,
            limit: data.similarity_search.limit
        }));
    }

    if (data.retrieval_search) {
        methods.push(new ExtractionMethodModel({
            method: 'retrieval_search',
            queryTemplate: data.retrieval_search.queryTemplate,
            retrievalConnectorInstance: data.retrieval_search.connectorInstance,
            limit: data.retrieval_search.limit
        }));
    }

    return methods;
};

const additionalExtractionMethodsMapper = (data) => {
    if (!data) {
        return;
    }
    const methods = [];

    if (data.iri_discovery) {
        methods.push(new AdditionalExtractionMethodModel({
            method: AdditionalExtractionMethod.IRI_DISCOVERY
        }));
    }

    if (data.autocomplete_iri_discovery_search) {
        methods.push(new AdditionalExtractionMethodModel({
            method: AdditionalExtractionMethod.AUTOCOMPLETE_IRI_DISCOVERY_SEARCH,
            maxNumberOfResultsPerCall: data.autocomplete_iri_discovery_search.limit || 0
        }));
    }

    return methods;
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
