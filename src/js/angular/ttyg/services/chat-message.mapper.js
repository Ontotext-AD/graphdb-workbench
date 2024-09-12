import {CHAT_MESSAGE_ROLE, ChatMessageModel} from "../../models/ttyg/chat-message";
import {ChatItemModel, ChatItemsListModel} from "../../models/ttyg/chat-item";

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
 * Maps a list of chat messages into an instance of {@see ChatItemsListModel}, which contains a list of `ChatItemModel` objects. Each object represents a question (from the user) and its corresponding answer (from the agent).
 * The backend returns messages as individual entries, and this function transforms those entries into objects that pair each question with its answer.
 *
 * @param {Array<Object>} data - An array of message objects, where each message contains details such as the role (user or assistant) and the message content.
 * @return {ChatItemsListModel} An instance of `ChatItemsListModel` containing a list of `ChatItemModel` objects, where each object holds a question and its corresponding answer.
 *
 * @example
 * // Example message data from the backend
 * const data = [
 *   { role: 'user', conversationId: '123', agentId: 'agent-1', message: 'What is the weather?', timestamp: 1628876583 },
 *   { role: 'assistant', conversationId: '123', agentId: 'agent-1', message: 'The weather is sunny.', timestamp: 1628876590 }
 * ];
 *
 * // Example of the resulting ChatItemsListModel array
 * const items = [
 * {
 *     conversationId: '123',
 *     agentId: 'agent-1',
 *     question: {
 *         role: 'user',
 *         message: 'What is the weather?',
 *         timestamp: 1628876583
 *     },
 *     answer: {
 *         role: 'assistant',
 *         message: 'The weather is sunny.',
 *         timestamp: 1628876590
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
    return new ChatItemsListModel(items);
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
