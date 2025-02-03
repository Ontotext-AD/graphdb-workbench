export class GraphqlSchemaShapes {
    /**
     * @type {GraphqlSchemaShape[]}
     */
    _shapes;

    constructor(data) {
        this._shapes = data || [];
    }

    get shapes() {
        return this._shapes;
    }

    set shapes(value) {
        this._shapes = value;
    }
}

export class GraphqlSchemaShape {
    /**
     * @type {string}
     */
    _id;
    /**
     * @type {string}
     */
    _name;
    /**
     * @type {string}
     */
    _label;
    /**
     * @type {string}
     */
    _description;

    constructor(data) {
        this._id = data.id;
        this._name = data.name;
        this._label = data.label;
        this._description = data.description;
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
}
