export class PrefixList {
    /**
     * @type {Prefix[]}
     * @private
     */
    _prefixes;

    constructor(data) {
        this._prefixes = data || [];
    }

    get prefixes() {
        return this._prefixes;
    }

    set prefixes(value) {
        this._prefixes = value;
    }
}

export class Prefix {
    /**
     * @type {string}
     * @private
     */
    _prefix;
    /**
     * @type {string}
     * @private
     */
    _namespace;
    /**
     * @type {string[]}
     * @private
     */
    _sources;

    constructor(data) {
        this._prefix = data.prefix;
        this._namespace = data.namespace;
        this._sources = data.sources;
    }
}
