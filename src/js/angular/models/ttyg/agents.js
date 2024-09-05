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
    }

    isEmpty() {
        return this._agents.length === 0;
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
