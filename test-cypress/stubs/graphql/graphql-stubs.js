export const ENDPOINT_COUNTRIES = '/rest/repositories/test/graphql/countries';
export const ENDPOINT_RICKMORTY = '/rest/repositories/test/graphql/rickmorty';

export class GraphqlStubs {
    static stubGetEndpoints(repositoryId, fixture = 'graphql-endpoints.json', delay = 0) {
        const fuxturePath = `/graphql/endpoints/${fixture}`;
        cy.intercept('GET', `/rest/repositories/${repositoryId}/graphql/endpoints`, {
            fixture: fuxturePath,
            statusCode: 200,
            delay: delay
        }).as('get-endpoints');
    }

    static stubGetEndpointsInfo(repositoryId, delay = 0) {
        cy.intercept('GET', `/rest/repositories/${repositoryId}/graphql/endpoints-info`, {
            fixture: '/graphql/endpoints/graphql-endpoints-info.json',
            statusCode: 200,
            delay: delay
        }).as('get-endpoints');
    }

    static stubCountriesSchema() {
        cy.intercept('POST', ENDPOINT_COUNTRIES, (req) => {
            stubQuery(req, 'IntrospectionQuery', 'graphql/editor/countries-schema.json');
            stubQuery(req, 'GetContinentById', {
                data: {
                    name: 'Europe'
                }
            });
        }).as('countries');
    }

    static stubStubRickAndMortySchema() {
        cy.intercept('POST', ENDPOINT_RICKMORTY, (req) => {
            stubQuery(req, 'IntrospectionQuery', 'graphql/editor/rick-and-morty-schema.json');
            stubQuery(req, 'Character', {
                data: {
                    name: 'Morty Smith'
                }
            });
        }).as('rickmorty');
    }
}

const defaultHeaders = {
    'api-timestamp': '123456789'
};

/**
 * Utility to match a GraphQL mutation or query based on the operation name.
 *
 * @param {any} req - The request object.
 * @param {string} operationName - The name of the GraphQL operation to match.
 * @return {boolean} True if the request's operation name matches the provided name, otherwise false.
 */
const hasOperationName = (req, operationName) => {
    const {body} = req;
    return (
        body.hasOwnProperty('operationName') && body.operationName === operationName
    );
};

/**
 * Utility to check if a GraphQL request contains the specified variables.
 *
 * @param {any} req - The request object.
 * @param {object} variables - The variables to match in the request.
 * @return {boolean} True if the request contains the specified variables, otherwise false.
 */
const hasVariables = (req, variables) => {
    const {body} = req;
    if (body.hasOwnProperty('variables')) {
        let sameVars = false;
        Object.keys(variables).forEach((name) => {
            if (Array.isArray(variables[name])) {
                sameVars = body.variables[name] !== undefined && variables[name].toString() === body.variables[name].toString();
            } else {
                sameVars = body.variables[name] !== undefined && body.variables[name] === variables[name];
            }
        });
        return sameVars;
    }
    return false;
};

/**
 * Aliases a query request if its operation name matches the provided name.
 *
 * @param {any} req - The request object.
 * @param {string} operationName - The name of the GraphQL query to alias.
 */
const aliasQuery = (req, operationName) => {
    if (hasOperationName(req, operationName)) {
        req.alias = operationName;
    }
};

/**
 * Stubs a GraphQL query request with a specified fixture, status code, and optional headers and delay.
 *
 * @param {any} req - The request object.
 * @param {string} operationName - The name of the GraphQL query to stub.
 * @param {any} fixture - The fixture to return as a response.
 * @param {number} [statusCode=200] - The HTTP status code for the response.
 * @param {number} [delay=0] - The delay in milliseconds before sending the response.
 * @param {object} [headers={}] - Optional headers to include in the response.
 */
const stubQuery = (req, operationName, fixture, statusCode = 200, delay = 0, headers = {}) => {
    if (hasOperationName(req, operationName)) {
        const requestHeaders = Object.assign({}, defaultHeaders, headers);
        req.alias = operationName;
        req.reply({
            statusCode,
            body: fixture,
            headers: requestHeaders,
            delay
        });
    }
};

/**
 * Stubs a GraphQL query request with specific variables, using a fixture, delay, and optional headers.
 *
 * @param {any} req - The request object.
 * @param {string} operationName - The name of the GraphQL query to stub.
 * @param {object} variables - The variables to match in the request.
 * @param {any} fixture - The fixture to return as a response.
 * @param {number} [delay=0] - The delay in milliseconds before sending the response.
 * @param {object} [headers={}] - Optional headers to include in the response.
 */
const stubQueryWithVariable = (req, operationName, variables, fixture, delay = 0, headers = {}) => {
    if (hasOperationName(req, operationName) && hasVariables(req, variables)) {
        const requestHeaders = Object.assign({}, defaultHeaders, headers);
        req.alias = operationName;
        const replyConfig = {
            statusCode: 200, // default
            fixture,
            headers: requestHeaders,
            delay
        };
        req.reply(replyConfig);
    }
};

/**
 * Aliases a mutation request if its operation name matches the provided name.
 *
 * @param {any} req - The request object.
 * @param {string} operationName - The name of the GraphQL mutation to alias.
 */
const aliasMutation = (req, operationName) => {
    if (hasOperationName(req, operationName)) {
        req.alias = operationName;
    }
};
