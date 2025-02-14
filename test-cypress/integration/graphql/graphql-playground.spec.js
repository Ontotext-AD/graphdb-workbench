import {GraphqlPlaygroundSteps} from "../../steps/graphql/graphql-playground-steps";
import {GraphqlStubs} from "../../stubs/graphql/graphql-stubs";
import {GraphiqlPlaygroundSteps} from "../../steps/graphql/graphiql-playground-steps";
import {GraphiQLEditorToolsSteps} from "../../steps/graphql/graphiql-editor-tools-steps";
import {LanguageSelectorSteps} from "../../steps/language-selector-steps";

describe('GraphQL Playground', () => {
    let repositoryId;

    beforeEach(() => {
        repositoryId = 'graphql-playground-' + Date.now();
        cy.createRepository({id: repositoryId});
        cy.presetRepository(repositoryId);
    });

    afterEach(() => {
        cy.deleteRepository(repositoryId);
    });

    it('should render the no schemas alert when current repository does not contain graphql schemas', () => {
        // Given I have opened the workbench on the GraphQL Playground page
        GraphqlPlaygroundSteps.visit();
        // When there are no GraphQL schemas in the current repository
        // Then I should see the no schemas alert
        GraphqlPlaygroundSteps.getNoSchemasAlert().should('be.visible');
    });

    it('should load GraphQL Playground', () => {
        GraphqlStubs.stubGetEndpoints(repositoryId);
        GraphqlStubs.stubCountriesSchema();
        // Given I have opened the workbench
        // When I visit the GraphQL Playground page
        GraphqlPlaygroundSteps.visit();
        // Then I should see the graphql endpoints select menu
        GraphqlPlaygroundSteps.getEndpointsSelectMenu().should('be.visible');
        // And the endpoints menu should contain 2 options
        GraphqlPlaygroundSteps.getEndpointsSelectMenuOptions().should('have.length', 2);
        // Then I should see the GraphQL Playground component
        GraphqlPlaygroundSteps.getPlayground().should('exist').and('be.visible');
    });

    it('should be able to change the endpoint', () => {
        GraphqlStubs.stubGetEndpoints(repositoryId);
        GraphqlStubs.stubCountriesSchema();
        // When I visit the GraphQL Playground page
        GraphqlPlaygroundSteps.visit();
        GraphqlPlaygroundSteps.getPlayground().should('exist').and('be.visible');
        // Then I should see the countries endpoint selected
        GraphqlPlaygroundSteps.getSelectedEndpoint().should('have.text', 'countries');
        // And I can execute a query on the countries endpoint
        GraphqlPlaygroundSteps.setInEditor(`
          query GetContinentById {
            continent(code: "EU") {
              name
            }
          }
        `);
        // And I execute the query
        GraphqlPlaygroundSteps.executeQuery();
        // Then I get expected result
        GraphqlPlaygroundSteps.getResponse().should('contain', '"name": "Europe"');
        // When I change the endpoint to countries
        GraphqlStubs.stubStubRickAndMortySchema();
        GraphqlPlaygroundSteps.selectEndpoint('rickmorty');
        GraphqlPlaygroundSteps.setInEditor(`
          query Character {
            character(id: "2") {
              name
            }
          }
        `);
        // And I execute the query
        GraphqlPlaygroundSteps.executeQuery();
        // Then I get expected result from the new endpoint
        GraphqlPlaygroundSteps.getResponse().should('contain', '"name": "Morty Smith"');
    });

    it('should be able to translate the labels', () => {
        // Given: I have opened the workbench on the GraphQL Playground page.
        GraphqlStubs.stubGetEndpoints(repositoryId);
        GraphqlStubs.stubCountriesSchema();
        GraphqlPlaygroundSteps.visit();
        GraphiqlPlaygroundSteps.getPlayground().should('be.visible');
        // the GraphQL is translated on english
        GraphiQLEditorToolsSteps.getGraphiQLEditorTabButton(1).contains('Headers');

        // When: I change the language.
        LanguageSelectorSteps.changeLanguage('fr');
        // Then: I expect to see GraphQL playground translated.
        GraphiQLEditorToolsSteps.getGraphiQLEditorTabButton(1).contains('En-têtes');
    });
});
