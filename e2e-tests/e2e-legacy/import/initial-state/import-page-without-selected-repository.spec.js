import {MainMenuSteps} from "../../../steps/main-menu-steps";
import {ImportUserDataSteps} from "../../../steps/import/import-user-data-steps";
import {RepositoryErrorsWidgetSteps} from "../../../steps/widgets/repository-errors-widget-steps";
import HomeSteps from "../../../steps/home-steps";
import ImportSteps from "../../../steps/import/import-steps";

describe('Initial state of the import view without a selected repository', () => {

    it('Should have the correct initial state when navigating via URL', () => {
        // When: I visit the import page via URL with no repository selected
        ImportSteps.visit();
        // Then:
        verifyInitialStateWhenNoRepositoryIsSelected();
    });

    it('Should have the correct initial state when navigating via the navigation bar', () => {
        // When: I visit the import page via the navigation menu with no repository selected
        HomeSteps.visit();
        MainMenuSteps.clickOnMenuImport();
        // Then:
        verifyInitialStateWhenNoRepositoryIsSelected();
    });

    const verifyInitialStateWhenNoRepositoryIsSelected = () => {
        RepositoryErrorsWidgetSteps.getWidget().should('be.visible');
        ImportUserDataSteps.getResourcesTable().should('not.exist');
    };
});
