export const StartMode = {
    QUERY: 'query',
    NODE: 'node',
    SEARCH: 'search'
};

export class GraphsConfig {
    /**
     * @param {string|undefined} id
     * @param {string|undefined} name
     * @param {string|undefined} startMode
     * @param {string|undefined} owner
     * @param {boolean|undefined} startQueryIncludeInferred
     * @param {boolean|undefined} startQuerySameAs
     * @param {string|undefined} startGraphQuery
     * @param {string|undefined} startIRI
     * @param {string|undefined} startIRILabel
     * @param {string|undefined} expandQuery
     * @param {string|undefined} resourceQuery
     * @param {string|undefined} predicateLabelQuery
     * @param {string|undefined} resourcePropertiesQuery
     * @param {boolean|undefined} shared
     * @param {string|undefined} description
     * @param {string|undefined} hint
     * @param {string|undefined} startGraphQueryDescription
     * @param {string|undefined} expandQueryDescription
     * @param {string|undefined} resourceQueryDescription
     * @param {string|undefined} predicateLabelQueryDescription
     * @param {string|undefined} resourcePropertiesQueryDescription
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
                hint,
                startGraphQueryDescription,
                expandQueryDescription,
                resourceQueryDescription,
                predicateLabelQueryDescription,
                resourcePropertiesQueryDescription
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
        this._startGraphQueryDescription = startGraphQueryDescription;
        this._expandQueryDescription = expandQueryDescription;
        this._resourceQueryDescription = resourceQueryDescription;
        this._predicateLabelQueryDescription = predicateLabelQueryDescription;
        this._resourcePropertiesQueryDescription = resourcePropertiesQueryDescription;
    }

    /**
     * @param {string} expectedMode
     * @return {boolean}
     */
    isStartMode(expectedMode) {
        return this.startMode === expectedMode;
    }

    isDefaultGraph() {
        return this.name === 'Minimal' || this.name === 'Advanced';
    }

    /**
     * Finds out the description for a property with given name. The description properties always end with the
     * `Description` suffix when loaded from backend.
     * @param {string} propertyName The property name for which to get the description.
     * @return {string|undefined} the property description or undefined if not found.
     */
    getPropertyDescription(propertyName) {
        const descriptionPropertyName = `${propertyName}Description`;
        return this[descriptionPropertyName];
    }

    /**
     * Resolves the query type applicable for given graph config wizard page.
     * @param {number} page A page is a tab in the graph config wizard.
     * @return {*|string}
     */
    getQueryType(page) {
        let query;
        if (this.isStartMode(StartMode.QUERY) && page === 1) {
            query = this.startGraphQuery;
        } else if (page === 2) {
            query = this.expandQuery;
        } else if (page === 3) {
            query = this.resourceQuery;
        } else if (page === 4) {
            query = this.predicateLabelQuery;
        } else if (page === 5) {
            query = this.resourcePropertiesQuery;
        }
        return query || '';
    }

    /**
     * Updates the model by applying the provided query to a particular property according to page property.
     * @param {string}query The query string to be stored in the model.
     * @param {number} page
     * @return {GraphsConfig}
     */
    updateModel(query, page) {
        if (this.isStartMode(StartMode.QUERY) && page === 1) {
            this.startGraphQuery = query;
        } else if (page === 2) {
            this.expandQuery = query;
        } else if (page === 3) {
            this.resourceQuery = query;
        } else if (page === 4) {
            this.predicateLabelQuery = query;
        } else if (page === 5) {
            this.resourcePropertiesQuery = query;
        }
        return this;
    }

    /**
     * Converts this model to a payload JSON object needed for a save config operation.
     * @return {{owner: (string|undefined), shared: (boolean|undefined), startIRI: (string|undefined), resourceQuery: (string|undefined), startGraphQuery: (string|undefined), expandQuery: (string|undefined), description: (string|undefined), startIRILabel: (string|undefined), startQueryIncludeInferred: (boolean|undefined), resourcePropertiesQuery: (string|undefined), predicateLabelQuery: (string|undefined), startMode: (string|undefined), hint: (string|undefined), name: (string|undefined), id: (string|undefined), startQuerySameAs: (boolean|undefined)}}
     */
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

    get startGraphQueryDescription() {
        return this._startGraphQueryDescription;
    }

    set startGraphQueryDescription(value) {
        this._startGraphQueryDescription = value;
    }

    get expandQueryDescription() {
        return this._expandQueryDescription;
    }

    set expandQueryDescription(value) {
        this._expandQueryDescription = value;
    }

    get resourceQueryDescription() {
        return this._resourceQueryDescription;
    }

    set resourceQueryDescription(value) {
        this._resourceQueryDescription = value;
    }

    get predicateLabelQueryDescription() {
        return this._predicateLabelQueryDescription;
    }

    set predicateLabelQueryDescription(value) {
        this._predicateLabelQueryDescription = value;
    }

    get resourcePropertiesQueryDescription() {
        return this._resourcePropertiesQueryDescription;
    }

    set resourcePropertiesQueryDescription(value) {
        this._resourcePropertiesQueryDescription = value;
    }
}
