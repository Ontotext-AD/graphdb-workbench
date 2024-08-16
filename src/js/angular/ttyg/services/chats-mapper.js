import {ChatsListModel, ChatModel} from "../../models/ttyg/chats";

/**
 * Converts the response from the server to a list of ChatModels.
 * @param {*[]} response
 * @return {ChatsListModel}
 */
export const chatsListMapper = (response) => {
    if (!response) {
        return new ChatsListModel();
    }
    const chatModels = response.map((chat) => {
        return new ChatModel({
            conversationId: chat.conversationId,
            conversationName: chat.conversationName,
            timestamp: chat.timestamp
        });
    });
    return new ChatsListModel(chatModels);
};
