import {cloneDeep} from "lodash";

export class ExplainResponseCacheModel {
    constructor() {
        /**
         *
         * @type {{[key: string]: ExplainResponseModel}}
         */
        this._cache = {};

    }

    /**
     * Adds <code>explainResponse to the cache.
     * @param {ExplainResponseModel} explainResponse
     */
    adExplainResponse(explainResponse) {
        this._cache[explainResponse.answerId] = explainResponse;
    }

    /**
     * Returns the explain response instance for answer with id <code>answerId</code>.
     * @param {string} answerId
     * @return {ExplainResponseModel | undefined}
     */
    getExplainResponse(answerId) {
        return this._cache[answerId];
    }
}

export class ExplainResponseModel {
    constructor(data = {}) {

        /**
         * @type {string}
         */
        this._chatId = data.chatId;

        /**
         * @type {string}
         */
        this._answerId = data.answerId;

        /**
         * @type {ExplainQueryMethodsListModel}
         */
        this._queryMethods = data.queryMethods;

        this._expanded = data.expanded !== undefined ? data.expanded : true;
    }

    get chatId() {
        return this._chatId;
    }

    set chatId(value) {
        this._chatId = value;
    }

    get answerId() {
        return this._answerId;
    }

    set answerId(value) {
        this._answerId = value;
    }

    get queryMethods() {
        return this._queryMethods;
    }

    set queryMethods(value) {
        this._queryMethods = value;
    }

    get expanded() {
        return this._expanded;
    }

    set expanded(value) {
        this._expanded = value;
    }
}

export class ExplainQueryMethodsListModel {
    constructor(data = {}) {
        this._queryMothods = data.queryMethods || [];
    }

    get queryMothods() {
        return this._queryMothods;
    }

    set queryMothods(value) {
        this._queryMothods = value;
    }
}

export class ExplainQueryMethodModel {
    constructor(data = {}) {
        /**
         * @type {ExtractionMethod.FTS_SEARCH | ExtractionMethod.RETRIEVAL | ExtractionMethod.SPARQL | ExtractionMethod.SIMILARITY}
         */
        this._name = data._name;

        /**
         * @type {string}
         */
        this._rawQuery = data._rawQuery;

        /**
         * @type {string}
         */
        this._query = data._query;
    }

    get name() {
        return this._name;
    }

    set name(value) {
        this._name = value;
    }

    get rawQuery() {
        return this._rawQuery;
    }

    set rawQuery(value) {
        this._rawQuery = value;
    }

    get query() {
        return this._query;
    }

    set query(value) {
        this._query = value;
    }
}
