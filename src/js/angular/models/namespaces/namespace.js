export class NameSpaceModel {
    constructor(prefix, uri) {
        this._prefix = prefix;
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
