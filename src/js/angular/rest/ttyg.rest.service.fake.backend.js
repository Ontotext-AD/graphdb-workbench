import {cloneDeep} from "lodash";
import {CHAT_MESSAGE_ROLE} from "../models/ttyg/chat-message";
import {ExtractionMethod} from "../models/ttyg/agents";

// Delay for askQuestion()
const ASK_DELAY = 2000;

// Delay for getConversations()
const LIST_CHATS_DELAY = 2000;

// Delay for getConversation(id)
const GET_CHAT_DELAY = 2000;

const CREATE_AGENT_DELAY = 2000;
const EDIT_AGENT_DELAY = 2000;
const LOAD_AGENTS_DELAY = 2000;

const DELETE_DELAY = 2000;

export class TtygRestServiceFakeBackend {

    constructor() {
        this.conversations = [...conversationList];
    }

    getConversations() {
        return new Promise((resolve) => {
            setTimeout(() => resolve({data: cloneDeep(this.conversations)}), LIST_CHATS_DELAY);
        });
    }

    getConversation(id) {
        return new Promise((resolve) => {
            setTimeout(() => resolve({data: cloneDeep(this.conversations.find((conversation) => conversation.id === id))}),
                GET_CHAT_DELAY);
        });
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
            message: `${askRequestData.question}`,
            role: CHAT_MESSAGE_ROLE.USER,
            timestamp: Math.floor(Date.now() / 1000)
        };

        const conversation = this.conversations.find((conversation) => conversation.id === askRequestData.conversationId);

        const answer = {
            id: askRequestData.conversationId,
            name: conversation ? conversation.name : "Han Solo is a character in the Star Wars...",
            timestamp: Math.floor(Date.now() / 1000),
            messages: [
                {
                    id: "msg_Bn07kVDCYT1qmgu1G7Zw0KNe_" + Date.now(),
                    conversationId: askRequestData.conversationId,
                    role: CHAT_MESSAGE_ROLE.ASSISTANT,
                    agentId: askRequestData.agentId,
                    message: "Certainly! Here's a random example that incorporates code, JSON, and a SPARQL query:\n\n### Code (Python)\n\n```python\ndef greet(name):\n    return f\"Hello, {name}!\"\n\nprint(greet(\"World\"))\n```\n\n### JSON\n\n```json\n{\n    \"greeting\": \"Hello\",\n    \"target\": \"World\",\n    \"language\": \"English\"\n}\n```\n\n### SPARQL Query\n\n```sparql\nSELECT ?person ?name\nWHERE {\n    ?person a ex:Person .\n    ?person ex:hasName ?name .\n}\nLIMIT 10\n```\n\nThis example demonstrates a simple Python function for greeting, a JSON object representing a greeting structure, and a SPARQL query to retrieve names of persons from a dataset.",
                    timestamp: Math.floor(Date.now() / 1000),
                    name: null
                },
                {
                    id: "msg_Bn07kVDCYT1qmgu1G7Zw0KNeс_" + Date.now(),
                    conversationId: askRequestData.conversationId,
                    role: CHAT_MESSAGE_ROLE.ASSISTANT,
                    agentId: askRequestData.agentId,
                    message: `Reply to '${askRequestData.question}' It seems there was an error with the query. Let me rectify this and try again.`,
                    timestamp: Math.floor(Date.now() / 1000),
                    name: null
                }
            ]
        };

