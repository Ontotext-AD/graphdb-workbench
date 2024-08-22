import {ChatsListModel, ChatModel} from "../../models/ttyg/chats";
import {md5HashGenerator} from "../../utils/hash-utils";
import {chatMessageModelListMapper} from "./chat-message.mapper";

/**
 * Converts the response from the server to a list of ChatModels.
 * @param {*[]} data
 * @return {ChatsListModel}
 */
export const chatsListMapper = (data) => {
    if (!data) {
        return new ChatsListModel();
    }
    const chatModels = data.map((chat) => chatModelMapper(chat));
    return new ChatsListModel(chatModels);
};

/**
 * Converts the response from the server to a ChatModel.
 * @param {*} data
 * @return {ChatModel|undefined}
 */
export const chatModelMapper = (data) => {
    if (!data) {
        return;
    }
    const hashGenerator = md5HashGenerator();
    return new ChatModel({
        id: data.id,
        name: data.name,
        timestamp: data.timestamp,
        messages: chatMessageModelListMapper(data.messages)
    }, hashGenerator);
};
