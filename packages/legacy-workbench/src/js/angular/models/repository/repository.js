export class RepositoryInfoModel {
    constructor(data = {}) {
        /**
         * @type {string}
         * @private
         */
        this._id = data.id;
        /**
         * @type {string}
         * @private
         */
        this._title = data.title;
        /**
         * @type {string}
         * @private
         */
        this._type = data.type;
        /**
         * @type {string}
         * @private
         */
        this._sesameType = data.sesameType;
        /**
         * @type {string}
         * @private
         */
        this._uri = data.uri;
        /**
         * @type {string}
         * @private
         */
        this._externalUrl = data.externalUrl;
        /**
         * @type {string}
         * @private
         */
        this._location = data.location;
        /**
         * @type {string}
         * @private
         */
        this._state = data.state;
        /**
         * @type {boolean}
         * @private
         */
        this._local = data.local;
        /**
         * @type {boolean}
         * @private
         */
        this._readable = data.readable;
        /**
         * @type {boolean}
         * @private
         */
        this._writable = data.writable;
        /**
         * @type {boolean}
         * @private
         */
        this._unsupported = data.unsupported;
    }

    get id() {
        return this._id;
    }

    set id(value) {
        this._id = value;
    }

    get title() {
        return this._title;
    }

    set title(value) {
        this._title = value;
    }

    get type() {
        return this._type;
    }

    set type(value) {
        this._type = value;
    }

    get sesameType() {
        return this._sesameType;
    }

    set sesameType(value) {
        this._sesameType = value;
    }

    get uri() {
        return this._uri;
    }

    set uri(value) {
        this._uri = value;
    }

    get externalUrl() {
        return this._externalUrl;
    }

    set externalUrl(value) {
        this._externalUrl = value;
    }

    get location() {
        return this._location;
    }

    set location(value) {
        this._location = value;
    }

    get state() {
        return this._state;
    }

    set state(value) {
        this._state = value;
    }

    get local() {
        return this._local;
    }

    set local(value) {
        this._local = value;
    }

    get readable() {
        return this._readable;
    }

    set readable(value) {
        this._readable = value;
    }

    get writable() {
        return this._writable;
    }

    set writable(value) {
        this._writable = value;
    }

    get unsupported() {
        return this._unsupported;
    }

    set unsupported(value) {
        this._unsupported = value;
    }
}

export class RepositoryConfigModel {
    constructor(data = {}) {
        /**
         * @type {string}
         * @private
         */
        this._id = data.id;
        /**
         * @type {string}
         * @private
         */
        this._title = data.title;
        /**
         * @type {string}
         * @private
         */
        this._type = data.type;
        /**
         * @type {string}
         * @private
         */
        this._sesameType = data.sesameType;
        /**
         * @type {string}
         * @private
         */
        this._location = data.location;
        /**
         * @type {RepositoryParams}
         * @private
         */
        this._params = data.params;
    }

    /**
     * Gets a parameter from the repository params.
     * @param {string} name
     * @return {RepositoryParam|undefined}
     */
    getParam(name) {
        return this._params.getParam(name);
    }

    /**
     * Gets a parameter value from the repository params.
     * @param {string} name
     * @return {boolean|string|number|Array|undefined}
     */
    getParamValue(name) {
        return this._params.getParamValue(name);
    }

    get id() {
        return this._id;
    }

    set id(value) {
        this._id = value;
    }

    get title() {
        return this._title;
    }

    set title(value) {
        this._title = value;
    }

    get type() {
        return this._type;
    }

    set type(value) {
        this._type = value;
    }

    get sesameType() {
        return this._sesameType;
    }

    set sesameType(value) {
        this._sesameType = value;
    }

    get location() {
        return this._location;
    }

    set location(value) {
        this._location = value;
    }

    get params() {
        return this._params;
    }

    set params(value) {
        this._params = value;
    }
}

export class RepositoryParams {
    constructor(data = {}) {
        /**
         * @type {{[string]:RepositoryParam}}
         * @private
         */
        this._params = data;
    }

    get params() {
        return this._params;
    }

    set params(value) {
        this._params = value;
    }

    /**
     * Adds a parameter to the repository params.
     * @param {RepositoryParam} param
     */
    addParam(param) {
        this._params[param.name] = param;
    }

    /**
     * Gets a parameter from the repository params.
     * @param {string} name
     * @return {RepositoryParam|undefined}
     */
    getParam(name) {
        return this._params[name];
    }

    /**
     * Gets a parameter value from the repository params.
     * @param {string} name
     * @return {boolean|string|number|Array|undefined}
     */
    getParamValue(name) {
        if (!this._params[name]) {
            return undefined;
        }
        return this._params[name].getValue();
    }
}

export class RepositoryParam {
    constructor(data = {}) {
        /**
         * @type {string}
         * @private
         */
        this._name = data.name;
        /**
         * @type {string}
         * @private
         */
        this._label = data.label;
        /**
         * @type {*}
         * @private
         */
        this._value = data.value;
    }

    getValue() {
        if (this._value === 'true') {
            return true;
        } else if (this._value === 'false') {
            return false;
        }
        // if value is number
        if (!isNaN(this._value)) {
            return Number(this._value);
        }
        return this._value;
    }

    get name() {
        return this._name;
    }

    set name(value) {
        this._name = value;
    }

    get label() {
        return this._label;
    }

    set label(value) {
        this._label = value;
    }

    get value() {
        return this._value;
    }

    set value(value) {
        this._value = value;
    }
}

export const REPOSITORY_PARAMS = {
    queryTimeout: 'queryTimeout',
    cacheSelectNodes: 'cacheSelectNodes',
    rdfsSubClassReasoning: 'rdfsSubClassReasoning',
    validationEnabled: 'validationEnabled',
    ftsStringLiteralsIndex: 'ftsStringLiteralsIndex',
    shapesGraph: 'shapesGraph',
    parallelValidation: 'parallelValidation',
    checkForInconsistencies: 'checkForInconsistencies',
    performanceLogging: 'performanceLogging',
    disableSameAs: 'disableSameAs',
    ftsIrisIndex: 'ftsIrisIndex',
    entityIndexSize: 'entityIndexSize',
    dashDataShapes: 'dashDataShapes',
    queryLimitResults: 'queryLimitResults',
    throwQueryEvaluationExceptionOnTimeout: 'throwQueryEvaluationExceptionOnTimeout',
    member: 'member',
    storageFolder: 'storageFolder',
    validationResultsLimitPerConstraint: 'validationResultsLimitPerConstraint',
    enablePredicateList: 'enablePredicateList',
    transactionalValidationLimit: 'transactionalValidationLimit',
    ftsIndexes: 'ftsIndexes',
    logValidationPlans: 'logValidationPlans',
    imports: 'imports',
    isShacl: 'isShacl',
    inMemoryLiteralProperties: 'inMemoryLiteralProperties',
    ruleset: 'ruleset',
    readOnly: 'readOnly',
    enableLiteralIndex: 'enableLiteralIndex',
    enableFtsIndex: 'enableFtsIndex',
    defaultNS: 'defaultNS',
    enableContextIndex: 'enableContextIndex',
    baseURL: 'baseURL',
    logValidationViolations: 'logValidationViolations',
    globalLogValidationExecution: 'globalLogValidationExecution',
    entityIdSize: 'entityIdSize',
    repositoryType: 'repositoryType',
    eclipseRdf4jShaclExtensions: 'eclipseRdf4jShaclExtensions',
    validationResultsLimitTotal: 'validationResultsLimitTotal'
};
