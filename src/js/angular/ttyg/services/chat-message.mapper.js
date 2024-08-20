import {ChatMessageModel} from "../../models/ttyg/chat-message.model";

/**
 * Converts the response from the server to a list of ChatMessageModel array.
 * @param {*[]} response
 * @return {ChatMessageModel[]}
 */
export const chatMessageModelListMapper = (response) => {
    if (!response) {
        return [];
    }
    return response.map((chatMessage) => chatMessageModelMapper(chatMessage));
};

/**
 * Converts the response from the server to a ChatMessageModel.
 * @param {*} response
 * @return {ChatMessageModel|undefined}
 */
export const chatMessageModelMapper = (response) => {
    if (!response) {
        return;
    }
    return new ChatMessageModel({
        id: response.id,
        conversationId: response.conversationId,
        agentId: response.agent,
        role: response.role,
        message: response.message,
        timestamp: response.timestamp,
        data: response
    });
};
