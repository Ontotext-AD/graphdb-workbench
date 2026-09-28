import {ReactodiaSteps} from '../../steps/reactodia-steps.js';
import {LanguageSelectorSteps} from '../../steps/language-selector-steps.js';
import {RepositorySelectorSteps} from '../../steps/repository-selector-steps.js';
import {MainMenuSteps} from '../../steps/main-menu-steps.js';
import {YasqeSteps} from '../../steps/yasgui/yasqe-steps.js';
import {ApplicationSteps} from '../../steps/application-steps.js';

const FILE_TO_IMPORT = 'resource-test-data.ttl';
const SEED_RESOURCE_ENCODED = 'http:%2F%2Fexample.com%2Fontology%23CustomerLoyalty';
const SEED_RESOURCE_LABEL = 'CustomerLoyalty';

const CONSTRUCT_QUERY = 'CONSTRUCT { <http://example.com/ontology#CustomerLoyalty> ?p ?o } WHERE { <http://example.com/ontology#CustomerLoyalty> ?p ?o }';
const CONSTRUCT_TARGET_LABEL = 'Metric';

describe('Reactodia graph explorer', () => {
    let repositoryId;

    beforeEach(() => {
        repositoryId = 'repository-' + Date.now();
        cy.createRepository({id: repositoryId});
        cy.presetRepository(repositoryId);
        cy.importServerFile(repositoryId, FILE_TO_IMPORT);
    });

    afterEach(() => {
        cy.deleteRepository(repositoryId);
    });

    it('should mount the reactodia workspace when a repository is active', () => {
        // Given I open the reactodia view without a start resource.
        ReactodiaSteps.visit();

        // Then I expect the reactodia workspace and its canvas to be rendered.
        ReactodiaSteps.getWorkspace().should('exist');
        ReactodiaSteps.getCanvas().should('exist');

        // And I expect the canvas to start empty because no start resource was provided.
        ReactodiaSteps.getElements().should('not.exist');
    });

    it('should place the start resource on the canvas as a seed', () => {
        // Given I open the reactodia view with a start resource.
        ReactodiaSteps.visit(SEED_RESOURCE_ENCODED);

        // Then I expect the start resource to be placed on the canvas as a seed element.
        ReactodiaSteps.getElements().should('have.length', 1);
        ReactodiaSteps.getElement(SEED_RESOURCE_LABEL).should('exist');
    });

    it('should seed the canvas with the graph computed from a CONSTRUCT query', () => {
        // Given I open the reactodia view with a CONSTRUCT query, as sent from the SPARQL editor.
        ReactodiaSteps.visitWithQuery(CONSTRUCT_QUERY);

        // Then I expect the computed graph to be seeded on the canvas: the subject and its related resource.
        ReactodiaSteps.getElements().should('have.length', 2);
        ReactodiaSteps.getElement(SEED_RESOURCE_LABEL).should('exist');
        ReactodiaSteps.getElement(CONSTRUCT_TARGET_LABEL).should('exist');
    });

    it('should keep the displayed resources when the language is switched', () => {
        // Given the reactodia view is opened with a start resource that gets seeded on the canvas.
        ReactodiaSteps.visit(SEED_RESOURCE_ENCODED);
        ReactodiaSteps.getElement(SEED_RESOURCE_LABEL).should('exist');
        ReactodiaSteps.getElements().should('have.length', 1);

        // When I switch the language.
        LanguageSelectorSteps.switchToFr();

        // Then I expect the same resources to remain visible because the layout is carried across the remount.
        ReactodiaSteps.getElements().should('have.length', 1);
        ReactodiaSteps.getElement(SEED_RESOURCE_LABEL).should('exist');
    });

    it('should keep the diagram on refresh but clear it when navigating away and back', () => {
        // Given the reactodia view is opened with a start resource that gets seeded on the canvas.
        ReactodiaSteps.visit(SEED_RESOURCE_ENCODED);
        ReactodiaSteps.getElements().should('have.length', 1);
        ReactodiaSteps.getElement(SEED_RESOURCE_LABEL).should('exist');

        // When I refresh the page.
        cy.reload();

        // Then I expect the diagram state to be preserved across the refresh.
        ReactodiaSteps.getElements().should('have.length', 1);
        ReactodiaSteps.getElement(SEED_RESOURCE_LABEL).should('exist');

        // When I navigate to another view via the navigation bar.
        MainMenuSteps.clickOnSparqlMenu();
        ReactodiaSteps.getComponent().should('not.exist');

        // Wait for the SPARQL Query & Update view to be loaded before continuing.
        // Without this wait, Cypress may try to click the Reactodia menu item before the page is fully loaded,
        // causing the test to fail intermittently with the error:
        // "This element `<li.sub-menu-item>` is not visible because it has CSS property: `display: none`"
        // when trying to click the Reactodia submenu.
        YasqeSteps.getEditor().should('be.visible');
        // And I return to the reactodia view via the navigation bar.
        MainMenuSteps.clickOnReactodia();

        // Then I expect the canvas to be cleared, because leaving the view drops the persisted diagram state.
        ReactodiaSteps.getWorkspace().should('exist');
        ReactodiaSteps.getElements().should('not.exist');
    });

    // These run against the in-code REST stub. TODO: GDB-15242 switch to intercepts when the endpoints are available.
    describe('Settings', () => {
        it('should open the settings popover', () => {
            // Given I open the reactodia view.
            ReactodiaSteps.visit();

            // When I click the Settings button.
            ReactodiaSteps.openSettings();

            // Then I expect the settings popover to be open.
            ReactodiaSteps.getSettingsPopover().should('be.visible');
            ReactodiaSteps.getBrowseButton().should('contain', 'Browse');
        });

        it('should not offer reset when the default settings are in use', () => {
            // Given I open the settings of a repository without uploaded settings.
            ReactodiaSteps.visit();
            ReactodiaSteps.openSettings();

            // Then I expect no reset action, because there is nothing to reset to.
            ReactodiaSteps.getSettingsPopover().should('be.visible');
            ReactodiaSteps.getResetButton().should('not.exist');
        });

        it('should cancel a selected file', () => {
            // Given I have selected a settings file.
            ReactodiaSteps.visit();
            ReactodiaSteps.openSettings();
            ReactodiaSteps.selectSettingsFile();
            ReactodiaSteps.getSelectedSettingsFile().should('exist');

            // When I cancel it.
            ReactodiaSteps.clickCancelFile();

            // Then I expect the file to be removed.
            ReactodiaSteps.getSettingsPopover().should('not.contain', 'settings.ttl');
            ReactodiaSteps.getUploadButton().should('be.disabled');
        });

        it('should ask for confirmation before uploading', () => {
            // Given I have selected a settings file.
            ReactodiaSteps.visit();
            ReactodiaSteps.openSettings();
            ReactodiaSteps.selectSettingsFile();

            // When I upload it.
            ReactodiaSteps.clickUpload();

            // Then I expect a confirmation that warns the diagram will be cleared.
            ReactodiaSteps.getConfirmDialog().should('be.visible').and('contain', 'will clear the diagram');

            // When I cancel.
            ReactodiaSteps.cancelDialog();

            // Then I expect the popover to stay open with the file still selected.
            ReactodiaSteps.getSettingsPopover().should('be.visible');
            ReactodiaSteps.getSelectedSettingsFile().should('exist');

            // When I upload and confirm.
            ReactodiaSteps.clickUpload();
            ReactodiaSteps.confirmDialog();

            // Then I expect a success message, the popover to close and the diagram to be rendered.
            ApplicationSteps.getSuccessNotifications().should('be.visible');
            ReactodiaSteps.getSettingsPopover().should('not.exist');
            ReactodiaSteps.getWorkspace().should('exist');
        });

        it('should ask for confirmation before resetting', () => {
            // Given the repository has uploaded settings.
            ReactodiaSteps.visit();
            ReactodiaSteps.openSettings();
            ReactodiaSteps.selectSettingsFile();
            ReactodiaSteps.clickUpload();
            ReactodiaSteps.confirmDialog();
            ReactodiaSteps.getSettingsPopover().should('not.exist');

            // When I reset them.
            ReactodiaSteps.openSettings();
            ReactodiaSteps.getResetButton().should('be.visible');
            ReactodiaSteps.clickReset();

            // Then I expect a confirmation that warns the diagram will be cleared.
            ReactodiaSteps.getConfirmDialog().should('be.visible').and('contain', 'will clear the diagram');

            // When I confirm.
            ReactodiaSteps.confirmDialog();

            // Then I expect the popover to close and the diagram to be rendered.
            ReactodiaSteps.getSettingsPopover().should('not.exist');
            ReactodiaSteps.getWorkspace().should('exist');
        });

        it('should export the current settings as a .ttl file', () => {
            // Given I open the settings.
            ReactodiaSteps.visit();
            ReactodiaSteps.openSettings();

            // When I export them.
            ReactodiaSteps.clickExport();

            // Then I expect a .ttl file named after the repository to be downloaded.
            ReactodiaSteps.verifyFileDownloaded(`graph-navigator-settings-${repositoryId}.ttl`);
        });
    });

    describe('Repository switch', () => {
        let secondRepositoryId;

        beforeEach(() => {
            secondRepositoryId = 'repository-second-' + Date.now();
            cy.createRepository({id: secondRepositoryId});
        });

        afterEach(() => {
            cy.deleteRepository(secondRepositoryId);
        });

        it('should clear the canvas when the repository is switched', () => {
            // Given the reactodia view is opened with a start resource that gets seeded on the canvas.
            ReactodiaSteps.visit(SEED_RESOURCE_ENCODED);
            ReactodiaSteps.getElements().should('have.length', 1);

            // When I switch to another repository.
            RepositorySelectorSteps.selectRepository(secondRepositoryId);

            // Then I expect the workspace to still be mounted, but the canvas to be cleared.
            ReactodiaSteps.getWorkspace().should('exist');
            ReactodiaSteps.getElements().should('not.exist');
        });
    });
});
