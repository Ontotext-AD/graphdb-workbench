import HomeSteps from "../../steps/home-steps";
import {MainMenuSteps} from "../../steps/main-menu-steps";
import {GraphqlEndpointManagementSteps} from "../../steps/graphql/graphql-endpoint-management-steps";

describe('GraphQL endpoint management with selected repository', () => {
  let repositoryId;

  beforeEach(() => {
    repositoryId = 'graphql-endpoint-management-' + Date.now();
    cy.createRepository({id: repositoryId});
    cy.presetRepository(repositoryId);
  });

  afterEach(() => {
    cy.deleteRepository(repositoryId);
  });

  it('Should render GraphQL endpoint management with selected repository via URL', () => {
    // Given, I visit the GraphQL endpoint management page via URL and I have a selected repository
    GraphqlEndpointManagementSteps.visit();
    // Then, I expect to see the GraphQL endpoint management page
    validateNoEndpointsGraphQlEndpointManagementPage();
  });

  it('Should render GraphQL endpoint management with selected repository via navigation menu', () => {
    // Given, I visit the GraphQL endpoint management page via navigation menu and I have a selected repository'
    HomeSteps.visit();
    MainMenuSteps.clickOnEndpointManagement();
    // Then, I expect to see the GraphQL endpoint management page
    validateNoEndpointsGraphQlEndpointManagementPage()
  });
});

function validateNoEndpointsGraphQlEndpointManagementPage() {
  GraphqlEndpointManagementSteps.getCreateEndpointButton().should('be.visible');
  GraphqlEndpointManagementSteps.getImportEndpointSchemaDefinitionButton().should('be.visible');
  GraphqlEndpointManagementSteps.getNoEndpointsInRepositoryBanner().should('be.visible');
}

