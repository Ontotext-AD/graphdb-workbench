import {chatsListMapper} from "../ttyg/services/chats-mapper";

angular
    .module('graphdb.framework.rest.ttyg.service', [])
    .factory('TTYGRestService', TTYGRestService);

TTYGRestService.$inject = ['$http'];

const CONVERSATIONS_ENDPOINT = 'rest/chat/conversations';

function TTYGRestService($http) {
    return {
        getConversations
    };

    function getConversations(savedQueryName, owner) {
        // return $http.get(CONVERSATIONS_ENDPOINT).then((response) => {
        //     return chatsListMapper(response && response.data);
        // });
        const data = [
            {
                "conversationId": "thread_jdQBvbkaU6JPoO48oFbC54dA",
                "conversationName": "Test chat Test chat Test chat 1",
                "timestamp": 1697408400
            },
            {
                "conversationId": "thread_jdQBvbkaU6JPoO48oQaL76dB",
                "conversationName": "Test chat 2",
                "timestamp": 1697428200
            },
            {
                "conversationId": "thread_jdQBvbkaU6JPoO48oQaL76dC",
                "conversationName": "Test chat 3",
                "timestamp": 1697448900
            },
            {
                "conversationId": "thread_jdQBvbkaU6JPoO48oFbC54dD",
                "conversationName": "Test chat 4",
                "timestamp": 1697331600
            },
            {
                "conversationId": "thread_jdQBvbkaU6JPoO48oQaL76dE",
                "conversationName": "Test chat 5",
                "timestamp": 1697252400
            },
            {
                "conversationId": "thread_jdQBvbkaU6JPoO48oQaL76dF",
                "conversationName": "Test chat 6",
                "timestamp": 1697154000
            }, {
                "conversationId": "thread_jdQBvbkaU6JPoO48oFbC54dE",
                "conversationName": "Test chat 7",
                "timestamp": 1697073000
            },
            {
                "conversationId": "thread_jdQBvbkaU6JPoO48oQaL76dG",
                "conversationName": "Test chat 8",
                "timestamp": 1696980300
            },
            {
                "conversationId": "thread_jdQBvbkaU6JPoO48oQaL76dH",
                "conversationName": "Test chat 9",
                "timestamp": 1696899300
            }
        ];
        const mapped = chatsListMapper(data);
        return new Promise((resolve) => {
            setTimeout(() => resolve(mapped), 100);
        });
    }
}