        if (conversation) {
            conversation.messages.push(...answer.messages);
            conversation.messages.push(question);
        }
        return new Promise((resolve) => setTimeout(() => resolve({data: answer}), ASK_DELAY));
        // return new Promise((resolve, reject) => setTimeout(() => reject(''), ASK_DELAY));
    }

    deleteConversation(id) {
        this.conversations = this.conversations.filter((conversation) => conversation.id !== id);
        return new Promise((resolve) => setTimeout(() => resolve(), DELETE_DELAY));
    }

    createConversation(data) {
        const conversation = {
            id: `thread_${this.conversations.length}`,
            name: `Thread ${this.conversations.length}`,
            timestamp: Math.floor(Date.now() / 1000),
            messages: []
        };
        this.conversations.unshift(conversation);

        const askRequestData = cloneDeep(data);
        askRequestData.conversationId = conversation.id;
        return this.askQuestion(askRequestData);
    }

    getAgents() {
        return new Promise((resolve) => setTimeout(() => resolve({data: [...agentsList]}), LOAD_AGENTS_DELAY));
    }

    getAgent(id) {
        return Promise.resolve({data: cloneDeep(agentsList.find((agent) => agent.id === id))});
    }

    createAgent(agent) {
        if (agent.name === 'err') {
            return new Promise((resolve, reject) => setTimeout(() => reject({status: 500, message: 'Internal Server Error'}), CREATE_AGENT_DELAY));
        }
        agentsList.push(agent);
        return new Promise((resolve) => setTimeout(() => resolve({data: agent}), CREATE_AGENT_DELAY));
    }

    editAgent(editedAgent) {
        if (editedAgent.name === 'err') {
            return new Promise((resolve, reject) => setTimeout(() => reject({status: 500, message: 'Internal Server Error'}), EDIT_AGENT_DELAY));
        }
        agentsList = agentsList.map((agent) => agent.id === editedAgent.id ? editedAgent : agent);
        return new Promise((resolve) => setTimeout(() => resolve({data: editedAgent}), CREATE_AGENT_DELAY));
    }

    deleteAgent(id) {
        agentsList = agentsList.filter((agent) => agent.id !== id);
        return Promise.resolve();
        // return new Promise((resolve) => {
        //     setTimeout(() => resolve(), 5000);
        // });
    }

    getAgentDefaultValues() {
        return Promise.resolve({data: defaultAgentValues});
    }

    // Simulate an HTTP error
    simulateHttpError() {
        return Promise.reject({
            status: 500,
            message: 'Internal Server Error'
        });
    }

    explainResponse(data) {
        return Promise.resolve({data: {
                conversationId: data.conversationId,
                answerId: data.answerId,
                queryMethods: [
                    {
                        name: "sparql_query",
                        rawQuery: "SELECT ?character ?name ?height WHERE {\n  ?character a voc:Character;\n             rdfs:label ?name;\n             voc:height ?height.\n  FILTER(?name = \"Luke Skywalker\" || ?name = \"Leia Organa\")\n}",
                        query: "SELECT ?character ?name ?height WHERE {\n  ?character a voc:Character;\n             rdfs:label ?name;\n             voc:height ?height.\n  FILTER(?name = \"Luke Skywalker\" || ?name = \"Leia Organa\")\n}",
                        queryType: "sparql",
                        errorOutput: "Error: org.eclipse.rdf4j.query.MalformedQueryException: org.eclipse.rdf4j.query.parser.sparql.ast.VisitorException: QName 'voc:Character' uses an undefined prefix"
                    }, {
                        name: "retrieval_search",
                        rawQuery: "{\"queries\":[{\"query\":\"pilots that work with Luke Skywalker\",\"filter\":{\"document_id\":\"https://swapi.co/resource/human/1\"},\"top_k\":3}]}",
                        query: "{\n  \"queries\" : [ {\n    \"query\" : \"pilots that work with Luke Skywalker\",\n    \"filter\" : {\n      \"document_id\" : \"https://swapi.co/resource/human/1\"\n    },\n    \"top_k\" : 3\n  } ]\n}",
                        queryType: "json",
                        errorOutput: null
                    },
                    {
                        name: "iri_discovery",
                        rawQuery: "Luke Skywalker",
                        query: "PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>\nPREFIX skos: <http://www.w3.org/2004/02/skos/core#>\nPREFIX onto: <http://www.ontotext.com/>\nSELECT ?label ?iri {\n    ?label onto:fts ('''Luke~ Skywalker~''' '*') .\n    ?iri rdfs:label|skos:prefLabel ?label .\n}",
                        queryType: "sparql",
                        errorOutput: null
                    },
                    {
                        name: "sparql_query",
                        rawQuery: "SELECT ?height WHERE {\n  <https://swapi.co/resource/human/1> voc:height ?height.\n}",
                        query: "SELECT ?height WHERE {\n  <https://swapi.co/resource/human/1> voc:height ?height.\n}",
                        queryType: "sparql",
                        errorOutput: "Error: org.eclipse.rdf4j.query.MalformedQueryException: org.eclipse.rdf4j.query.parser.sparql.ast.VisitorException: QName 'voc:height' uses an undefined prefix"
                    },
                    {
                        name: "sparql_query",
                        rawQuery: "PREFIX voc: <https://swapi.co/vocabulary/>\nSELECT ?name ?height WHERE {\n  ?character voc:height ?height;\n             rdfs:label ?name.\n  FILTER(?name = \"Luke Skywalker\" || ?name = \"Leia Organa\")\n}",
                        query: "PREFIX voc: <https://swapi.co/vocabulary/>\nSELECT ?name ?height WHERE {\n  ?character voc:height ?height;\n             rdfs:label ?name.\n  FILTER(?name = \"Luke Skywalker\" || ?name = \"Leia Organa\")\n}",
                        queryType: "sparql",
                        errorOutput: null
                    },
                    {
                        name: 'fts_search',
                        rawQuery: 'Second Luke',
                        query: 'PREFIX onto: <http://www.ontotext.com/>\nDESCRIBE ?iri {\n\t?x onto:fts \'\'\'Second Luke\'\'\' .\n\t{\n\t\t?x ?p ?iri .\n\t} union {\n\t\t?iri ?p ?x .\n\t}\n}',
                        queryType: "sparql",
                        errorOutput: null
                    }, {
                        name: 'similarity_search',
                        rawQuery: 'Second Luke',
                        query: 'PREFIX onto: <http://www.ontotext.com/>\nDESCRIBE ?iri {\n\t?x onto:fts \'\'\'Second Luke\'\'\' .\n\t{\n\t\t?x ?p ?iri .\n\t} union {\n\t\t?iri ?p ?x .\n\t}\n}',
                        queryType: "sparql",
                        errorOutput: null
                    }, {
                        name: "iri_discovery",
                        rawQuery: "Luke Skywalker",
                        query: "PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>\nPREFIX skos: <http://www.w3.org/2004/02/skos/core#>\nPREFIX onto: <http://www.ontotext.com/>\nSELECT ?label ?iri {\n    ?label onto:fts ('''Luke~ Skywalker~''' '*') .\n    ?iri rdfs:label|skos:prefLabel ?label .\n}",
                        queryType: "sparql",
                        errorOutput: null
                    }
                ]
            }});
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

let agentsList = [
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

const defaultAgentValues = {
    "id": "id",
    "name": "Quadro",
    "model": "gpt-4o",
    "temperature": 0.7,
    "topP": 1,
    "seed": 0,
    "repositoryId": "test-repository",
    "instructions": {
        "systemInstruction": "You are a helpful, knowledgeable, and friendly assistant. Your goal is to provide clear and accurate information while being polite, respectful, and professional.",
        "userInstruction": "If you need to write a SPARQL query, use only the classes and properties provided in the schema and don't invent or guess any. Always try to return human-readable names or labels and not only the IRIs. If SPARQL fails to provide the necessary information you can try another tool too."
    },
    "assistantExtractionMethods": [
        {
            "method": "sparql_search",
            "ontologyGraph": "http://example.com",
            "sparqlQuery": "CONSTRUCT {?s ?p ?o} WHERE {GRAPH <http://example.org/ontology> {?s ?p ?o .}}"
        },
        {
            "method": "fts_search",
            "maxNumberOfTriplesPerCall": 0
        },
        {
            "method": "similarity_search",
            "similarityIndex": "similarity-index",
            "similarityIndexThreshold": 0.6,
            "maxNumberOfTriplesPerCall": 0
        },
        {
            "method": "retrieval_search",
            "retrievalConnectorInstance": "retrieval-connector",
            "queryTemplate": "{\"query\": \"string\"}",
            "maxNumberOfTriplesPerCall": 0
        }
    ],
    "additionalExtractionMethods": [
        {
            "method": "iri_discovery_search"
        }
    ]
};
