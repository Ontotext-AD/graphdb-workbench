export class CreateEndpointFromShapesRequest {
    /**
     * @type {string}
     * @private
     */
    _fromRepo;
    /**
     * @type {string[]}
     * @private
     */
    _shapes;
    /**
     * @type {Object.<string, *>}
     * @private
     */
    _config;

    constructor(data) {
        this._fromRepo = data.fromRepo || '';
        this._shapes = data.shapes || [];
        this._config = data.config || {};
    }

    toJSON() {
        return {
            fromRepo: this.fromRepo,
            shapes: this.shapes,
            config: this.config
        };
    }

    get fromRepo() {
        return this._fromRepo;
    }

    set fromRepo(value) {
        this._fromRepo = value;
    }

    get shapes() {
        return this._shapes;
    }

    set shapes(value) {
        this._shapes = value;
    }

    get config() {
        return this._config;
    }

    set config(value) {
        this._config = value;
    }
}
