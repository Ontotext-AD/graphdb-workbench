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
    constructor(data = []) {
        this._items = data;
    }

    get items() {
        return this._items;
    }

    set items(value) {
        this._items = value;
    }
}

export class ExplainQueryMethodModel {
    constructor(data = {}) {
        /**
         * @type {ExtractionMethod.FTS_SEARCH | ExtractionMethod.RETRIEVAL | ExtractionMethod.SPARQL | ExtractionMethod.SIMILARITY}
         */
        this._name = data.name;

        /**
         * @type {string}
         */
        this._rawQuery = data.rawQuery;

        /**
         * @type {string}
         */
        this._query = data.query;

        /**
         * @Type {ExplainQueryType}
         * @private
         */
        this._queryType = data.queryType;

        /**
         * @type {string | null}
         * @private
         */
        this._errorMessage = data.output;
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

    get queryType() {
        return this._queryType;
    }

    set queryType(value) {
        this._queryType = value;
    }

    get errorMessage() {
        return this._errorMessage;
    }

    set errorMessage(value) {
        this._errorMessage = value;
    }
}

export const ExplainQueryType = {
    SAPRQL: 'sparql',
    JSON: 'json'
};
