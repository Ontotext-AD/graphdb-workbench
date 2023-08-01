export const StartMode = {
    QUERY: 'query',
    NODE: 'node',
    SEARCH: 'search'
};

export class GraphsConfig {
    /**
     * @param {string} id
     * @param {string} name
     * @param {string} startMode
     * @param {string} owner
     * @param {boolean} startQueryIncludeInferred
     * @param {boolean} startQuerySameAs
     * @param {string} startGraphQuery
     * @param {string} startIRI
     * @param {string} startIRILabel
     * @param {string} expandQuery
     * @param {string} resourceQuery
     * @param {string} predicateLabelQuery
     * @param {string} resourcePropertiesQuery
     * @param {boolean} shared
     * @param {string} description
     * @param {string} hint
     */
    constructor(id,
                name,
                startMode = StartMode.SEARCH,
                owner,
                startQueryIncludeInferred = true,
                startQuerySameAs= true,
                startGraphQuery,
                startIRI,
                startIRILabel,
                expandQuery,
                resourceQuery,
                predicateLabelQuery,
                resourcePropertiesQuery,
                shared,
                description,
                hint
    ) {
        this._id = id;
        this._name = name;
        this._startMode = startMode;
        this._owner = owner;
        this._startQueryIncludeInferred = startQueryIncludeInferred;
        this._startQuerySameAs = startQuerySameAs;
        this._startGraphQuery = startGraphQuery;
        this._startIRI = startIRI;
        this._startIRILabel = startIRILabel;
        this._expandQuery = expandQuery;
        this._resourceQuery = resourceQuery;
        this._predicateLabelQuery = predicateLabelQuery;
        this._resourcePropertiesQuery = resourcePropertiesQuery;
        this._shared = shared;
        this._description = description;
        this._hint = hint;
    }

    /**
     * @param {string} expectedMode
     * @return {boolean}
     */
    isStartMode(expectedMode) {
        return this._startMode === expectedMode;
    }

    toSavePayload() {
        return {
            id: this.id,
            name: this.name,
            startMode: this.startMode,
            owner: this.owner,
            startQueryIncludeInferred: this.startQueryIncludeInferred,
            startQuerySameAs: this.startQuerySameAs,
            startGraphQuery: this.startGraphQuery,
            startIRI: this.startIRI,
            startIRILabel: this.startIRILabel,
            expandQuery: this.expandQuery,
            resourceQuery: this.resourceQuery,
            predicateLabelQuery: this.predicateLabelQuery,
            resourcePropertiesQuery: this.resourcePropertiesQuery,
            shared: this.shared,
            description: this.description,
            hint: this.hint
        };
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

    get startMode() {
        return this._startMode;
    }

    set startMode(value) {
        this._startMode = value;
    }

    get owner() {
        return this._owner;
    }

    set owner(value) {
        this._owner = value;
    }

    get startQueryIncludeInferred() {
        return this._startQueryIncludeInferred;
    }

    set startQueryIncludeInferred(value) {
        this._startQueryIncludeInferred = value;
    }

    get startQuerySameAs() {
        return this._startQuerySameAs;
    }

    set startQuerySameAs(value) {
        this._startQuerySameAs = value;
    }

    get startGraphQuery() {
        return this._startGraphQuery;
    }

    set startGraphQuery(value) {
        this._startGraphQuery = value;
    }

    get startIRI() {
        return this._startIRI;
    }

    set startIRI(value) {
        this._startIRI = value;
    }

    get startIRILabel() {
        return this._startIRILabel;
    }

    set startIRILabel(value) {
        this._startIRILabel = value;
    }

    get expandQuery() {
        return this._expandQuery;
    }

    set expandQuery(value) {
        this._expandQuery = value;
    }

    get resourceQuery() {
        return this._resourceQuery;
    }

    set resourceQuery(value) {
        this._resourceQuery = value;
    }

    get predicateLabelQuery() {
        return this._predicateLabelQuery;
    }

    set predicateLabelQuery(value) {
        this._predicateLabelQuery = value;
    }

    get resourcePropertiesQuery() {
        return this._resourcePropertiesQuery;
    }

    set resourcePropertiesQuery(value) {
        this._resourcePropertiesQuery = value;
    }

    get shared() {
        return this._shared;
    }

    set shared(value) {
        this._shared = value;
    }

    get description() {
        return this._description;
    }

    set description(value) {
        this._description = value;
    }

    get hint() {
        return this._hint;
    }

    set hint(value) {
        this._hint = value;
    }
}
