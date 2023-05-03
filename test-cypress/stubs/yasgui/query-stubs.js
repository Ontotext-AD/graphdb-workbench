import {SecurityStubs} from "../security-stubs";

export class QueryStubs {

    static stubInferAndSameAsDefaults(infer = true, sameAs = true) {
        SecurityStubs.stubInferAndSameAsDefaults();
        SecurityStubs.stubUserSecurity(infer, sameAs);
    }

    static stubQueryCountResponse() {
        cy.intercept('GET', '/rest/monitor/query/count', {body: 0});
    }
    static stubDefaultQueryResponse(repositoryId, withDelay = 0) {
        QueryStubs.stubQueryResponse(repositoryId, '/graphql-editor/default-query-response.json', withDelay);
    }

    static stubEmptyQueryResponse(repositoryId, withDelay = 0) {
        QueryStubs.stubQueryResponse(repositoryId, '/queries/empty-query-response.json', withDelay);
    }

    static stubDefaultTripleQueryResponse(repositoryId, withDelay = 0) {
        QueryStubs.stubQueryResponse(repositoryId, '/queries/default-triple-query-response.json', withDelay);
    }

    static stubQueryResponse(repositoryId, fixture, withDelay = 0) {
        cy.intercept(`/repositories/${repositoryId}`, {fixture, delay: withDelay}).as(`${repositoryId}-stub-query`);
    }

    static stubQueryResults(queryDescription) {
        const resultType = queryDescription.resultType;
        const pageSize = queryDescription.pageSize;
        const totalElements = queryDescription.totalElements;
        const countQuery = queryDescription.countQuery;
        const repositoryId = queryDescription.repositoryId;

        const fullyFiledPages = Math.floor(totalElements / pageSize);
        const elementsForLastPage = totalElements % pageSize;
        const limit = countQuery ? pageSize + 1 : pageSize;

        // Stubs responses for all fully filled pages.
        for (let pageNumber = 0; pageNumber < fullyFiledPages; pageNumber++) {
            const offset = pageNumber * pageSize;
            let returnElements = pageSize;

            if (QueryStubs.isLastPage(pageNumber, fullyFiledPages)) {
                // Check if there are more results, if yes the query must return one more result.
                if (elementsForLastPage > 0 && countQuery) {
                    returnElements += 1;
                }
            } else {
                if (countQuery) {
                    // If there are more pages the query must return one more result.
                    returnElements += 1;
                }
            }
            const page = pageNumber + 1;
            QueryStubs.stubQueryWithResults(repositoryId, page, offset, limit, returnElements, resultType);
        }

        // Stubs the last page with.
        if (elementsForLastPage > 0) {
            const offset = fullyFiledPages * pageSize;
            const page = fullyFiledPages + 1;
            QueryStubs.stubQueryWithResults(repositoryId, page, offset, limit, elementsForLastPage, resultType);
        }

        QueryStubs.stubTotalQueryCount(repositoryId, totalElements, resultType);
    }

    static isLastPage(currentPage, allPage) {
        return allPage - currentPage === 1;
    }

    static stubQueryWithResults(repositoryId, page, offset, limit, returnResult, resultType) {
        const result = QueryStubs.createEmptyResponse(resultType);
        result.results.bindings = QueryStubs.createResults(resultType, page, returnResult);
        cy.intercept(`/repositories/${repositoryId}`, (req) => {
            if (req.body.indexOf(`limit=${limit}`) > -1 && req.body.indexOf(`offset=${offset}`) > -1) {
                req.reply(result);
            }
        }).as(`query-${page}_${offset}_${limit}_${returnResult}`);
    }

    static stubTotalQueryCount(repositoryId, totalElements, resultType, delay = 0) {
        const result = QueryStubs.createEmptyResponse(resultType);
        result.results.bindings = [QueryStubs.createTotalResultsCount(resultType, totalElements)];
        cy.intercept(`/repositories/${repositoryId}`, (req) => {
            if (req.body.indexOf('count=1') > -1) {
                req.reply(result);
            }
        }).as(`countQuery-${totalElements}`);
    }

    static createResults(resultType, page, count) {
        const results = [];
        for (let index = 0; index < count; index++) {
            results.push(QueryStubs.createAnResult(resultType, page, index + 1));
        }
        return results;
    }

    static createAnResult(resultType, page, row) {
        switch (resultType) {
            case ResultType.URI:
                return this.createAnUriResult(page, row);
            case ResultType.TRIPLE:
                return this.createAnTripleResult(page, row);
        }
    }

    static createAnTripleResult(page, row) {
        return {
            t : {
                type : "triple",
                value : {
                    s : {
                        type : "uri",
                        value : QueryStubs.createAnUri(page, row, 1)
                    },
                    p : {
                        type : "uri",
                        value : QueryStubs.createAnUri(page, row, 2)
                    },
                    o : {
                        type : "uri",
                        value : QueryStubs.createAnUri(page, row, 3)
                    }
                }
            }
        };
    }

    static createAnUriResult(page, row) {
        return {
            s: {
                type: "uri",
                value: QueryStubs.createAnUri(page, row, 1)
            },
            p: {
                type: "uri",
                value: QueryStubs.createAnUri(page, row, 2)
            },
            o: {
                type: "uri",
                value: QueryStubs.createAnUri(page, row, 3)
            }
        };
    }

    static createAnUri(page, row, column) {
        return `http://ontotext-yasgui/generated-yri#page_${page}-row_${row}-column_${column}`;
    }

    static createEmptyResponse(resultType) {
        switch (resultType) {
            case ResultType.URI:
                return QueryStubs.createEmptyUriResponse();
            case ResultType.TRIPLE:
                return QueryStubs.createTripleResponse();
        }
    }

    static createEmptyUriResponse() {
        return {
            head: {
                vars: ["s", "p", "o"]
            },
            results: {
                bindings: []
            }
        };
    }

    static createTripleResponse() {
        return {
            head: {
                vars: ["t"]
            },
            results: {
                bindings: []
            }
        };
    }

    static createTotalResultsCount(resultType, totalElement) {
        switch (resultType) {
            case ResultType.URI:
                return QueryStubs.createUriTotalResultsCount(totalElement);
            case ResultType.TRIPLE:
                return QueryStubs.createTripleTotalResultsCount(totalElement);
        }
    }

    static createUriTotalResultsCount(totalElement) {
        return {
            s: {
                type: "uri",
                value: `${totalElement}`
            },
            p: {
                type: "uri",
                value: `${totalElement}`
            },
            o: {
                type: "uri",
                value: `${totalElement}`
            }
        };
    }

    static createTripleTotalResultsCount(totalElement) {
        return {
            t: {
                datatype: "http://www.w3.org/2001/XMLSchema#int",
                type: "literal",
                value: `${totalElement}`
            }
        };
    }
}

export class QueryStubDescription {
    constructor() {
      this.resultType = ResultType.URI;
      this.countQuery = true;
      this.pageSize = 1000;
    }

    setTotalElements(totalElements) {
        this.totalElements = totalElements;
        return this;
    }

    setCountQuery(countQuery) {
        this.countQuery = countQuery;
        return this;
    }

    setResultType(resultType) {
        this.resultType = resultType;
        return this;
    }

    setRepositoryId(repositoryId) {
        this.repositoryId = repositoryId;
        return this;
    }
}

export const ResultType = {
    'URI': 'uri',
    'TRIPLE': 'triple'
};
