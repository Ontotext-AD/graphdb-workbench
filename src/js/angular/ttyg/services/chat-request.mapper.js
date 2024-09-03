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
 * @param {ChatQuestion} chatQuestion
 * @return {
 *      {
 *          agentId: string,
 *      question: string
 *      }
 * }
 */
export const askQuestionChatRequestMapper = (chatQuestion) => {
    return {
        agentId: chatQuestion.agentId,
        question: chatQuestion.question,
        conversationId: chatQuestion.conversationId
    };
};
