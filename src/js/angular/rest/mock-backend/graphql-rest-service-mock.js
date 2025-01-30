import {cloneDeep} from "lodash";

const GET_ENDPOINTS_DELAY = 200;
const GET_ENDPOINTS_INFO_DELAY = 200;

export class GraphqlRestServiceMock {

    getEndpointsMock(repositoryId) {
        return new Promise((resolve) => {
            setTimeout(() => resolve({data: cloneDeep(endpoints)}), GET_ENDPOINTS_DELAY);
        });
    }

    getEndpointsInfoMock(repositoryId) {
        return new Promise((resolve) => {
            // setTimeout(() => resolve({data: cloneDeep(endpointsInfo)}), GET_ENDPOINTS_INFO_DELAY);
            setTimeout(() => resolve({data: cloneDeep(emptyEndpointsInfo)}), GET_ENDPOINTS_INFO_DELAY);
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
        },
        {
            "id": "swapi-charcters",
            "graphQL": "/rest/repositories/swapi/graphql/swapi-charcters",
            "active": false,
            "default": false
        }
    ]
};

const emptyEndpointsInfo = {
    "endpoints": []
};

const endpointsInfo = {
    "endpoints": [
        {
            "id": "gqlendpoint1",
            "endpointId": "swapi",
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
            "endpointId": "film-restricted",
            "endpointURI": "/rest/repositories/swapi/graphql/film-restricted",
            "label": "SWAPI GraphQL endpoint with restricted film relations",
            "description": "SWAPI GraphQL endpoint with restricted film relations description",
            "default": true,
            "active": true,
            "lastModified": "2025-01-28",
            "objects_count": 13,
            "properties_count": 133,
            "warnings": 0,
            "errors": 0,
            "status": ""
        },
        {
            "id": "gqlendpoint3",
            "endpointId": "swapi-characters",
            "endpointURI": "/rest/repositories/swapi/graphql/swapi-characters",
            "label": "SWAPI GraphQL endpoint for swapi characters",
            "description": "SWAPI GraphQL endpoint for swapi characters description",
            "default": false,
            "active": false,
            "lastModified": "2025-01-28",
            "objects_count": 3,
            "properties_count": 20,
            "warnings": 0,
            "errors": 0,
            "status": ""
        }
    ]
};
