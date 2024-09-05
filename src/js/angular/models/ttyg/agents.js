import {cloneDeep} from "lodash";
import {AGENTS_FILTER_ALL_KEY} from "../../ttyg/services/constants";

export class AgentModel {
    constructor(data, hashGenerator) {
        this.hashGenerator = hashGenerator;
        /**
         * @type {string}
         * @private
         */
        this._id = data.id;
        /**
         * @type {string}
         * @private
         */
        this._name = data.name;
        /**
         * @type {string}
         * @private
         */
        this._repositoryId = data.repositoryId;
        /**
         * @type {string}
         * @private
         */
        this._model = data.model;
        /**
         * @type {number}
         * @private
         */
        this._temperature = data.temperature;
        /**
         * @type {number}
         * @private
         */
        this._topP = data.topP;
        /**
         * @type {number}
         * @private
         */
        this._seed = data.seed;
        /**
         * @type {number}
         * @private
         */
        this._maxNumberOfTriplesPerCall = data.maxNumberOfTriplesPerCall;
        /**
         * @type {{systemInstruction: string, userInstruction: string}}
         * @private
         */
        this._instructions = data.instructions;
        this._assistantExtractionMethods = data.assistantExtractionMethods;
    }

    get id() {
        return this._id;
    }

    set id(value) {
        this._id = value;
    }

    get name() {
        return this._name;
    }

    set name(value) {
        this._name = value;
    }

    get repositoryId() {
        return this._repositoryId;
    }

    set repositoryId(value) {
        this._repositoryId = value;
    }

    get model() {
        return this._model;
    }

    set model(value) {
        this._model = value;
    }

    get temperature() {
        return this._temperature;
    }

    set temperature(value) {
        this._temperature = value;
    }

    get topP() {
        return this._topP;
    }

    set topP(value) {
        this._topP = value;
    }

    get seed() {
        return this._seed;
    }

    set seed(value) {
        this._seed = value;
    }

    get maxNumberOfTriplesPerCall() {
        return this._maxNumberOfTriplesPerCall;
    }

    set maxNumberOfTriplesPerCall(value) {
        this._maxNumberOfTriplesPerCall = value;
    }

    get instructions() {
        return this._instructions;
    }

    set instructions(value) {
        this._instructions = value;
    }

    get assistantExtractionMethods() {
        return this._assistantExtractionMethods;
    }

    set assistantExtractionMethods(value) {
        this._assistantExtractionMethods = value;
    }
}

export class AgentInstructionsModel {
    constructor(data) {
        /**
         * @type {string}
         * @private
         */
        this._systemInstruction = data.systemInstruction;
        /**
         * @type {string}
         * @private
         */
        this._userInstruction = data.userInstruction;
    }

    get systemInstruction() {
        return this._systemInstruction;
    }

    set systemInstruction(value) {
        this._systemInstruction = value;
    }

    get userInstruction() {
        return this._userInstruction;
    }

    set userInstruction(value) {
        this._userInstruction = value;
    }
}

export class ExtractionMethodModel {
    constructor(data) {
        /**
         * @type {ExtractionMethod}
         * @private
         */
        this._name = data.name;
    }
}

export class AgentListModel {
    constructor(agents = []) {
        /**
         * @type {AgentModel[]}
         * @private
         */
        this._agents = agents;
        /**
         * Used to store the original list of agents when filtering.
         * @type {AgentModel[]}
         * @private
         */
        this._agentsClone = cloneDeep(agents);
    }

    isEmpty() {
        return this._agents.length === 0;
    }

    /**
     * Filters the agents in place by the repository ID property. This uses the private _agentsClone property to do the
     * filtering without losing the original list.
     * There is a special case when the repository ID is equal to AGENTS_FILTER_ALL_KEY which means that all agents
     * should be shown.
     * @param {string} repositoryId
     */
    filterByRepository(repositoryId) {
        this._agents = this._agentsClone.filter((agent) => {
            if (repositoryId === AGENTS_FILTER_ALL_KEY) {
                return true;
            } else if (agent.repositoryId === repositoryId) {
                return agent;
            }
        });
    }

    get agents() {
        return this._agents;
    }

    set agents(value) {
        this._agents = value;
    }
}

export const ExtractionMethod = {
    FTS_SEARCH: 'fts_search',
    SPARQL: 'sparql_search',
    SIMILARITY: 'similarity_search',
    RETRIEVAL: 'retrieval_search'
};

/**
 * A model used for the filter dropdown in the agent list.
 */
export class AgentListFilterModel {
    constructor(key, label) {
        /**
         * @type {string}
         * @private
         */
        this._key = key;
        /**
         * @type {string}
         * @private
         */
        this._label = label;
    }

    get key() {
        return this._key;
    }

    set key(value) {
        this._key = value;
    }

    get label() {
        return this._label;
    }

    set label(value) {
        this._label = value;
    }
}
