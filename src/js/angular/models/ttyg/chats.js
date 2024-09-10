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
         * @type {string}
         */
        this._messages = data.messages;
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

    get messages() {
        return this._messages;
    }

    set messages(value) {
        this._messages = value;
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
