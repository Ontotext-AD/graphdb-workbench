export class GraphqlPlaygroundDirectiveUtil {

    /**
     * Fetches GraphQL playground directive controller.
     *
     * @param {string} directiveSelector - the unique selector of the graphql playground directive component directive.
     *
     */
    static getGraphqlPlaygroundDirectiveController(directiveSelector) {
        const elementById = angular.element(document.querySelector(directiveSelector));
        const directiveElement = angular.element(elementById);
        return directiveElement.isolateScope();
    }

    /**
     * Fetches GraphQL playground component.
     *
     * @param {string} directiveSelector - the unique selector of the graphql playground directive component directive.
     *
     * @return {GraphQLPlaygroundComponent}
     */
    static getGraphqlPlaygroundComponent = (directiveSelector) => {
        const graphQLPlaygroundController = GraphqlPlaygroundDirectiveUtil.getGraphqlPlaygroundDirectiveController(directiveSelector);
        if (graphQLPlaygroundController) {
            return graphQLPlaygroundController.getGraphQLPlaygroundComponent();
        }
    };

    /**
     * Fetches GraphQL playground component.
     *
     * @param {string} directiveSelector - the unique selector of the graphql playground directive component directive.
     *
     * @param {number} timeoutInSeconds - how many times to looking for the directive.
     * @return {Promise<GraphQLPlaygroundComponent>}
     */
    static getGraphqlPlaygroundComponentAsync = (directiveSelector, timeoutInSeconds = 1) => {
        return new Promise((resolve, reject) => {
            let graphqlPlaygroundComponent = GraphqlPlaygroundDirectiveUtil.getGraphqlPlaygroundComponent(directiveSelector);
            if (graphqlPlaygroundComponent) {
                resolve(graphqlPlaygroundComponent);
            }
            let iteration = timeoutInSeconds * 1000 | 1000;
            const waitTime = 100;
            const interval = setInterval(() => {
                graphqlPlaygroundComponent = GraphqlPlaygroundDirectiveUtil.getGraphqlPlaygroundComponent(directiveSelector);
                if (graphqlPlaygroundComponent) {
                    clearInterval(interval);
                    resolve(graphqlPlaygroundComponent);
                } else {
                    iteration -= waitTime;
                    if (iteration < 0) {
                        clearInterval(interval);
                        console.log('GraphQL Playground component is not found', directiveSelector);
                        reject(new Error('Element is not found: ' + directiveSelector));
                    }
                }
            }, waitTime);
        });
    };
}
