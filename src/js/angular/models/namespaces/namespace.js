export class NamespaceModel {
    constructor(prefix, uri) {
        /**
         * The prefix of the namespace, for example "omgeo".
         * @type {string}
         * @private
         */
        this._prefix = prefix;

        /**
         * The URI of the namespace, for example "http://www.ontotext.com/owlim/geo#".
         * @type {string}
         * @private
         */
        this._uri = uri;
    }

    get prefix() {
        return this._prefix;
    }

    set prefix(value) {
        this._prefix = value;
    }

    get uri() {
        return this._uri;
    }

    set uri(value) {
        this._uri = value;
    }
}
