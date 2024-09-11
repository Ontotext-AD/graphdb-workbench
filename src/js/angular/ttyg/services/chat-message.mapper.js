import {ChatMessageModel} from "../../models/ttyg/chat-message";

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
        conversationId: data.conversationId,
        agentId: data.agent,
        role: data.role,
        message: data.message,
        timestamp: data.timestamp,
        data: data
    });
};

/**
 *
 * @param {ChatQuestion} chatQuestion
 * @return {ChatMessageModel}
 */
export const chatQuestionToChatMessageMapper = (chatQuestion) => {
    if (!chatQuestion) {
        return;
    }

    const message = new ChatMessageModel(chatQuestion);
    message.message = chatQuestion.question;
    return message;
};
