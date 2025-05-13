export class ChatMessageModel {
    constructor(data) {

        /**
         * @type {string}
         */
        this._id = data.id;

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
        this._timestamp = data.timestamp * 1000;

        /**
         * Holds information about the number of tokens used for this answer, including prompt and completion tokens.
         * It is applicable only to the assistant role ({@link CHAT_MESSAGE_ROLE#ASSISTANT}).
         *
         * @type {TokenUsageInfo}
         */
        this.tokenUsageInfo = data.tokenUsageInfo;
    }

    get id() {
        return this._id;
    }

    set id(value) {
        this._id = value;
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
