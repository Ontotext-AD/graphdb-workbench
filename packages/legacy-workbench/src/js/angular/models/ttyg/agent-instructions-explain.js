export class AgentInstructionsExplain {
    constructor(data) {
        /**
         * @type {string}
         * @private
         */
        this._type = data.type;
        /**
         * @type {string}
         * @private
         */
        this._content = data.content;
        /**
         * @type {number}
         * @private
         */
        this._size = data.size;
    }

    get size() {
        return this._size;
    }

    set size(value) {
        this._size = value;
    }
    get content() {
        return this._content;
    }

    set content(value) {
        this._content = value;
    }
    get type() {
        return this._type;
    }

    set type(value) {
        this._type = value;
    }
}

export class AgentInstructionsExplainList {
    constructor(data) {
        /**
         * @type {AgentInstructionsExplain[]}
         * @private
         */
        this._instructions = data.instructions;
    }

    get instructions() {
        return this._instructions;
    }

    set instructions(value) {
        this._instructions = value;
    }
}
