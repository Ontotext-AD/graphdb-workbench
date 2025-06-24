import HomeSteps from "../../../steps/home-steps";
import {MainMenuSteps} from "../../../steps/main-menu-steps";
import {NamespaceSteps} from "../../../steps/setup/namespace-steps";

describe('Namespaces with selected repository', () => {
    let repositoryId;

    beforeEach(() => {
        repositoryId = 'namespaces-init-' + Date.now();
        cy.createRepository({id: repositoryId});
        cy.presetRepository(repositoryId);
    });

    afterEach(() => {
        cy.deleteRepository(repositoryId);
    });

    it('Should display the correct initial state when navigating via URL', () => {
        // Given, I visit the Namespaces page via URL with a repository selected
        NamespaceSteps.visit();
        // Then,
        verifyInitialStateWithSelectedRepository();
    });

    it('Should display the correct initial state when navigating via the navigation bar', () => {
        // Given, I visit the Namespaces page via the navigation menu with a repository selected
        HomeSteps.visit();
        MainMenuSteps.clickOnNamespaces();
        // Then,
        verifyInitialStateWithSelectedRepository();
    });

    const verifyInitialStateWithSelectedRepository = () => {
        NamespaceSteps.getNamespacesView().should('exist');
        NamespaceSteps.getNamespacesContent().should('exist');
        NamespaceSteps.getAddNamespaceForm().should('be.visible');
        NamespaceSteps.getNamespacePrefixField().should('be.visible');
        NamespaceSteps.getNamespaceValueField().should('be.visible');
        NamespaceSteps.getAddNamespaceButton().should('be.visible');
        NamespaceSteps.getNamespacesPerPageMenu().should('be.visible');
        NamespaceSteps.getNamespacesFilterField().should('be.visible');
        NamespaceSteps.getNamespacesTable().should('be.visible');
    };
})
