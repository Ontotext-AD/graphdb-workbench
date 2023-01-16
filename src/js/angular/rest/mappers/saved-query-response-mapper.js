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
