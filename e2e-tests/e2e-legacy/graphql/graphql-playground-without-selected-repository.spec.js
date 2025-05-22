import {GraphqlPlaygroundSteps} from "../../steps/graphql/graphql-playground-steps";
import {ErrorSteps} from "../../steps/error-steps";
import HomeSteps from "../../steps/home-steps";
import {MainMenuSteps} from "../../steps/main-menu-steps";

describe('GraphQl playground without selected repository', () => {
    it('Should render GraphQL playground without selected repository via URL', () => {
        // Given, I visit the GraphQL playground page via URL and I don't have any repositories
        GraphqlPlaygroundSteps.visit();
        // Then
        ErrorSteps.verifyNoConnectedRepoMessage();
    });

    it('Should render GraphQL playground without selected repository via navigation menu', () => {
        // Given, I visit the GraphQL playground page via navigation menu and I don't have any repositories'
        HomeSteps.visit();
        MainMenuSteps.clickOnGraphQLPlayground();
        // Then
        ErrorSteps.verifyNoConnectedRepoMessage();
    });
});

