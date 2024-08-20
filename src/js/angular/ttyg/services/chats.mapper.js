import {ChatsListModel, ChatModel} from "../../models/ttyg/chats";
import {md5HashGenerator} from "../../utils/hash-utils";
import {chatMessageModelListMapper} from "./chat-message.mapper";

/**
 * Converts the response from the server to a list of ChatModels.
 * @param {*[]} response
 * @return {ChatsListModel}
 */
export const chatsListMapper = (response) => {
    if (!response) {
        return new ChatsListModel();
    }
    const chatModels = response.map((chat) => chatModelMapper(chat));
    return new ChatsListModel(chatModels);
};

/**
 * Converts the response from the server to a ChatModel.
 * @param {*} response
 * @return {ChatModel|undefined}
 */
export const chatModelMapper = (response) => {
    if (!response) {
        return;
    }
    const hashGenerator = md5HashGenerator();
    return new ChatModel({
        id: response.id,
        name: response.name,
        timestamp: response.timestamp,
        messages: chatMessageModelListMapper(response.messages)
    }, hashGenerator);
};
