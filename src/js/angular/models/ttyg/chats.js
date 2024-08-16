export class ChatModel {
    constructor(data) {
        this._conversationId = data.conversationId;
        this._conversationName = data.conversationName;
        this._timestamp = data.timestamp;
    }

    get conversationId() {
        return this._conversationId;
    }

    set conversationId(value) {
        this._conversationId = value;
    }

    get conversationName() {
        return this._conversationName;
    }

    set conversationName(value) {
        this._conversationName = value;
    }

    get timestamp() {
        return this._timestamp;
    }

    set timestamp(value) {
        this._timestamp = value;
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

    isEmpty() {
        return this._chats.length === 0;
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
