export class ChatAnswerModel {
    constructor(data = {}) {
        /**
         * @type {string | undefined}
         */
        this._chatId = data.chatId;

        /**
         * @type {string}
         */
        this._chatName = data.chatName || '';

        /**
         * @type {number}
         */
        this._timestamp = data.timestamp;

        /**
         * @type {ChatMessageModel[]}
         */
        this._messages = data.messages || [];
    }

    get chatId() {
        return this._chatId;
    }

    set chatId(value) {
        this._chatId = value;
    }

    get chatName() {
        return this._chatName;
    }

    set chatName(value) {
        this._chatName = value;
    }

    get timestamp() {
        return this._timestamp;
    }

    set timestamp(value) {
        this._timestamp = value;
    }

    get messages() {
        return this._messages;
    }

    set messages(value) {
        this._messages = value;
    }
}
