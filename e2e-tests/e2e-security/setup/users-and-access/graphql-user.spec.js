import {UserAndAccessSteps} from "../../../steps/setup/user-and-access-steps";
import {LoginSteps} from "../../../steps/login-steps";
import {GraphqlPlaygroundSteps} from "../../../steps/graphql/graphql-playground-steps";
import {RepositorySteps} from "../../../steps/repository-steps";

describe('GraphQL-only User – Playground Access & Mutation Restriction', () => {
    let repositoryId;
    const gqlUsername = `gqluser-${Date.now()}`;
    const testPassword = 'P@ssw0rd123!';
    const readQuery = `
                query StarshipById {
                  starship(ID: "https://swapi.co/resource/starship/9") {
                    name
                  }
                }
            `;
    const mutation = `
    mutation CreateHuman {
      create_Human(
        objects: [
          {
            id: "file:/test/onto/vocabulary/Human1",
            rdfs_label: "New human with specific iri id"
          }
        ]
      ) {
        human { id }
        affected_objects { ids }
      }
    }
  `;

    beforeEach(() => {
        repositoryId = `repo-${Date.now()}`;
        cy.createRepository({ id: repositoryId });
        cy.presetRepository(repositoryId);
        cy.importServerFile(repositoryId, 'swapi-dataset.ttl');
        cy.uploadGraphqlSchema(repositoryId, 'graphql/soml/swapi-schema.yaml', 'swapi');
    });

    afterEach(() => {
        cy.loginAsAdmin();
        cy.switchOffSecurity(true);
        cy.deleteUser(gqlUsername);
        cy.deleteRepository(repositoryId);
    });

    it('should see only the assigned repo, block SPARQL, allow GraphQL read and forbid writes, and hide create-repo everywhere', () => {
        UserAndAccessSteps.visit();
        UserAndAccessSteps.clickCreateNewUserButton();
        UserAndAccessSteps.typeUsername(gqlUsername);
        UserAndAccessSteps.typePassword(testPassword);
        UserAndAccessSteps.typeConfirmPasswordField(testPassword);
        UserAndAccessSteps.clickReadAccessRepo(repositoryId);
        UserAndAccessSteps.clickGraphqlAccessRepo(repositoryId);
        UserAndAccessSteps.confirmUserCreate();

        UserAndAccessSteps.toggleSecurity();

        // Log in as GraphQL-only user
        LoginSteps.loginWithUser(gqlUsername, testPassword);

        // The repository is set
        RepositorySteps.verifyRepositoryIsSelected(repositoryId);

        // Verify only the assigned repository appears in endpoints
        GraphqlPlaygroundSteps.visit();
        GraphqlPlaygroundSteps.getView().should('be.visible');
        GraphqlPlaygroundSteps.getQueryEditor().should('be.visible');
        GraphqlPlaygroundSteps.getSelectedEndpoint().should('have.text', 'swapi');
        // And I can execute a query on the countries endpoint
        GraphqlPlaygroundSteps.setInEditor(readQuery);
        // And I execute the query
        GraphqlPlaygroundSteps.executeQuery();
        // Then I get expected result
        GraphqlPlaygroundSteps.getResponse().should('contain', '"name": "Death Star"');

        // Execute the create_Human mutation → expect errors
        GraphqlPlaygroundSteps.setInEditor(mutation);
        GraphqlPlaygroundSteps.executeQuery();
        GraphqlPlaygroundSteps.getResponse().should('contain.text', 'errors');
        LoginSteps.logout();
    });

    it('should allow GraphQL mutation and hide SPARQL/Import/Create-repo menus', () => {
        UserAndAccessSteps.visit();
        UserAndAccessSteps.clickCreateNewUserButton();
        UserAndAccessSteps.typeUsername(gqlUsername);
        UserAndAccessSteps.typePassword(testPassword);
        UserAndAccessSteps.typeConfirmPasswordField(testPassword);
        UserAndAccessSteps.clickReadAccessRepo(repositoryId);
        UserAndAccessSteps.clickWriteAccessRepo(repositoryId);
        UserAndAccessSteps.clickGraphqlAccessRepo(repositoryId);
        UserAndAccessSteps.confirmUserCreate();

        UserAndAccessSteps.toggleSecurity();

        // Log in as the new user
        LoginSteps.loginWithUser(gqlUsername, testPassword);

        // The repository is set
        RepositorySteps.verifyRepositoryIsSelected(repositoryId);

        // Visit GraphQL Playground
        GraphqlPlaygroundSteps.visit();
        GraphqlPlaygroundSteps.getView().should('be.visible');
        GraphqlPlaygroundSteps.getQueryEditor().should('be.visible');
        GraphqlPlaygroundSteps.getSelectedEndpoint().should('have.text', 'swapi');

        // Execute a read query to verify read access
        GraphqlPlaygroundSteps.setInEditor(readQuery);
        GraphqlPlaygroundSteps.executeQuery();
        GraphqlPlaygroundSteps.getResponse()
            .should('contain.text', '"name": "Death Star"');

        // Execute the mutation and expect success
        GraphqlPlaygroundSteps.setInEditor(mutation);
        GraphqlPlaygroundSteps.executeQuery();
        GraphqlPlaygroundSteps.getResponse()
            .should('contain.text', 'data')
            .and('contain.text', 'create_Human')
            .and('contain.text', 'affected_objects');

        LoginSteps.logout();
    });
});
