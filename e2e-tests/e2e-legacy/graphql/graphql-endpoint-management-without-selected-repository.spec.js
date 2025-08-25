import {ErrorSteps} from "../../steps/error-steps";
import {GraphqlEndpointManagementSteps} from "../../steps/graphql/graphql-endpoint-management-steps";
import HomeSteps from "../../steps/home-steps";
import {MainMenuSteps} from "../../steps/main-menu-steps";

describe('GraphQl endpoint management without selected repository', () => {
    it('Should render GraphQL endpoint management page without selected repository via URL', () => {
        // Given, I visit the GraphQL endpoint management page via URL and I haven't selected a repository
        GraphqlEndpointManagementSteps.visit();
        // Then
        ErrorSteps.verifyNoConnectedRepoMessage();
    });

    it('Should render GraphQL endpoint management without selected repository via navigation menu', () => {
        // Given, I visit the GraphQL endpoint management page via navigation menu and I haven't selected a repository'
        HomeSteps.visit();
        MainMenuSteps.clickOnEndpointManagement();
        // Then
        ErrorSteps.verifyNoConnectedRepoMessage();
    });
})
