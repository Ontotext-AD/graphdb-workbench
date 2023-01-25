/**
 * Maps a saved queries response to array with saved queries model objects.
 * @param {object} response object having data[] property
 * @return {*[]|*} an array with saved query model objects.
 */
export const savedQueriesResponseMapper = (response) => {
    if (response && response.data) {
        return response.data.map((savedQuery) => ({
                queryName: savedQuery.name,
                query: savedQuery.body,
                owner: savedQuery.owner,
                isPublic: savedQuery.shared
            })
        );
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

export const savedQueryPayloadFromEvent = (event) => {
    return {
        name: event.detail.queryName,
        body: event.detail.query,
        shared: event.detail.isPublic
    };
};
