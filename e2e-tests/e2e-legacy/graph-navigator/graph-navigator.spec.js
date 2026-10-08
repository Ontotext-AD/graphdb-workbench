import {GraphNavigatorSteps} from '../../steps/graph-navigator-steps.js';
import {LanguageSelectorSteps} from '../../steps/language-selector-steps.js';
import {RepositorySelectorSteps} from '../../steps/repository-selector-steps.js';
import {MainMenuSteps} from '../../steps/main-menu-steps.js';
import {YasqeSteps} from '../../steps/yasgui/yasqe-steps.js';
import {YasrSteps} from '../../steps/yasgui/yasr-steps.js';
import {ToasterSteps} from '../../steps/toaster-steps.js';

const FILE_TO_IMPORT = 'resource-test-data.ttl';
const SEED_RESOURCE_ENCODED = 'http:%2F%2Fexample.com%2Fontology%23CustomerLoyalty';
const SEED_RESOURCE_LABEL = 'CustomerLoyalty';

const CONSTRUCT_QUERY = 'CONSTRUCT { <http://example.com/ontology#CustomerLoyalty> ?p ?o } WHERE { <http://example.com/ontology#CustomerLoyalty> ?p ?o }';
const CONSTRUCT_TARGET_LABEL = 'Metric';

describe('Graph Navigator', () => {
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

    it('should mount the Graph Navigator workspace when a repository is active', () => {
        // Given I open the Graph Navigator view without a start resource.
        GraphNavigatorSteps.visit();

        // Then I expect the Graph Navigator workspace and its canvas to be rendered.
        GraphNavigatorSteps.getWorkspace().should('exist');
        GraphNavigatorSteps.getCanvas().should('exist');

        // And I expect the canvas to start empty because no start resource was provided.
        GraphNavigatorSteps.getElements().should('not.exist');
    });

    it('should place the start resource on the canvas as a seed', () => {
        // Given I open the Graph Navigator view with a start resource.
        GraphNavigatorSteps.visit(SEED_RESOURCE_ENCODED);

        // Then I expect the start resource to be placed on the canvas as a seed element.
        GraphNavigatorSteps.getElements().should('have.length', 1);
        GraphNavigatorSteps.getElement(SEED_RESOURCE_LABEL).should('exist');
    });

    it('should seed the canvas with the graph computed from a CONSTRUCT query', () => {
        // Given I open the Graph Navigator view with a CONSTRUCT query, as sent from the SPARQL editor.
        GraphNavigatorSteps.visitWithQuery(CONSTRUCT_QUERY);

        // Then I expect the computed graph to be seeded on the canvas: the subject and its related resource.
        GraphNavigatorSteps.getElements().should('have.length', 2);
        GraphNavigatorSteps.getElement(SEED_RESOURCE_LABEL).should('exist');
        GraphNavigatorSteps.getElement(CONSTRUCT_TARGET_LABEL).should('exist');
    });

    it('should unmount and mount the diagram component without errors', () => {
        // Given I have opened the Graph Navigator view, so its diagram component is already loaded.
        GraphNavigatorSteps.visit();
        GraphNavigatorSteps.getWorkspace().should('exist');
        // And I have navigated to the SPARQL editor and executed a CONSTRUCT query.
        MainMenuSteps.clickOnSparqlMenu();
        YasqeSteps.getEditor().should('be.visible');
        YasqeSteps.pasteQuery(CONSTRUCT_QUERY);
        YasqeSteps.executeQuery();

        // When I click on the "Graph Navigator" button.
        YasrSteps.visualizeInGraphNavigator();

        // Then I expect to be navigated to the Graph Navigator view, so it renders a second time
        GraphNavigatorSteps.getComponent().should('exist');
        // And I expect the computed graph to be seeded on the canvas: the subject and its related resource.
        GraphNavigatorSteps.getElements().should('have.length', 2);
        GraphNavigatorSteps.getElement(SEED_RESOURCE_LABEL).should('exist');
        GraphNavigatorSteps.getElement(CONSTRUCT_TARGET_LABEL).should('exist');
    });

    it('should keep the displayed resources when the language is switched', () => {
        // Given the Graph Navigator view is opened with a start resource that gets seeded on the canvas.
        GraphNavigatorSteps.visit(SEED_RESOURCE_ENCODED);
        GraphNavigatorSteps.getElement(SEED_RESOURCE_LABEL).should('exist');
        GraphNavigatorSteps.getElements().should('have.length', 1);

        // When I switch the language.
        LanguageSelectorSteps.switchToFr();

        // Then I expect the same resources to remain visible because the layout is carried across the remount.
        GraphNavigatorSteps.getElements().should('have.length', 1);
        GraphNavigatorSteps.getElement(SEED_RESOURCE_LABEL).should('exist');
    });

    it('should keep the diagram on refresh but clear it when navigating away and back', () => {
        // Given the Graph Navigator view is opened with a start resource that gets seeded on the canvas.
        GraphNavigatorSteps.visit(SEED_RESOURCE_ENCODED);
        GraphNavigatorSteps.getElements().should('have.length', 1);
        GraphNavigatorSteps.getElement(SEED_RESOURCE_LABEL).should('exist');

        // When I refresh the page.
        cy.reload();

        // Then I expect the diagram state to be preserved across the refresh.
        GraphNavigatorSteps.getElements().should('have.length', 1);
        GraphNavigatorSteps.getElement(SEED_RESOURCE_LABEL).should('exist');

        // When I navigate to another view via the navigation bar.
        MainMenuSteps.clickOnSparqlMenu();
        GraphNavigatorSteps.getComponent().should('not.exist');

        // Wait for the SPARQL Query & Update view to be loaded before continuing.
        // Without this wait, Cypress may try to click the Graph Navigator menu item before the page is fully loaded,
        // causing the test to fail intermittently with the error:
        // "This element `<li.sub-menu-item>` is not visible because it has CSS property: `display: none`"
        // when trying to click the Graph Navigator submenu.
        YasqeSteps.getEditor().should('be.visible');
        // And I return to the Graph Navigator view via the navigation bar.
        MainMenuSteps.clickOnGraphNavigator();

        // Then I expect the canvas to be cleared, because leaving the view drops the persisted diagram state.
        GraphNavigatorSteps.getWorkspace().should('exist');
        GraphNavigatorSteps.getElements().should('not.exist');
    });

    // These run against the in-code REST stub. TODO: GDB-15242 switch to intercepts when the endpoints are available.
    describe('Settings', () => {
        it('should open the settings popover', () => {
            // Given I open the Graph Navigator view.
            GraphNavigatorSteps.visit();

            // When I click the Settings button.
            GraphNavigatorSteps.openSettings();

            // Then I expect the settings popover to be open.
            GraphNavigatorSteps.getSettingsPopover().should('be.visible');
            GraphNavigatorSteps.getBrowseButton().should('contain', 'Browse');
        });

        it('should not offer reset when the default settings are in use', () => {
            // Given I open the settings of a repository without uploaded settings.
            GraphNavigatorSteps.visit();
            GraphNavigatorSteps.openSettings();

            // Then I expect no reset action, because there is nothing to reset to.
            GraphNavigatorSteps.getSettingsPopover().should('be.visible');
            GraphNavigatorSteps.getResetButton().should('not.exist');
        });

        it('should cancel a selected file', () => {
            // Given I have selected a settings file.
            GraphNavigatorSteps.visit();
            GraphNavigatorSteps.openSettings();
            GraphNavigatorSteps.selectSettingsFile();
            GraphNavigatorSteps.getSelectedSettingsFile().should('exist');

            // When I cancel it.
            GraphNavigatorSteps.clickCancelFile();

            // Then I expect the file to be removed.
            GraphNavigatorSteps.getSettingsPopover().should('not.contain', 'settings.ttl');
            GraphNavigatorSteps.getUploadButton().should('be.disabled');
        });

        it('should ask for confirmation before uploading', () => {
            // Given I have selected a settings file.
            GraphNavigatorSteps.visit();
            GraphNavigatorSteps.openSettings();
            GraphNavigatorSteps.selectSettingsFile();

            // When I upload it.
            GraphNavigatorSteps.clickUpload();

            // Then I expect a confirmation that warns the diagram may behave unexpectedly.
            GraphNavigatorSteps.getConfirmDialog().should('be.visible')
                .and('contain', 'The diagram might behave unexpectedly with the new settings.');

            // When I cancel.
            GraphNavigatorSteps.cancelDialog();

            // Then I expect the popover to stay open with the file still selected.
            GraphNavigatorSteps.getSettingsPopover().should('be.visible');
            GraphNavigatorSteps.getSelectedSettingsFile().should('exist');

            // When I upload and confirm.
            GraphNavigatorSteps.clickUpload();
            GraphNavigatorSteps.confirmDialog();

            // Then I expect a success message and the diagram to be rendered.
            ToasterSteps.verifySuccess('The settings were uploaded');
            GraphNavigatorSteps.getWorkspace().should('exist');
        });

        it('should ask for confirmation before resetting', () => {
            // Given the repository has uploaded settings.
            GraphNavigatorSteps.visit();
            GraphNavigatorSteps.openSettings();
            GraphNavigatorSteps.selectSettingsFile();
            GraphNavigatorSteps.clickUpload();
            GraphNavigatorSteps.confirmDialog();
            ToasterSteps.verifySuccess('The settings were uploaded');

            // When I click outside the settings.
            GraphNavigatorSteps.closeSettings();

            // Then I expect the popover to close.
            GraphNavigatorSteps.getSettingsPopover().should('not.exist');

            // When I reset them.
            GraphNavigatorSteps.openSettings();
            GraphNavigatorSteps.getResetButton().should('be.visible');
            GraphNavigatorSteps.clickReset();

            // Then I expect a confirmation that warns the diagram may behave unexpectedly.
            GraphNavigatorSteps.getConfirmDialog().should('be.visible')
                .and('contain', 'The diagram might behave unexpectedly with the default settings.');

            // When I confirm.
            GraphNavigatorSteps.confirmDialog();

            // Then I expect a success message and the diagram to be rendered.
            ToasterSteps.verifySuccess('The settings were reset to the defaults');
            GraphNavigatorSteps.getWorkspace().should('exist');
        });

        it('should export the current settings as a .ttl file', () => {
            // Given I open the settings.
            GraphNavigatorSteps.visit();
            GraphNavigatorSteps.openSettings();

            // When I export them.
            GraphNavigatorSteps.clickExport();

            // Then I expect a .ttl file named after the repository to be downloaded.
            GraphNavigatorSteps.verifyFileDownloaded(`graph-navigator-settings-${repositoryId}.ttl`);
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
            // Given the Graph Navigator view is opened with a start resource that gets seeded on the canvas.
            GraphNavigatorSteps.visit(SEED_RESOURCE_ENCODED);
            GraphNavigatorSteps.getElements().should('have.length', 1);

            // When I switch to another repository.
            RepositorySelectorSteps.selectRepository(secondRepositoryId);

            // Then I expect a confirmation that warns the diagram will be cleared.
            GraphNavigatorSteps.getConfirmDialog().should('be.visible')
                .and('contain', 'The diagram will be cleared.');

            // When I cancel.
            GraphNavigatorSteps.cancelDialog();

            // Then I expect the repository, the canvas and the start resource in the URL to be kept.
            GraphNavigatorSteps.getElements().should('have.length', 1);
            GraphNavigatorSteps.verifyStartResourceUri(decodeURIComponent(SEED_RESOURCE_ENCODED));

            // When I switch to another repository and confirm.
            RepositorySelectorSteps.selectRepository(secondRepositoryId);
            GraphNavigatorSteps.confirmDialog();

            // Then I expect the workspace to still be mounted, but the canvas to be cleared.
            GraphNavigatorSteps.getWorkspace().should('exist');
            GraphNavigatorSteps.getElements().should('not.exist');

            // And I expect the URL to hold only the new repository.
            GraphNavigatorSteps.verifyOnlyRepositoryParam(secondRepositoryId);

            // When I refresh the page.
            cy.reload();

            // Then I expect the canvas to stay empty, because the start resource is no longer in the URL.
            GraphNavigatorSteps.getWorkspace().should('exist');
            GraphNavigatorSteps.getElements().should('not.exist');
            GraphNavigatorSteps.verifyOnlyRepositoryParam(secondRepositoryId);
        });
    });
});
