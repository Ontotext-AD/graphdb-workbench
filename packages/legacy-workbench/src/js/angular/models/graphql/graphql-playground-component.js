/**
 * Wrapper class for the GraphQL Playground component.
 * This class provides a clearer interface for all exposed methods of the GraphQL playground component.
 */
export class GraphQLPlaygroundComponent {

    /**
     * Creates an instance of GraphQLPlaygroundComponent.
     * @param graphQLPlaygroundComponent - The underlying GraphQL Playground component instance.
     */
    constructor(graphQLPlaygroundComponent) {
        this.graphQLPlaygroundComponent = graphQLPlaygroundComponent;
    }

    /**
     * Sets the language for the GraphQL Playground.
     *
     * @param {string} language - The language code to be set (e.g., "en", "fr").
     */
    setLanguage(language) {
        this.graphQLPlaygroundComponent.setLanguage(language);
    }
}
