import {cloneDeep} from "lodash";

const GET_ENDPOINTS_DELAY = 100;
const GET_ENDPOINTS_INFO_DELAY = 100;

export class GraphqlRestServiceMock {

    getEndpointsMock(repositoryId) {
        return new Promise((resolve) => {
            setTimeout(() => resolve({data: cloneDeep(endpoints)}), GET_ENDPOINTS_DELAY);
        });
    }

    getEndpointsInfoMock(repositoryId) {
        return new Promise((resolve) => {
            setTimeout(() => resolve({data: cloneDeep(endpointsInfo)}), GET_ENDPOINTS_INFO_DELAY);
        });
    }
}

const endpoints = {
    "repository": "swapi",
    "endpoints": [
        {
            "id": "swapi",
            "graphQL": "/rest/repositories/swapi/graphql/swapi",
            "active": true,
            "default": true
        },
        {
            "id": "film-restricted",
            "graphQL": "/rest/repositories/swapi/graphql/film-restricted",
            "active": true,
            "default": false
        }
    ]
};

const endpointsInfo = {
    "endpoints": [
        {
            "id": "gqlendpoint1",
            "endpointId": "/swapi",
            "endpointURI": "/rest/repositories/swapi/graphql/swapi",
            "label": "SWAPI GraphQL endpoint",
            "description": "SWAPI GraphQL endpoint description",
            "default": false,
            "active": true,
            "lastModified": "2025-01-28",
            "objects_count": 10,
            "properties_count": 120,
            "warnings": 0,
            "errors": 0,
            "status": ""
        },
        {
            "id": "gqlendpoint2",
            "endpointId": "/film-restricted",
            "endpointURI": "/rest/repositories/swapi/graphql/film-restricted",
            "label": "SWAPI GraphQL endpoint with restricted film relations",
            "description": "SWAPI GraphQL endpoint description",
            "default": true,
            "active": false,
            "lastModified": "2025-01-28",
            "objects_count": 13,
            "properties_count": 133,
            "warnings": 0,
            "errors": 0,
            "status": ""
        },
        {
            "id": "gqlendpoint3",
            "endpointId": "/swapi-charcters",
            "endpointURI": "/rest/repositories/swapi/graphql/swapi-charcters",
            "label": "SWAPI GraphQL endpoint for swapi charcters",
            "description": "SWAPI GraphQL endpoint description",
            "default": false,
            "active": true,
            "lastModified": "2025-01-28",
            "objects_count": 3,
            "properties_count": 20,
            "warnings": 0,
            "errors": 0,
            "status": ""
        }
    ]
};
