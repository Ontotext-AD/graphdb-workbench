export const savedQueriesResponseMapper = (response) => {
    if (response) {
        return response.map((savedQuery) => ({
                queryName: savedQuery.name,
                query: savedQuery.body,
                owner: savedQuery.owner,
                isPublic: savedQuery.shared
            })
        );
    }
    return [];
};

export const savedQueryPayloadFromEvent = (event) => {
    return {
        name: event.detail.queryName,
        body: event.detail.query,
        shared: event.detail.isPublic
    };
};
