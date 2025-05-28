import {MainMenuSteps} from "../../../steps/main-menu-steps";
import HomeSteps from "../../../steps/home-steps";
import {ErrorSteps} from "../../../steps/error-steps";
import {VisualGraphSteps} from "../../../steps/visual-graph-steps";

describe('Visual Graph without selected repository', () => {
    it('Should render Visual Graph without selected repository via URL', () => {
        // Given, I visit the Visual Graph page via URL and I don't have any repositories
        VisualGraphSteps.visit();
        // Then
        ErrorSteps.verifyNoConnectedRepoMessage();
    });

    it('Should render Visual Graph without selected repository via navigation menu', () => {
        // Given, I visit the Visual Graph page via navigation menu and I don't have any repositories
        HomeSteps.visit();
        MainMenuSteps.clickOnVisualGraph();
        // Then
        ErrorSteps.verifyNoConnectedRepoMessage();
    });
})
