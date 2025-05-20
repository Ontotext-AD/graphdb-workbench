import {MainMenuSteps} from "../../../steps/main-menu-steps";
import {ImportUserDataSteps} from "../../../steps/import/import-user-data-steps";
import {RepositoryErrorsWidgetSteps} from "../../../steps/widgets/repository-errors-widget-steps";
import ImportSteps from "../../../steps/import/import-steps";
import HomeSteps from "../../../steps/home-steps";

describe('Initial state of the import view with a selected repository', () => {
    const RDF_SNIPPET = '@base <http://example.org/> .\n' +
        '@prefix foaf: <http://xmlns.com/foaf/0.1/> .\n' +
        '<#green-goblin>\n' +
        'a foaf:Person ;    # in the context of the Marvel universe\n' +
        'foaf:name "Green Goblin" .\n';

    let repositoryId;

    beforeEach(() => {
        repositoryId = 'user-import-' + Date.now();
        cy.createRepository({id: repositoryId});
        cy.presetRepository(repositoryId);
        cy.importRDFTextSnippet(repositoryId, RDF_SNIPPET);
    });

    afterEach(() => {
        cy.deleteRepository(repositoryId);
    });

    it('Should have the correct initial state when navigating via URL', () => {
        // When: I visit the import page by URL with a selected repository and at least one imported file
        ImportSteps.visit();
        // Then:
        verifyInitialStateWhenFilesAreImported();
    });

    it('Should have the correct initial state when navigating via the navigation bar', () => {
        // When: I navigate to the import page using the navigation menu with a selected repository and at least one imported file
        HomeSteps.visit();
        MainMenuSteps.clickOnMenuImport();
        // Then:
        verifyInitialStateWhenFilesAreImported();
    });

    const verifyInitialStateWhenFilesAreImported = () => {
        RepositoryErrorsWidgetSteps.getWidget().should('be.hidden');
        ImportSteps.getUploadRdfFilesButton().should('be.visible');
        ImportSteps.getUploadFromUrlButton().should('be.visible');
        ImportSteps.getUploadTextSnippetButton().should('be.visible');
        ImportUserDataSteps.getFileSizeLimitationWarningMessage().should('be.visible');
        ImportUserDataSteps.getHelpMessage().should('not.exist');
        ImportUserDataSteps.getResourcesTable().should('be.visible');
    };
});
