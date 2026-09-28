import {BaseSteps} from "./base-steps.js";

const VIEW_URL = '/reactodia';

export class ReactodiaSteps extends BaseSteps {

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

    static getComponent() {
        return cy.get('graphwise-reactodia');
    }

    static getWorkspace() {
        return ReactodiaSteps.getComponent().find('.reactodia-workspace');
    }

    static getCanvas() {
        return ReactodiaSteps.getComponent().find('.reactodia-canvas');
    }

    static getElements() {
        return ReactodiaSteps.getCanvas().find('[data-element-id]');
    }

    static getElement(text) {
        return ReactodiaSteps.getCanvas().find(`[data-element-id]`).contains(text).first();
    }

    static getSettingsButton() {
        return cy.get('[data-test="reactodia-settings-btn"]');
    }

    static openSettings() {
        ReactodiaSteps.getSettingsButton().click();
    }

    static getSettingsPopover() {
        return cy.get('[data-test="reactodia-settings-popover"]');
    }

    static selectSettingsFile(fileName = 'settings.ttl', contents = '@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .') {
        ReactodiaSteps.getSettingsPopover().find('input[type=file]')
            .selectFile({contents: Cypress.Buffer.from(contents), fileName, mimeType: 'text/turtle'}, {force: true});
    }

    static getSelectedSettingsFile(fileName = 'settings.ttl') {
        return ReactodiaSteps.getSettingsPopover().contains(fileName);
    }

    static getUploadButton() {
        return ReactodiaSteps.getSettingsPopover().find('.p-fileupload-upload-button');
    }

    static clickUpload() {
        ReactodiaSteps.getUploadButton().click();
    }

    static clickCancelFile() {
        ReactodiaSteps.getSettingsPopover().find('.p-fileupload-cancel-button').click();
    }

    static getBrowseButton() {
        return ReactodiaSteps.getSettingsPopover().find('.p-fileupload-choose-button');
    }

    static clickExport() {
        cy.get('[data-test="reactodia-settings-export-btn"] button').click();
    }

    static getResetButton() {
        return cy.get('[data-test="reactodia-settings-reset-btn"] button');
    }

    static clickReset() {
        ReactodiaSteps.getResetButton().click();
    }

    static getConfirmDialog() {
        return cy.get('.modal-dialog');
    }

    static confirmDialog() {
        ReactodiaSteps.getConfirmDialog().find('.confirm-btn').click();
    }

    static cancelDialog() {
        ReactodiaSteps.getConfirmDialog().find('.cancel-btn').click();
    }

    static verifyFileDownloaded(fileName) {
        cy.readFile('cypress/downloads/' + fileName);
    }
}
