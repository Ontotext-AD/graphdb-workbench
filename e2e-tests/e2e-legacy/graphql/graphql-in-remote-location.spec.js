import {RepositoriesStubs} from '../../stubs/repositories/repositories-stubs.js';
import {GraphqlEndpointManagementSteps} from '../../steps/graphql/graphql-endpoint-management-steps.js';
import {NamespaceStubs} from '../../stubs/namespace-stubs.js';
import {CreateGraphqlEndpointSteps} from '../../steps/graphql/create-graphql-endpoint-steps.js';
import {GraphqlPlaygroundSteps} from '../../steps/graphql/graphql-playground-steps.js';

describe('Graphql: Remote Location', () => {
    const REMOTE_REPOSITORY_ID = 'configurations';
    const REMOTE_REPOSITORY_LOCATION = 'http://localhost:7202';

    beforeEach(() => {
        RepositoriesStubs.stubRepositories();
        NamespaceStubs.stubGeneratedOntotextNamespacesResponse(REMOTE_REPOSITORY_ID);
        cy.presetRepository(REMOTE_REPOSITORY_ID, REMOTE_REPOSITORY_LOCATION);
    });

    it('should inform users that GraphQL endpoints are not accessible when the selected repository is in a remote location', () => {
        // GIVEN: The workbench is set up with a repository located in a remote location.

        // WHEN: I visit the GraphQL endpoint management page.
        GraphqlEndpointManagementSteps.visit();
        // THEN: I expect the page content not to be visible.
        GraphqlEndpointManagementSteps.getPageContainer().should('not.exist');
        // AND: An info message is displayed to inform users to switch to a repository from the current location.
        GraphqlEndpointManagementSteps.getRepositoryInRemoteLocation().should('contain.text', 'The selected repository is in a remote location, and its endpoints aren’t accessible here. Select a repository from the current location.');
    });

    it('should inform users that they cannot create a GraphQL endpoint when the selected repository is in a remote location', () => {
        // GIVEN: The workbench is set up with a repository located in a remote location.

        // WHEN: I visit the create GraphQL endpoint page.
        CreateGraphqlEndpointSteps.visit();
        // THEN: I expect the page content not to be visible.
        CreateGraphqlEndpointSteps.getPageContainer().should('not.exist');
        // AND: An info message is displayed to inform users to switch to a local repository.
        CreateGraphqlEndpointSteps.getRepositoryInRemoteLocation().should('contain.text', 'Endpoints can only be created for repositories in the current location. Select a local repository to continue.');
    });

    it('should inform users that the GraphQL Playground is available only for local repositories', () => {
        // GIVEN: The workbench is set up with a repository located in a remote location.

        // WHEN: I visit the GraphQL Playground page.
        GraphqlPlaygroundSteps.visit();
        // THEN: I expect the page content not to be visible.
        GraphqlPlaygroundSteps.getPageContainer().should('not.exist');
        // AND: An info message is displayed to inform users to switch to a local repository.
        GraphqlPlaygroundSteps.getRepositoryInRemoteLocation().should('contain.text', 'The active repository is in a remote location. Playground is only available for repositories in the current location.');
    });
});
