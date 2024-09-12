import {CHAT_MESSAGE_ROLE, ChatMessageModel} from "../../models/ttyg/chat-message";
import {ChatItemModel} from "../../models/ttyg/chat-item";

/**
 * Converts the response from the server to a list of ChatMessageModel array.
 * @param {*[]} data
 * @return {ChatMessageModel[]}
 */
export const chatMessageModelListMapper = (data) => {
    if (!data) {
        return [];
    }
    return data.map((chatMessage) => chatMessageModelMapper(chatMessage));
};

/**
 * Maps a list of chat messages into a list of `ChatItemModel` objects, each containing a question (from the user) and its corresponding answer (from the agent).
 * The backend returns messages as individual strings, and this function converts the messages into objects that hold the question and its answer.
 *
 * @param {Array<Object>} data - An array of message objects where each message contains details like the role (user or assistant) and message content.
 * @return {Array<ChatItemModel>} A list of `ChatItemModel` instances, each containing a question and its corresponding answer.
 *
 * @example
 * // Example message data from the backend
 * const data = [
 *   { role: 'user', conversationId: '123', agentId: 'agent-1', message: 'What is the weather?', timestamp: 1628876583 },
 *   { role: 'assistant', conversationId: '123', agentId: 'agent-1', message: 'The weather is sunny.', timestamp: 1628876590 }
 * ];
 *
 * // Example of returned array
 * const items = [
 * {
 *     chatId: 123,
 *     agentId: 'agent-1',
 *     chatId: '123',
 *     question: {
 *          role: 'user',
 *          message: 'What is the weather?',
 *          timestamp: 1628876583
 *     },
 *     answer: {
 *          role: 'agent',
 *          message: 'The weather is sunny.',
 *          timestamp: 1628876590
 *     }
 * }]
 */
export const chatItemsModelMapper = (data = []) => {
    const items = [];
    let currentItem;
    data.forEach((message) => {
        if (CHAT_MESSAGE_ROLE.USER === message.role) {
            if (currentItem) {
                items.push(currentItem);
            }
            const chatId = message.conversationId;
            const agentId = message.agentId;
            currentItem = new ChatItemModel(chatId, agentId, message);
        } else {
            currentItem.answer = message;
        }
    });
    if (currentItem) {
        items.push(currentItem);
    }
    return items;
};

/**
 * Converts the response from the server to a ChatMessageModel.
 * @param {*} data
 * @return {ChatMessageModel|undefined}
 */
export const chatMessageModelMapper = (data) => {
    if (!data) {
        return;
    }
    return new ChatMessageModel({
        id: data.id,
        role: data.role,
        message: data.message,
        timestamp: data.timestamp,
        data: data
    });
};
