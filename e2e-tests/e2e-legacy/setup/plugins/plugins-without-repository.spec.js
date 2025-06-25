import {ErrorSteps} from "../../../steps/error-steps";
import HomeSteps from "../../../steps/home-steps";
import {MainMenuSteps} from "../../../steps/main-menu-steps";
import {PluginsSteps} from "../../../steps/setup/plugins-steps";

describe('Plugins without selected repository', () => {
    it('Should display the correct initial state when navigating via URL', () => {
        // Given, I visit the Plugins page via URL without a repository selected
        PluginsSteps.visit();
        // Then,
        verifyInitialStateWithoutSelectedRepository();
    });

    it('Should display the correct initial state when navigating via the navigation menu', () => {
        // Given, I visit the Plugins page via the navigation menu without a repository selected
        HomeSteps.visit();
        MainMenuSteps.clickOnPlugins();
        // Then,
        verifyInitialStateWithoutSelectedRepository()
    });

    const verifyInitialStateWithoutSelectedRepository = () => {
        ErrorSteps.verifyNoConnectedRepoMessage();
        PluginsSteps.getPluginsView().should('be.visible');
        PluginsSteps.getSearchPluginBar().should('not.be.visible');
        PluginsSteps.getPluginsList().should('not.exist');
    };
})
