import {cloneDeep} from "lodash";
import {CHAT_MESSAGE_ROLE} from "../models/ttyg/chat-message";

export class TtygRestServiceFakeBackend {

    constructor() {
        this.conversations = [...conversationList];
    }

    getConversations() {
        return new Promise((resolve) => {
            resolve({data: cloneDeep(this.conversations)});
        });
    }

    getConversation(id) {
        return Promise.resolve({data: cloneDeep(this.conversations.find((conversation) => conversation.id === id))});
    }

    renameConversation(id, data) {
        const conversation = this.conversations.find((conversation) => conversation.id === id);
        if (conversation) {
            conversation.name = data.name;
        }
        return Promise.resolve({data: cloneDeep(conversation)});
    }

    exportConversation(id) {
        console.log("Exporting conversation with id: ", id);
        return Promise.resolve();
    }

    askQuestion(askRequestData) {
        const question = {
            id: "msg_Bn07kVDCYT1qmgu1G7Zw0KNe",
            conversationId: askRequestData.conversationId,
            agentId: null,
            message: `Reply to '${askRequestData.question}'`,
            role: CHAT_MESSAGE_ROLE.USER,
            timestamp: Date.now()
        };
        const answer = {
            id: "msg_Bn07kVDCYT1qmgu1G7Zw0KNe",
            conversationId: askRequestData.conversationId,
            agentId: null,
            message: `Reply to '${askRequestData.question}'`,
            role: CHAT_MESSAGE_ROLE.ASSISTANT,
            timestamp: Date.now()
        };
        const conversation = this.conversations.find((conversation) => conversation.id === askRequestData.conversationId);
        if (conversation) {
            conversation.messages.push(answer);
            conversation.messages.push(question);
        }
        return Promise.resolve({data: answer});
    }

    deleteConversation(id) {
        this.conversations = this.conversations.filter((conversation) => conversation.id !== id);
        return Promise.resolve();
    }

    createConversation(data) {
        const conversation = {
            id: `thread_${this.conversations.length}`,
            name: `Thread ${this.conversations.length}`,
            timestamp: Date.now(),
            messages: []
        };
        this.conversations.unshift(conversation);

        const askRequestData = cloneDeep(data);
        askRequestData.conversationId = conversation.id;
        return this.askQuestion(askRequestData)
            .then(() => {
                return {
                    data: {
                        id: "msg_Bn07kVDCYT1qmgu1G7Zw0KNe",
                        conversationId: conversation.id,
                        agentId: data.agentId
                    }
                };
            });
    }

    getAgents() {
        return Promise.resolve({data: [...agentsList]});
    }

    // Simulate an HTTP error
    simulateHttpError() {
        return Promise.reject({
            status: 500,
            message: 'Internal Server Error'
        });
    }
}

const conversationList = [
    {
        "id": "thread_jdQBvbkaU6JPoO48oFbC54dA",
        "name": "Very long chat name which does not fit in the sidebar",
        "timestamp": 1725235200,
        "messages": []
    },
    {
        "id": "thread_jdQBvbkaU6JPoO48oQaL76dB",
        "name": "Test chat 2",
        "timestamp": 1725238800,
        "messages": []
    },
    {
        "id": "thread_jdQBvbkaU6JPoO48oQaL76dC",
        "name": "Test chat 3",
        "timestamp": 1725242400,
        "messages": []
    },
    {
        "id": "thread_jdQBvbkaU6JPoO48oFbC54dD",
        "name": "Test chat 4",
        "timestamp": 1697331600,
        "messages": []
    }
];

