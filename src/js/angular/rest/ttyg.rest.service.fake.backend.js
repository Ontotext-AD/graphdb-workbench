import {cloneDeep} from "lodash";

export class TtygRestServiceFakeBackend {

    constructor() {
        this.conversations = conversations;
    }

    getConversations() {
        return new Promise((resolve) => {
            resolve(cloneDeep(this.conversations));
        });
    }

    getConversation(id) {
        return Promise.resolve(cloneDeep(this.conversations.find((converstation) => converstation.id === id)));
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
        return {
            id: "msg_Bn07kVDCYT1qmgu1G7Zw0KNe",
            conversationId: id,
            agentId: null,
            message: "Answer to " + data.question,
            role: "user",
            timestamp: Date.now()
        };
    }

    deleteConversation(id) {
        this.conversations = this.conversations.filter((conversation) => conversation.id !== id);
        return Promise.resolve();
    }

    createConversation() {
        const conversation = {
            id: `thread_${this.conversations.length}`,
            name: `Thread ${this.conversations.length}`,
            timestamp: Date.now()
        };
        this.conversations.unshift(conversation);
        return Promise.resolve(conversation);
    }
}

const conversations = [
    {
        "id": "thread_jdQBvbkaU6JPoO48oFbC54dA",
        "name": "Test chat Test chat Test chat 1",
        "timestamp": 1697408400,
        "messages": [
            {
                "id": "msg_Bn07kVDCYT1qmgu1G7Zw0KNe",
                "agentId": null,
                "message": "who is taller, luke or his sister?",
                "role": "user"
            },
            {
                "id": "msg_Bn07kVDCYT1qmgu1G7Zw0KNe",
                "agentId": null,
                "message": "Based on the result from the SPARQL query Luke is taller than his sister.",
                "role": "user"
            }
        ]
    },
    {
        "id": "thread_jdQBvbkaU6JPoO48oQaL76dB",
        "name": "Test chat 2",
        "timestamp": 1697428200
    },
    {
        "id": "thread_jdQBvbkaU6JPoO48oQaL76dC",
        "name": "Test chat 3",
        "timestamp": 1697448900
    },
    {
        "id": "thread_jdQBvbkaU6JPoO48oFbC54dD",
        "name": "Test chat 4",
        "timestamp": 1697331600
    },
    {
        "id": "thread_jdQBvbkaU6JPoO48oQaL76dE",
        "name": "Test chat 5",
        "timestamp": 1697252400
    },
    {
        "id": "thread_jdQBvbkaU6JPoO48oQaL76dF",
        "name": "Test chat 6",
        "timestamp": 1697154000
    }, {
        "id": "thread_jdQBvbkaU6JPoO48oFbC54dE",
        "name": "Test chat 7",
        "timestamp": 1697073000
    },
    {
        "id": "thread_jdQBvbkaU6JPoO48oQaL76dG",
        "name": "Test chat 8",
        "timestamp": 1696980300
    },
    {
        "id": "thread_jdQBvbkaU6JPoO48oQaL76dH",
        "name": "Test chat 9",
        "timestamp": 1696899300
    }
];
