import HomeSteps from "../../../steps/home-steps";
import {MainMenuSteps} from "../../../steps/main-menu-steps";
import {PluginsSteps} from "../../../steps/setup/plugins-steps";

describe('Plugins with selected repository', () => {
    let repositoryId;

    beforeEach(() => {
        repositoryId = 'plugins-init-' + Date.now();
        cy.createRepository({id: repositoryId});
        cy.presetRepository(repositoryId);
    });

    afterEach(() => {
        cy.deleteRepository(repositoryId);
    });

    it('Should display the correct initial state when navigating via URL', () => {
        // Given, I visit the Plugins page via URL with a repository selected
        PluginsSteps.visit();
        // Then,
        verifyInitialStateWithSelectedRepository();
    });

    it('Should display the correct initial state when navigating via the navigation bar', () => {
        // Given, I visit the Plugins page via the navigation menu with a repository selected
        HomeSteps.visit();
        MainMenuSteps.clickOnPlugins();
        // Then,
        verifyInitialStateWithSelectedRepository();
    });

    const verifyInitialStateWithSelectedRepository = () => {
        PluginsSteps.getPluginsView().should('be.visible');
        PluginsSteps.getSearchPluginBar().should('be.visible');
        PluginsSteps.getPluginsList().should('exist');
    };
})