const agentsList = [
    {
        "id": "asst_gAPcrHQQ9ZIxD5eXWH2BNFfo",
        "name": "agent-1",
        "model": "gpt-4o",
        "temperature": 0.0,
        "topP": 0.0,
        "seed": null,
        "repositoryId": 'starwars',
        "instructions": {
            "systemInstruction": "\n\n",
            "userInstruction": ""
        },
        "assistantExtractionMethods": [
            {
                "ftsMethod": "fts_search"
            }
        ],
        "maxNumberOfTriplesPerCall": null
    },
    {
        "id": "asst_qMyCpCBmqxV9I2B8UoMfFzc5",
        "name": "agent-2",
        "model": "gpt-4o",
        "temperature": 0.0,
        "topP": 0.0,
        "seed": null,
        "repositoryId": null,
        "instructions": {
            "systemInstruction": "string\n\nstring",
            "userInstruction": "string"
        },
        "assistantExtractionMethods": [
            {
                "ftsMethod": "fts_search"
            }
        ],
        "maxNumberOfTriplesPerCall": null
    },
    {
        "id": "asst_Cr0RxobrY07WpOvvyQilEWMI",
        "name": "Databricks-general-unbiased",
        "model": "gpt-4o-2024-08-06",
        "temperature": 1.0,
        "topP": 1.0,
        "seed": null,
        "repositoryId": 'starwars',
        "instructions": {
            "systemInstruction": "You are helpful assistant in discovering information regarding diagnostic biomarkers.",
            "userInstruction": null
        },
        "assistantExtractionMethods": [],
        "maxNumberOfTriplesPerCall": null
    },
    {
        "id": "asst_5GxNYTdaOh7Tl6lLl6Pya2aH",
        "name": "Databricks-biomarkers",
        "model": "gpt-3.5-turbo-0125",
        "temperature": 1.0,
        "topP": 1.0,
        "seed": null,
        "repositoryId": 'biomarkers',
        "instructions": {
            "systemInstruction": "You're a helpful assistant in discovering new diagnostic biomarkers for given diseases. I'll submit a set of publication abstracts discussing given disease and your task is to find in the abstracts any potential new biomarkers which are not yet listed in the appropriate databases. Each abstract is preceded by identifier - its PubMed id called for short PMID. \n\nReturn the set of biomarkers listed one per row, each marker followed by the | and PMID of the respective abstract if was mentioned in.\n\nExample: \nInput: 36418457\t[Amyotrophic lateral sclerosis (ALS) is a genetically and phenotypically heterogeneous disease results in the loss of motor neurons. Mounting information points to involvement of other systems including cognitive impairment. However, neither the valid biomarker for diagnosis nor effective therapeutic intervention is available for ALS. The present study is aimed at identifying potentially genetic biomarker that improves the diagnosis and treatment of ALS patients based on the data of the Gene Expression Omnibus. We retrieved datasets and conducted a weighted gene co-expression network analysis (WGCNA) to identify ALS-related co-expression genes. Functional enrichment analysis was performed to determine the features and pathways of the main modules. We then constructed an ALS-related model using the least absolute shrinkage and selection operator (LASSO) regression analysis and verified the model by the receiver operating characteristic (ROC) curve. Besides we screened the non-preserved gene modules in FTD and ALS-mimic disorders to distinct ALS-related genes from disorders with overlapping genes and features. Altogether, 4198 common genes between datasets with the most variation were analyzed and 16 distinct modules were identified through WGCNA. Blue module had the most correlation with ALS and functionally enriched in pathways of neurodegeneration-multiple diseases', 'amyotrophic lateral sclerosis', and 'endocytosis' KEGG terms. Further, some of other modules related to ALS were enriched in 'autophagy' and 'amyotrophic lateral sclerosis'. The 30 top of hub genes were recruited to a LASSO regression model and 5 genes (BCLAF1, GNA13, ARL6IP5, ARGLU1, and YPEL5) were identified as potentially diagnostic ALS biomarkers with validating of the ROC curve and AUC value.]\n\nYour response: BCLAF1|36418457\nGNA13|36418457\nARL6IP5|36418457\nARGLU1|36418457\nYPEL5|36418457",
            "userInstruction": null
        },
        "assistantExtractionMethods": [],
        "maxNumberOfTriplesPerCall": null
    }
];
