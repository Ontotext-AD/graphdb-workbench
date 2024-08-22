export class ChatQuestion {
    constructor(data = {}) {
        this._conversationId = data._conversationId;
        this._agentId = data._agentId;
        this._question = data._question;
    }

    get conversationId() {
        return this._conversationId;
    }

    set conversationId(value) {
        this._conversationId = value;
    }

    get agentId() {
        return this._agentId;
    }

    set agentId(value) {
        this._agentId = value;
    }

    get question() {
        return this._question;
    }

    set question(value) {
        this._question = value;
    }
}
