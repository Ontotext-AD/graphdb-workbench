export class CreateEndpointFromOwlRequest {
    /**
     * The source repository ID from which the schema will be generated. If empty, the current repository is used.
     * @type {string}
     * @private
     */
    _fromRepo;
    /**
     * A list of named graphs to be included in the schema generation process. If empty, all repository data is considered.
     * @type {string[]}
     * @private
     */
    _namedGraphs;
    /**
     * A unique identifier for the generated schema.
     * @type {string}
     * @private
     */
    _id;
    /**
     * A user-friendly name for the schema.
     * @type {string}
     * @private
     */
    _label;
    /**
     * A description of the schema for documentation purposes.
     * @type {string}
     * @private
     */
    _description;
    /**
     * A prefix used for vocabulary terms in the schema.
     * @type {string}
     * @private
     */
    _vocPrefix;
    /**
     * The schema configuration settings, including details such as schema ID, label, description, and vocabulary prefix.
     * @type {Object.<string, *>}
     * @private
     */
    _config;

    constructor(data) {
        this._fromRepo = data.fromRepo || '';
        this._namedGraphs = data.namedGraphs || [];
        this._id = data.id || '';
        this._label = data.label || '';
        this._description = data.description || '';
        this._vocPrefix = data.vocab_prefix || '';
        this._config = data.config || {};
    }

    toJSON() {
        return {
            fromRepo: this.fromRepo,
            namedGraphs: this.namedGraphs,
            id: this.id,
            label: this.label,
            description: this.description,
            vocab_prefix: this.vocPrefix,
            config: this.config
        };
    }

    get fromRepo() {
        return this._fromRepo;
    }

    set fromRepo(value) {
        this._fromRepo = value;
    }

    get namedGraphs() {
        return this._namedGraphs;
    }

    set namedGraphs(value) {
        this._namedGraphs = value;
    }

    get id() {
        return this._id;
    }

    set id(value) {
        this._id = value;
    }

    get label() {
        return this._label;
    }

    set label(value) {
        this._label = value;
    }

    get description() {
        return this._description;
    }

    set description(value) {
        this._description = value;
    }

    get vocPrefix() {
        return this._vocPrefix;
    }

    set vocPrefix(value) {
        this._vocPrefix = value;
    }

    get config() {
        return this._config;
    }

    set config(value) {
        this._config = value;
    }
}
