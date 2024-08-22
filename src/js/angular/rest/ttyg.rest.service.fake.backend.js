import {cloneDeep} from "lodash";

export class TtygRestServiceFakeBackend {

    constructor() {
        this.conversations = [];
    }

    getConversations() {
        return new Promise((resolve) => {
            resolve(cloneDeep(this.conversations));
        });
    }

    getConversation(id) {
        return Promise.resolve(cloneDeep(this.conversations.find((conversation) => conversation.id === id)));
    }

    renameConversation(id, data) {
        const conversation = this.conversations.find((conversation) => conversation.id === id);
        if (conversation) {
            conversation.name = data.name;
        }
        return Promise.resolve(cloneDeep(conversation));
    }

    exportConversation(id) {
        console.log("Exporting conversation with id: ", id);
        return Promise.resolve();
    }

    askQuestion(id, data) {
        let answer = {
            id: "msg_Bn07kVDCYT1qmgu1G7Zw0KNe",
            conversationId: id,
            agentId: null,
            message: `Reply to '${data.question}'`,
            role: "user",
            timestamp: Date.now()
        };
        const conversation = this.conversations.find((conversation) => conversation.id === id);
        if (conversation) {
            conversation.messages.push(answer);
        }
        return Promise.resolve(answer);
    }

    deleteConversation(id) {
        this.conversations = this.conversations.filter((conversation) => conversation.id !== id);
        return Promise.resolve();
    }

    createConversation() {
        const conversation = {
            id: `thread_${this.conversations.length}`,
            name: `Thread ${this.conversations.length}`,
            timestamp: Date.now(),
            messages: []
        };
        this.conversations.unshift(conversation);
        return Promise.resolve(conversation);
    }
}
