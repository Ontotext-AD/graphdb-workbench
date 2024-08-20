/**
 * Converts a chat to a rename chat request.
 * @param {ChatModel} chat -
 * @return {
 *      {
 *          name: string
 *      }
 * }
 */
export const renameChatRequestMapper = (chat) => {
    return {
        name: chat.name
    };
};

/**
 * Converts a message to an ask question request.
 * @param {ChatMessageModel} chatMessage
 * @return {
 *      {
 *          agentId: string,
 *      question: string
 *      }
 * }
 */
export const askQuestionChatRequestMapper = (chatMessage) => {
    return {
        agentId: chatMessage.agentId,
        question: chatMessage.question
    };
};
