import {ErrorSteps} from "../../../steps/error-steps";
import HomeSteps from "../../../steps/home-steps";
import {MainMenuSteps} from "../../../steps/main-menu-steps";
import {NamespaceSteps} from "../../../steps/setup/namespace-steps";

describe('Namespaces without selected repository', () => {
    it('Should display the correct initial state when navigating via URL', () => {
        // Given, I visit the Namespaces page via URL without a repository selected
        NamespaceSteps.visit();
        // Then,
        verifyInitialStateWithoutSelectedRepository();
    });

    it('Should display the correct initial state when navigating via the navigation menu', () => {
        // Given, I visit the Namespaces page via the navigation menu without a repository selected
        HomeSteps.visit();
        MainMenuSteps.clickOnNamespaces();
        // Then,
        verifyInitialStateWithoutSelectedRepository()
    });

    const verifyInitialStateWithoutSelectedRepository = () => {
        ErrorSteps.verifyNoConnectedRepoMessage();
        NamespaceSteps.getNamespacesView().should('exist');
        NamespaceSteps.getNamespacesContent().should('not.be.visible');
    };
})
