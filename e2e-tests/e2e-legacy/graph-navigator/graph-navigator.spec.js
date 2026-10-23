import {GraphNavigatorSteps} from '../../steps/graph-navigator-steps.js';
import {LanguageSelectorSteps} from '../../steps/language-selector-steps.js';
import {RepositorySelectorSteps} from '../../steps/repository-selector-steps.js';
import {MainMenuSteps} from '../../steps/main-menu-steps.js';
import {YasqeSteps} from '../../steps/yasgui/yasqe-steps.js';
import {YasrSteps} from '../../steps/yasgui/yasr-steps.js';
import {ToasterSteps} from '../../steps/toaster-steps.js';
import {GraphNavigatorStubs} from '../../stubs/graph-navigator-stubs.js';

const FILE_TO_IMPORT = 'resource-test-data.ttl';
const SEED_RESOURCE_ENCODED = 'http:%2F%2Fexample.com%2Fontology%23CustomerLoyalty';
const SEED_RESOURCE_LABEL = 'CustomerLoyalty';
const SETTINGS_FILE_NAME = 'graph-navigator-settings.ttl';
const SETTINGS_FILE = `fixtures/graph-navigator/${SETTINGS_FILE_NAME}`;

const CONSTRUCT_QUERY = 'CONSTRUCT { <http://example.com/ontology#CustomerLoyalty> ?p ?o } WHERE { <http://example.com/ontology#CustomerLoyalty> ?p ?o }';
const CONSTRUCT_TARGET_LABEL = 'Metric';
// TODO: Remove once GraphDB creates the system repository itself.
// The graph-navigator settings endpoint requires this repository.
const SYSTEM_REPOSITORY_ID = 'SystemRepository';

describe('Graph Navigator', () => {
    let repositoryId;

    // TODO: Remove once GraphDB creates the system repository itself.
    before(() => {
        cy.deleteRepository(SYSTEM_REPOSITORY_ID);
        cy.createRepository({id: SYSTEM_REPOSITORY_ID});
    });

    // TODO: Remove once GraphDB creates the system repository itself.
    after(() => {
        cy.deleteRepository(SYSTEM_REPOSITORY_ID);
    });

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

    it('should show an error toast, when a graph request fails', () => {
        // Given the repository's SPARQL requests fail.
        cy.intercept('POST', `/repositories/${repositoryId}`, {statusCode: 500}).as('graphRequest');

        // When I open the Graph Navigator view with a start resource.
        GraphNavigatorSteps.visit(SEED_RESOURCE_ENCODED);
        cy.wait('@graphRequest');

        // Then I expect an error toast about the graph data.
        ToasterSteps.getToasterMessage().should('contain', 'Could not load the graph data.');
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
            GraphNavigatorSteps.selectSettingsFile(SETTINGS_FILE);
            GraphNavigatorSteps.getSelectedSettingsFile(SETTINGS_FILE_NAME).should('exist');

            // When I cancel it.
            GraphNavigatorSteps.clickCancelFile();

            // Then I expect the file to be removed.
            GraphNavigatorSteps.getSettingsPopover().should('not.contain', SETTINGS_FILE_NAME);
            GraphNavigatorSteps.getUploadButton().should('be.disabled');
        });

        it('should ask for confirmation before uploading', () => {
            // Given I have selected a settings file.
            GraphNavigatorSteps.visit();
            GraphNavigatorSteps.openSettings();
            GraphNavigatorSteps.selectSettingsFile(SETTINGS_FILE);

            // When I upload it.
            GraphNavigatorSteps.clickUpload();

            // Then I expect a confirmation that warns the diagram may behave unexpectedly.
            GraphNavigatorSteps.getConfirmDialog().should('be.visible')
                .and('contain', 'The diagram might behave unexpectedly with the new settings.');

            // When I cancel.
            GraphNavigatorSteps.cancelDialog();

            // Then I expect the popover to stay open with the file still selected.
            GraphNavigatorSteps.getSettingsPopover().should('be.visible');
            GraphNavigatorSteps.getSelectedSettingsFile(SETTINGS_FILE_NAME).should('exist');

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
            GraphNavigatorSteps.selectSettingsFile(SETTINGS_FILE);
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

    describe('Autocomplete warning', () => {
        beforeEach(() => {
            GraphNavigatorStubs.stubSettingsWithAutocomplete();
        });

        it('should warn once that autocomplete is off and redirect to the autocomplete view', () => {
            // Given the settings use autocomplete, but autocomplete is off.
            GraphNavigatorSteps.visit();
            cy.wait('@graph-navigator-settings');

            // When I search for entities twice.
            GraphNavigatorSteps.searchEntities(SEED_RESOURCE_LABEL);
            GraphNavigatorSteps.searchEntities(SEED_RESOURCE_LABEL);

            // Then I expect a single warning that autocomplete is off.
            ToasterSteps.verifyWarning('Autocomplete is OFF');
            ToasterSteps.getToast().find('.toast-warning').should('have.length', 1);

            // When I click the warning.
            ToasterSteps.getToast().find('.toast-warning').click();

            // Then I expect to be redirected to the autocomplete view.
            cy.url().should('include', '/autocomplete');
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

        it('should warn that autocomplete is off once per repository', () => {
            // Given the settings use autocomplete, but autocomplete is off.
            GraphNavigatorStubs.stubSettingsWithAutocomplete();
            GraphNavigatorSteps.visit();
            cy.wait('@graph-navigator-settings');

            // When I search for entities.
            GraphNavigatorSteps.searchEntities(SEED_RESOURCE_LABEL);

            // Then I expect a warning that autocomplete is off.
            ToasterSteps.getToast().find('.toast-warning').should('have.length', 1);

            // When I switch to another repository and search for entities.
            RepositorySelectorSteps.selectRepository(secondRepositoryId);
            cy.wait('@graph-navigator-settings');
            GraphNavigatorSteps.searchEntities(SEED_RESOURCE_LABEL);

            // Then I expect a second warning, for the new repository.
            ToasterSteps.getToast().find('.toast-warning').should('have.length', 2);

            // When I switch back to the first repository and search for entities.
            RepositorySelectorSteps.selectRepository(repositoryId);
            cy.wait('@graph-navigator-settings');
            GraphNavigatorSteps.searchEntities(SEED_RESOURCE_LABEL);

            // Then I expect no new warning, because I was already warned for it.
            ToasterSteps.getToast().find('.toast-warning').should('have.length', 2);
        });
    });
});
