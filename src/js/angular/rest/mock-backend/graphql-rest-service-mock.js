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
            setTimeout(() => resolve({data: cloneDeep(endpointsInfo)}), GET_ENDPOINTS_INFO_DELAY);
            // setTimeout(() => resolve({data: cloneDeep(emptyEndpointsInfo)}), GET_ENDPOINTS_INFO_DELAY);
        });
    }

    getGraphqlSchemaShapesMock(repositoryId) {
        return new Promise((resolve) => {
            setTimeout(() => resolve({data: cloneDeep(graphqlSchemaShapes)}), GET_ENDPOINTS_INFO_DELAY);
        });
    }

    getEndpointConfigurationMock() {
        return new Promise((resolve) => {
            setTimeout(() => resolve({data: cloneDeep(endpointConfiguration)}), GET_ENDPOINTS_INFO_DELAY);
        });
    }

    saveEndpointConfigurationMock() {
        return new Promise((resolve) => {
            setTimeout(() => resolve({data: {"message": "Data saved successfully."}}), GET_ENDPOINTS_INFO_DELAY);
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

const graphqlSchemaShapes = {
    "shapes": [
        {
            "id": "https://schema.ubs.net/schema/AIModelSchema",
            "name": "AI Model Schema",
            "label": "AI Model Schema",
            "description": null
        },
        {
            "id": "https://schema.ubs.net/schema/AIProductSchema",
            "name": "AI Product Schema",
            "label": "AI Product Schema",
            "description": null
        },
        {
            "id": "https://schema.ubs.net/schema/DatabaseSchema",
            "name": null,
            "label": "Database Schema",
            "description": null
        },
        {
            "id": "https://schema.ubs.net/schema/BbsPermissionSchema",
            "name": null,
            "label": "BBS Permissions",
            "description": null
        },
        {
            "id": "https://schema.ubs.net/schema/DataProductBasicSchema",
            "name": null,
            "label": "Data Product Basic Schema No Policy and No Provenance",
            "description": null
        },
        {
            "id": "https://schema.ubs.net/schema/DataQualityMetricSchema",
            "name": null,
            "label": "Data Quality Metric Schema",
            "description": "This is the basic schema for DQV initiated from Metric class"
        },
        {
            "id": "https://schema.ubs.net/schema/DataQualityObservationSchema",
            "name": null,
            "label": "Data Quality Observation Schema",
            "description": null
        },
        {
            "id": "https://schema.ubs.net/schema/DatasetSchema",
            "name": null,
            "label": "Dataset Schema",
            "description": null
        },
        {
            "id": "https://schema.ubs.net/schema/ApplicationSchema",
            "name": null,
            "label": "Application Schema",
            "description": null
        },
        {
            "id": "https://schema.ubs.net/schema/PolicyBasicSchema",
            "name": null,
            "label": "Policy Basic Schema",
            "description": null
        },
        {
            "id": "https://schema.ubs.net/schema/DataQualityMeasurementSchema",
            "name": null,
            "label": "Data Quality Measurement Schema",
            "description": null
        },
        {
            "id": "https://schema.ubs.net/schema/DataProductFullSchema",
            "name": null,
            "label": "Data Product Schema where datasets can also be defined",
            "description": null
        },
        {
            "id": "https://schema.ubs.net/schema/ValidationSchema",
            "name": null,
            "label": "Validation Schema",
            "description": null
        },
        {
            "id": "https://schema.ubs.net/schema/WMAAccountSchema",
            "name": null,
            "label": "WMA Account Schema",
            "description": null
        }
    ]
}

const endpointConfiguration = {
    configs: [
        {
            key: 'str',
            label: 'String',
            type: 'string',
            collection: false,
            value: 'strValue',
            values: [],
            regex: '^(?:ALL:?)?(?:(?:-?[\\w]{2}(?:-[\\w]*)?~?|-?NONE|ANY|BROWSER)?(?:,(?:-?[\\w]{2}(?:-[\\w]*)?~?|-?NONE|ANY|BROWSER))*)$'
        },
        {
            key: 'bool',
            label: 'Boolean value',
            description: '',
            type: 'boolean',
            collection: false,
            value: false,
            values: []
        },
        {
            key: 'select',
            label: 'Select',
            type: '',
            collection: false,
            value: 'Two',
            values: ['One', 'Two', 'Three']
        },
        {
            key: 'multiselect',
            label: 'Multiselect',
            type: '',
            collection: true,
            value: ['Angular', 'JavaScript'],
            values: ['Angular', 'JavaScript', 'WebDevelopment']
        },
        {
            key: 'json',
            label: 'JSON',
            type: 'json',
            collection: false,
            value: '{"foo": "bar"}',
            values: [],
            required: true
        }
    ]
};
