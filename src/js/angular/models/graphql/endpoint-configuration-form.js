export class EndpointConfigurationForm {
    #endpointId;
    #endpointLabel;
    #vocabularyPrefix;

    constructor(data) {
        this.#endpointId = data.endpointId;
        this.#endpointLabel = data.endpointLabel;
        this.#vocabularyPrefix = data.vocabularyPrefix;
    }

    get endpointId() {
        return this.#endpointId;
    }

    set endpointId(value) {
        this.#endpointId = value;
    }

    get endpointLabel() {
        return this.#endpointLabel;
    }

    set endpointLabel(value) {
        this.#endpointLabel = value;
    }

    get vocabularyPrefix() {
        return this.#vocabularyPrefix;
    }

    set vocabularyPrefix(value) {
        this.#vocabularyPrefix = value;
    }
}
