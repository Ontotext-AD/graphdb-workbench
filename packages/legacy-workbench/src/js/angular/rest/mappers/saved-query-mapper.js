import {TabQueryModel} from "../../models/sparql/tab-query-model";

export const buildQueryModel = (query, queryName, owner, isPublic, readonly = true) => {
    return new TabQueryModel(queryName, query, owner, isPublic, readonly);
};

/**
 * Maps a saved queries response to array with saved queries model objects.
 * @param {object} response object having data[] property
 * @param {string} currentUsername The currently authenticated username.
 * @return {*[]|*} an array with saved query model objects.
 */
export const savedQueriesResponseMapper = (response, currentUsername) => {
    if (response && response.data) {
        // The response.data is a map when is returned from yasgui saved query functionality.
        if (response.data.map) {
            return response.data.map((savedQuery) => {
                const readonly = currentUsername !== savedQuery.owner;
                return buildQueryModel(savedQuery.body, savedQuery.name, savedQuery.owner, savedQuery.shared, readonly);
            });
        }

        const readonly = currentUsername !== response.data.owner;
        // The response.data is object with a saved query info, when a saved query is executed from welcome page.
        return [buildQueryModel(response.data.body, response.data.name, response.data.owner, response.data.shared, readonly)];
    }
    return [];
};

/**
 * Maps a saved query response to a saved query model object.
 * @param {object} response object having data[] property.
 * @param {string} currentUsername The currently authenticated username.
 * @return {object|null} a saved query model object or null.
 */
export const savedQueryResponseMapper = (response, currentUsername) => {
    const mapped = savedQueriesResponseMapper(response, currentUsername);
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
