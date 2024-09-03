export class ChatMessageModel {
    constructor(data) {
        this._id = data.id;
        this._conversationId = data.conversationId;
        this._agentId = data.agent;
        this._role = data.role;
        this._message = data.message;
        this._timestamp = data.timestamp;
    }

    get id() {
        return this._id;
    }

    set id(value) {
        this._id = value;
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

    get role() {
        return this._role;
    }

    set role(value) {
        this._role = value;
    }

    get message() {
        return this._message;
    }

    set message(value) {
        this._message = value;
    }

    get timestamp() {
        return this._timestamp;
    }

    set timestamp(value) {
        this._timestamp = value;
    }
}
