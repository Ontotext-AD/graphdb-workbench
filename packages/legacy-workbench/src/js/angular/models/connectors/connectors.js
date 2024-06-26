export class ConnectorTypesListModel {
    constructor(data = {}) {
        /**
         * @type {ConnectorTypeModel[]}
         * @private
         */
        this._connectors = data.connectors || [];
    }

    getConnectorByName(name) {
        return this._connectors.find((connector) => connector.name === name);
    }

    get connectors() {
        return this._connectors;
    }

    set connectors(value) {
        this._connectors = value;
    }
}

export class ConnectorTypeModel {
    constructor(data) {
        /**
         * @type {string}
         * @private
         */
        this._name = data.name;
        /**
         * @type {string}
         * @private
         */
        this._prefix = data.prefix;
    }

    get name() {
        return this._name;
    }

    set name(value) {
        this._name = value;
    }

    get prefix() {
        return this._prefix;
    }

    set prefix(value) {
        this._prefix = value;
    }
}

export class ConnectorListModel {
    constructor(data = []) {
        this._connectors = data.connectors;
    }

    get connectors() {
        return this._connectors;
    }

    set connectors(value) {
        this._connectors = value;
    }
}

export class ConnectorModel {
    constructor(data) {
        this._name = data.name;
        this._settings = new ConnectorSettingsModel(data);
    }

    get settings() {
        return this._settings;
    }

    set settings(value) {
        this._settings = value;
    }
    get name() {
        return this._name;
    }

    set name(value) {
        this._name = value;
    }
}

export class ConnectorSettingsModel {
    constructor(data) {
        this._settings = data.values || {};
    }

    get settings() {
        return this._settings;
    }

    set settings(value) {
        this._settings = value;
    }
}
