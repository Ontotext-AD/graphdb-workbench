import {TabQueryModel} from "../../models/sparql/tab-query-model";

export const buildQueryModel = (query, queryName, owner, isPublic) => {
    return new TabQueryModel(queryName, query, owner, isPublic);
};

/**
 * Maps a saved queries response to array with saved queries model objects.
 * @param {object} response object having data[] property
 * @return {*[]|*} an array with saved query model objects.
 */
export const savedQueriesResponseMapper = (response) => {
    if (response && response.data) {
        // The response.data is a map when is returned from yasgui saved query functionality.
        if (response.data.map) {
            return response.data.map((savedQuery) => buildQueryModel(savedQuery.body, savedQuery.name, savedQuery.owner, savedQuery.shared));
        }
        // The response.data is object with a saved query info, when a saved query is executed from welcome page.
        return [buildQueryModel(response.data.body, response.data.name, response.data.owner, response.data.shared)];
    }
    return [];
};

/**
 * Maps a saved query response to a saved query model object.
 * @param {object} response object having data[] property.
 * @return {object|null} a saved query model object or null.
 */
export const savedQueryResponseMapper = (response) => {
    const mapped = savedQueriesResponseMapper(response);
    if (mapped.length) {
        return mapped[0];
    }
    return null;
};

export const queryPayloadFromEvent = (event) => {
    return {
        name: event.detail.queryName,
        body: event.detail.query,
        shared: event.detail.isPublic
    };
};
