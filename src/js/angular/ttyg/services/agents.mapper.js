import {
    AdditionalExtractionMethod, AdditionalExtractionMethodModel,
    AgentInstructionsModel,
    AgentListModel,
    AgentModel, ExtractionMethod,
    ExtractionMethodModel
} from "../../models/ttyg/agents";
import {
    AdditionalExtractionMethodFormModel,
    AdditionalExtractionMethodsFormModel,
    AgentFormModel,
    AgentInstructionsFormModel,
    ExtractionMethodFormModel, ExtractionMethodsFormModel
} from "../../models/ttyg/agent-form";
import {NumericRangeModel, TextFieldModel} from "../../models/form-fields";
import {md5HashGenerator} from "../../utils/hash-utils";
import {cloneDeep} from "lodash";

const AGENT_MODEL_DEFAULT_VALUES = {
    name: '',
    repositoryId: '',
    model: 'gpt-4o',
    temperature: new NumericRangeModel({
        value: 0.7,
        minValue: 0,
        maxValue: 2,
        step: 0.1
    }),
    topP: new NumericRangeModel({
        value: 1,
        minValue: 0,
        maxValue: 1,
        step: 0.1
    }),
    seed: 1,
    instructions: new AgentInstructionsFormModel({
        systemInstruction: '',
        userInstruction: ''
    }),
    assistantExtractionMethods: new ExtractionMethodsFormModel([
        new ExtractionMethodFormModel({
            method: ExtractionMethod.SPARQL,
            ontologyGraph: 'http://example.com/swgraph',
            sparqlQuery: new TextFieldModel({
                value: 'select ?s ?p ?o where {?s ?p ?o .}',
                minLength: 1,
                maxLength: 2380
            }),
            selected: false
        }),
        new ExtractionMethodFormModel({
            method: ExtractionMethod.FTS_SEARCH,
            maxNumberOfTriplesPerCall: null,
            selected: false
        }),
        new ExtractionMethodFormModel({
            method: ExtractionMethod.SIMILARITY,
            similarityIndex: null,
            similarityIndexThreshold: new NumericRangeModel({
                value: 0.6,
                minValue: 0,
                maxValue: 1,
                step: 0.1
            }),
            maxNumberOfTriplesPerCall: null,
            selected: false
        }),
        new ExtractionMethodFormModel({
            method: ExtractionMethod.RETRIEVAL,
            retrievalConnectorInstance: null,
            maxNumberOfTriplesPerCall: null,
            queryTemplate: new TextFieldModel({
                value: '{"query": "string"}',
                minLength: 1,
                maxLength: 2380
            }),
            selected: false
        })
    ]),
    additionalExtractionMethods: new AdditionalExtractionMethodsFormModel([
        new AdditionalExtractionMethodFormModel({
            method: AdditionalExtractionMethod.IRI_DISCOVERY_SEARCH
        })
    ])
};

export const newAgentFormModelProvider = (data = {}) => {
    return new AgentFormModel(Object.assign({}, cloneDeep(AGENT_MODEL_DEFAULT_VALUES), data));
};

/**
 * Converts an angel model to an agent form model.
 * @param {AgentModel} agentModel
 * @return {AgentFormModel}
 */
export const agentFormModelMapper = (agentModel) => {
    if (!agentModel) {
        return;
    }
    const agentFormModel = newAgentFormModelProvider();
    agentFormModel.id = agentModel.id;
    agentFormModel.name = agentModel.name;
    agentFormModel.repositoryId = agentModel.repositoryId;
    agentFormModel.model = agentModel.model;
    agentFormModel.temperature.value = agentModel.temperature !== undefined ? agentModel.temperature : AGENT_MODEL_DEFAULT_VALUES.temperature.value;
    agentFormModel.topP.value = agentModel.topP !== undefined ? agentModel.topP : AGENT_MODEL_DEFAULT_VALUES.topP.value;
    agentFormModel.seed = agentModel.seed;
    agentFormModel.instructions = agentInstructionsFormMapper(agentModel.instructions);
    extractionMethodsFormMapper(agentFormModel, agentModel.assistantExtractionMethods);
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
 * @param {ExtractionMethodModel[]} data
 */
const extractionMethodsFormMapper = (agentFormModel, data = []) => {
    data.forEach((extractionMethod) => {
        let sparqlOption = '';
        if (extractionMethod.sparqlQuery) {
           sparqlOption = 'sparqlQuery';
        } else if (extractionMethod.ontologyGraph) {
            sparqlOption = 'ontologyGraph';
        }
        const existingMethod = new ExtractionMethodFormModel({
            selected: true,
            method: extractionMethod.method,
            sparqlOption: sparqlOption,
            ontologyGraph: extractionMethod.ontologyGraph,
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
            maxNumberOfTriplesPerCall: extractionMethod.maxNumberOfTriplesPerCall,
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
 * @return {AgentListModel}
 */
export const agentListMapper = (data) => {
    if (!data) {
        return new AgentListModel();
    }
    const agentModels = data.map((agent) => agentModelMapper(agent));
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
