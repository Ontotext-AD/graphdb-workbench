import {CHAT_MESSAGE_ROLE, ChatMessageModel} from "./chat-message";

/**
 *
 * Represents a model that holds a question and the answer of it in a chat.
 *
 */
export class ChatItemModel {

    /**
     * Creates an instance of ChatItemModel.
     *
     * @param {string} chatId - The unique identifier for the chat associated with this instance.
     * @param {string} [agentId=AGENT_ID] - The ID of the agent used to answer the question.
     * @param {ChatMessageModel} question - The message object representing the question.
     * @param {ChatMessageModel} answer - The message object representing the answer to the question. It is undefined if there is no answer.
     */
    // TODO remove hardcoded agent id when agent functionality is ready
    constructor(chatId, agentId, question, answer) {
        this._chatId = chatId;
        this._agentId = agentId;
        this._question = question;
        this._answer = answer;
    }

    get chatId() {
        return this._chatId;
    }

    set chatId(value) {
        this._chatId = value;
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

    get answer() {
        return this._answer;
    }

    set answer(value) {
        this._answer = value;
    }

    /**
     * Sets the message for the user's question.
     *
     * @param {string} message - The message content for the user's question.
     */
    setQuestionMessage(message) {
        if (!this._question) {
            this._question = new ChatMessageModel({role: CHAT_MESSAGE_ROLE.USER});
        }
        this._question.message = message;
    }

    /**
     * Retrieves the message of the user's question.
     *
     * @return {string} - The message content of the user's question.
     */
    getQuestionMessage() {
        return this._question.message;
    }

    /**
     * Converts the instance to a create chat request payload.
     *
     * @return {{agentId: string, question: string}} An object representing the create request payload.
     */
    toCreateChatRequestPayload() {
        return {
            agentId: this._agentId,
            question: this._question.message
        };
    }

    /**
     * Converts the instance to an ask request payload.
     *
     * @return {{conversationId: string, agentId: string, question: string}} An object representing the ask request payload.
     */
    toAskRequestPayload() {
        return {
            conversationId: this._chatId,
            agentId: this._agentId,
            question: this._question.message
        };
    }

    toExplainResponsePayload() {
        return {
            conversationId: this._chatId,
            answerId: this.answer.id
        };
    }
}

export class ChatItemsListModel {

    /**
     * @param {ChatItemModel[]} items
     */
    constructor(items = []) {
        this._items = items;
    }

    isEmpty() {
        return this._items.length === 0;
    }

    /**
     * @param {ChatItemModel} chatItem
     */
    appendItem(chatItem) {
        this._items.push(chatItem);
    }

    get items() {
        return this._items;
    }

    set items(value) {
        this._items = value || [];
    }
}
