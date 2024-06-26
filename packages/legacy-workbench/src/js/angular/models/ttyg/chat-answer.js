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

        /**
         * @type {string}
         */
        this._continueRunId = data.continueRunId;
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

    get continueRunId() {
        return this._continueRunId;
    }

    set continueRunId(value) {
        this._continueRunId = value;
    }
}

/**
 * Represents information on continuing the chat run, i.e., fetching answers iteratively after
 * asking until the last answer is received.
 */
export class ContinueChatRun {
    constructor(chatItem, runId) {
        this._chatItem = chatItem;
        this._runId = runId;
    }

    get chatId() {
        return this._chatItem.chatId;
    }

    toContinueRunRequestPayload() {
        return {
            conversationId: this.chatId,
            runId: this._runId,
            agentId: this._chatItem.agentId,
            tzOffset: -new Date().getTimezoneOffset() // offsets are reversed here hence the minus
        };
    }
}
