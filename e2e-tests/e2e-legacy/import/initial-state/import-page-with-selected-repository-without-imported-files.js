import {MainMenuSteps} from "../../../steps/main-menu-steps";
import {ImportUserDataSteps} from "../../../steps/import/import-user-data-steps";
import {RepositoryErrorsWidgetSteps} from "../../../steps/widgets/repository-errors-widget-steps";
import ImportSteps from "../../../steps/import/import-steps";
import HomeSteps from "../../../steps/home-steps";

describe('Initial state of the import view with a selected repository and no imported files', () => {

    let repositoryId;

    beforeEach(() => {
        repositoryId = 'user-import-' + Date.now();
        cy.createRepository({id: repositoryId});
        cy.presetRepository(repositoryId);
    });

    afterEach(() => {
        cy.deleteRepository(repositoryId);
    });

    it('Should have the correct initial state when navigating via URL', () => {
        // When: I visit the import page via URL with a selected repository and no imported files
        ImportSteps.visit();
        // Then:
        verifyInitialStateWhenNoFilesAreImported();
    });

    it('Should have the correct initial state when navigating via the navigation bar', () => {
        // When: I visit the import page via the navigation menu with a selected repository and no imported files
        HomeSteps.visit();
        MainMenuSteps.clickOnMenuImport();
        // Then:
        verifyInitialStateWhenNoFilesAreImported();
    });

    const verifyInitialStateWhenNoFilesAreImported = () => {
        RepositoryErrorsWidgetSteps.getWidget().should('be.hidden');
        ImportSteps.getUploadRdfFilesButton().should('be.visible');
        ImportSteps.getUploadFromUrlButton().should('be.visible');
        ImportSteps.getUploadTextSnippetButton().should('be.visible');
        ImportUserDataSteps.getFileSizeLimitationWarningMessage().should('be.visible');
        ImportUserDataSteps.getHelpMessage().should('be.visible');
        ImportUserDataSteps.getResourcesTable().should('be.hidden');
    };
});
