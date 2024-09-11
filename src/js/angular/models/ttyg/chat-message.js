export class ChatMessageModel {
    constructor(data) {

        /**
         * @type {string}
         */
        this._id = data.id;

        /**
         * @type {string}
         */
        this._conversationId = data.conversationId;

        /**
         * @type {string}
         */
        this._agentId = data.agent;

        /**
         * @type @type {string} - A value from {@link CHAT_MESSAGE_ROLE}, determining the owner of the message (e.g., user, assistant).
         */
        this._role = data.role;

        /**
         * @type {string}
         */
        this._message = data.message;

        /**
         * @type {number}
         */
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

export const CHAT_MESSAGE_ROLE = {
    USER: 'user',
    ASSISTANT: 'assistant'
};
