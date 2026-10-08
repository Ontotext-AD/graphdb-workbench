import {BaseSteps} from "./base-steps.js";

const VIEW_URL = '/graph-navigator';

export class GraphNavigatorSteps extends BaseSteps {

    static visit(uri) {
        cy.visit(`${VIEW_URL}${uri ? ('?uri=' + uri) : ''}`);
    }

    static visitWithQuery(query, {inference = false, sameAs = false} = {}) {
        cy.visit(`${VIEW_URL}?query=${encodeURIComponent(query)}&inference=${inference}&sameAs=${sameAs}`);
    }

    static verifyUrl() {
        this.validateUrl(`${Cypress.config('baseUrl')}${VIEW_URL}`);
    }

    static verifyStartResourceUri(uri) {
        cy.getQueryParam('uri').should('eq', uri);
    }

    static verifyOnlyRepositoryParam(repositoryId) {
        cy.location('search').should('eq', `?repositoryId=${repositoryId}`);
    }

    static getComponent() {
        return cy.get('graphwise-reactodia');
    }

    static getWorkspace() {
        return GraphNavigatorSteps.getComponent().find('.reactodia-workspace');
    }

    static getCanvas() {
        return GraphNavigatorSteps.getComponent().find('.reactodia-canvas');
    }

    static getElements() {
        return GraphNavigatorSteps.getCanvas().find('[data-element-id]');
    }

    static getElement(text) {
        return GraphNavigatorSteps.getCanvas().find(`[data-element-id]`).contains(text).first();
    }

    static getSettingsButton() {
        return cy.get('[data-test="graph-navigator-settings-btn"]');
    }

    static openSettings() {
        GraphNavigatorSteps.getSettingsButton().click();
    }

    static closeSettings() {
        GraphNavigatorSteps.getCanvas().click('bottomLeft');
    }

    static getSettingsPopover() {
        return cy.get('[data-test="graph-navigator-settings-popover"]');
    }

    static getSettingsFileInput() {
        return this.getByTestId('graph-navigator-settings-upload').find('.p-fileupload-choose-button input[type=file]');
    }

    static selectSettingsFile(fileName = 'settings.ttl', contents = '@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .') {
        // PrimeNG hides the file input (display: none), so force is needed to select a file on it.
        this.getSettingsFileInput()
            .selectFile({contents: Cypress.Buffer.from(contents), fileName, mimeType: 'text/turtle'}, {force: true});
    }

    static getSelectedSettingsFile(fileName = 'settings.ttl') {
        return GraphNavigatorSteps.getSettingsPopover().contains(fileName);
    }

    static getUploadButton() {
        return GraphNavigatorSteps.getSettingsPopover().find('.p-fileupload-upload-button');
    }

    static clickUpload() {
        GraphNavigatorSteps.getUploadButton().click();
    }

    static clickCancelFile() {
        GraphNavigatorSteps.getSettingsPopover().find('.p-fileupload-cancel-button').click();
    }

    static getBrowseButton() {
        return GraphNavigatorSteps.getSettingsPopover().find('.p-fileupload-choose-button');
    }

    static clickExport() {
        cy.get('[data-test="graph-navigator-settings-export-btn"] button').click();
    }

    static getResetButton() {
        return cy.get('[data-test="graph-navigator-settings-reset-btn"] button');
    }

    static clickReset() {
        GraphNavigatorSteps.getResetButton().click();
    }

    static getConfirmDialog() {
        return cy.get('.modal-dialog');
    }

    static confirmDialog() {
        GraphNavigatorSteps.getConfirmDialog().find('.confirm-btn').click();
    }

    static cancelDialog() {
        GraphNavigatorSteps.getConfirmDialog().find('.cancel-btn').click();
    }

    static verifyFileDownloaded(fileName) {
        cy.readFile('cypress/downloads/' + fileName);
    }
}
