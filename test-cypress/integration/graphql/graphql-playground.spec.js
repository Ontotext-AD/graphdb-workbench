import {GraphqlPlaygroundSteps} from "../../steps/graphql/graphql-playground-steps";
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

    context('with schemas', () => {

        beforeEach(() => {
            cy.importServerFile(repositoryId, 'swapi-dataset.ttl');
            cy.uploadGraphqlSchema(repositoryId, 'graphql/soml/swapi-schema.yaml', 'swapi');
            cy.uploadGraphqlSchema(repositoryId, 'graphql/soml/swapi-schema-planets.yaml', 'swapi-planets');
        });

        it('should load GraphQL Playground', () => {
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
            // When I visit the GraphQL Playground page
            GraphqlPlaygroundSteps.visit();
            GraphqlPlaygroundSteps.getPlayground().should('exist').and('be.visible');
            // Then I should see the countries endpoint selected
            GraphqlPlaygroundSteps.getSelectedEndpoint().should('have.text', 'swapi');
            // And I can execute a query on the countries endpoint
            GraphqlPlaygroundSteps.setInEditor(`
                query StarshipById {
                  starship(ID: "https://swapi.co/resource/starship/9") {
                    name
                  }
                }
            `);
            // And I execute the query
            GraphqlPlaygroundSteps.executeQuery();
            // Then I get expected result
            GraphqlPlaygroundSteps.getResponse().should('contain', '"name": "Death Star"');
            // When I change the endpoint to countries
            // GraphqlStubs.stubStubRickAndMortySchema();
            GraphqlPlaygroundSteps.selectEndpoint('swapi-planets');
            GraphqlPlaygroundSteps.setInEditor(`
                query PlanetById {
                  planet(ID: "https://swapi.co/resource/planet/1") {
                    name
                  }
                }
            `);
            // And I execute the query
            GraphqlPlaygroundSteps.executeQuery();
            // Then I get expected result from the new endpoint
            GraphqlPlaygroundSteps.getResponse().should('contain', '"name": "Tatooine"');
        });

        it('should be able to translate the labels', () => {
            // Given: I have opened the workbench on the GraphQL Playground page.
            GraphqlPlaygroundSteps.visit();
            GraphiqlPlaygroundSteps.getPlayground().should('be.visible');
            // the GraphQL is translated on english
            GraphiQLEditorToolsSteps.getGraphiQLEditorTabButton(1).contains('Headers');

            // When: I change the language.
            LanguageSelectorSteps.changeLanguage('fr');
            // Then: I expect to see GraphQL playground translated.
            GraphiQLEditorToolsSteps.getGraphiQLEditorTabButton(1).contains('En-têtes');
        });

        it('should set default query', () => {
            // Given: I have opened the workbench on the GraphQL Playground page.
            GraphqlPlaygroundSteps.visit();
            GraphiqlPlaygroundSteps.getPlayground().should('be.visible');

            // Then: I expect the default query to be set in the GraphQL query editor.
            GraphqlPlaygroundSteps.getEditorContent().should('equal', 'query Object {\n  object(limit: 100) {\n    id\n  }\n}');

            // When: I open a new tab.
            GraphqlPlaygroundSteps.addTab();
            GraphqlPlaygroundSteps.getTabs().should('have.length', 2);

            // Then: I expect the default query to be set in the GraphAL query editor for the newly opened tab.
            GraphqlPlaygroundSteps.getEditorContent().should('equal', 'query Object {\n  object(limit: 100) {\n    id\n  }\n}');
        });
    });
});
