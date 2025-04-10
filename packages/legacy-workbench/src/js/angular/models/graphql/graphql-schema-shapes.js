export class GraphqlSchemaShapes {
    /**
     * @type {GraphqlSchemaShape[]}
     */
    _shapes;
    /**
     * @type {number}
     * @private
     */
    _size;
    /**
     * @type {boolean}
     * @private
     */
    _isEmpty;

    constructor(data) {
        this._shapes = data || [];
        this._size = this.shapes.length;
        this._isEmpty = this.shapes.length === 0;
    }

    /**
     * Process the shapes with the given predicate.
     * @param {function} predicate The predicate to apply to each shape.
     * @returns {GraphqlSchemaShape[]}
     */
    processShapes(predicate) {
        return this.shapes.map(predicate);
    }

    /**
     * Get the ids of the shapes.
     * @returns {string[]} The ids of the shapes.
     */
    getShapeIds() {
        return this.shapes.map(shape => shape.id);
    }

    get isEmpty() {
        return this._isEmpty;
    }

    get size() {
        return this._size;
    }

    get shapes() {
        return this._shapes;
    }

    set shapes(value) {
        this._shapes = value;
        this._size = this.shapes.length;
        this._isEmpty = this.shapes.length === 0;
    }

    toJSON() {
        return this.shapes.map(shape => shape.id);
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
