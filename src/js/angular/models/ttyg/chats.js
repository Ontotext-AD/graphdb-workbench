import {ChatItemsListModel} from "./chat-item";

export class ChatModel {
    constructor(data, hashGenerator) {
        this.hashGenerator = hashGenerator;

        /**
         * @type {string}
         */
        this._id = data.id;

        /**
         * @type {string}
         */
        this._name = data.name;

        /**
         * @type {number}
         */
        this._timestamp = data.timestamp;

        /**
         * @type {ChatItemsListModel}
         */
        this._chatHistory = data.chatHistory || new ChatItemsListModel();
        this.hash = this.generateHash();
    }

    generateHash() {
        return this.hashGenerator(JSON.stringify(this));
    }

    get id() {
        return this._id;
    }

    set id(value) {
        this._id = value;
    }

    get name() {
        return this._name;
    }

    set name(value) {
        this.generateHash();
        this._name = value;
    }

    get timestamp() {
        return this._timestamp;
    }

    set timestamp(value) {
        this._timestamp = value;
    }

    get chatHistory() {
        return this._chatHistory;
    }

    set chatHistory(value) {
        this._chatHistory = value || new ChatItemsListModel();
    }

    /**
     * Converts the instance to a rename chat request payload.
     * This request object contains the new name for renaming the chat.
     *
     * @return {{name: string}} An object representing the rename request payload.
     */
    toRenameRequestPayload() {
        return {name: this._name};
    }
}

export class ChatByDayModel {
    constructor(data) {
        this._day = data.day;
        /**
         * @type {number}
         * @private
         */
        this._timestamp = data.timestamp;
        /**
         * @type {ChatModel[]|*}
         * @private
         */
        this._chats = data.chats;
    }

    get day() {
        return this._day;
    }

    set day(value) {
        this._day = value;
    }

    get timestamp() {
        return this._timestamp;
    }

    set timestamp(value) {
        this._timestamp = value;
    }

    get chats() {
        return this._chats;
    }

    set chats(value) {
        this._chats = value;
    }
}

export class ChatsListModel {
    constructor(chats) {
        /**
         * @type {ChatModel[]}
         * @private
         */
        this._chats = chats || [];
        /**
         * @type {ChatByDayModel[]}
         * @private
         */
        this._chatsByDay = [];
        this.sortByTime();
        this.updateChatsByDay();
    }

    /**
     * Sorts the list of chats by timestamp in descending order, with the newest items on top.
     */
    sortByTime() {
        this._chats.sort((a, b) => {
            return b.timestamp - a.timestamp;
        });
    }

    deleteChat(chatToBeDeleted) {
        this._chats = this._chats.filter((chat) => chat.id !== chatToBeDeleted.id);
        this.sortByTime();
        this.updateChatsByDay();
    }

    updateChatsByDay() {
        this._chatsByDay = [];
        // group chats by day
        this._chats.forEach((chat) => {
            const day = new Date(chat.timestamp * 1000).toDateString();
            const dayModel = this._chatsByDay.find((d) => d.day === day);
            if (dayModel) {
                dayModel.chats.push(chat);
            } else {
                this._chatsByDay.push(new ChatByDayModel({day: day, timestamp: chat.timestamp * 1000, chats: [chat]}));
            }
        });
    }

    appendChat(chat) {
        this._chats.push(chat);
        this.sortByTime();
        this.updateChatsByDay();
    }

    replaceChat(newChat, oldChat) {
        this._chats = this._chats.map((chat) => {
            if (chat.id === oldChat.id) {
                return newChat;
            }
            return chat;
        });
        this.sortByTime();
        this.updateChatsByDay();
    }

    /**
     * Checks if the chat list is empty.
     * @return {boolean}
     */
    isEmpty() {
        return this._chats.length === 0;
    }

    /**
     * Returns the first chat from the list.
     * @return {ChatModel|undefined}
     */
    getFirstChat() {
        return this._chats[0];
    }

    /**
     * Deselects all chats.
     */
    deselectAll() {
        this._chats.forEach((c) => {
            c.selected = false;
        });
    }

    /**
     * Selects a chat.
     * @param {ChatModel} chat
     */
    selectChat(chat) {
        this.deselectAll();
        this._chats.forEach((c) => {
            c.selected = c.id === chat.id;
        });
    }

    getChat(id) {
        return this._chats.find((c) => c.id === id);
    }

    getNonPersistedChat() {
        return this._chats.find((chat) => !chat.id);
    }

    renameChat(renamedChat) {
        const chat = this._chats.find((c) => c.id === renamedChat.id);
        if (chat) {
            chat.name = renamedChat.name;
        }
    }

    /**
     * @return {ChatModel[]}
     */
    get chats() {
        return this._chats;
    }

    /**
     * @param {ChatModel[]} value
     */
    set chats(value) {
        this._chats = value;
    }

    get chatsByDay() {
        return this._chatsByDay;
    }

    set chatsByDay(value) {
        this._chatsByDay = value;
    }
}
