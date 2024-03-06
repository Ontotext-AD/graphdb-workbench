import {ModalDialogSteps} from "./modal-dialog-steps";

/**
 * Reusable functions for interacting with the import page.
 */
class ImportSteps {

    static visitUserImport(repository) {
        ImportSteps.visitImport('user', repository);
    }

    static verifyUserImportUrl() {
        cy.url().should('include', '/import#user');
    }

    static visitServerImport(repository) {
        ImportSteps.visitImport('server', repository);
    }

    static visitImport(type, repository) {
        if (repository) {
            cy.presetRepository(repository);
        }

        cy.visit('/import#' + type);

        cy.get('.ot-splash').should('not.be.visible');

        cy.get('#import-' + type).should('be.visible');

        cy.get('.ot-loader').should('not.be.visible');

        return ImportSteps;
    }

    static openImportURLDialog(importURL) {
        cy.get('#import-user .import-from-url-btn').click()
            // Forces the popover to disappear as it covers the modal and Cypress refuses to continue
            .trigger('mouseleave', {force: true});
        ImportSteps.getModal()
            .find('.url-import-form input[name="dataUrl"]')
            .type(importURL)
            .should('have.value', importURL);

        return ImportSteps;
    }

    static openImportTextSnippetDialog() {
        cy.get('#import-user .import-rdf-snippet-btn').click()
            // Forces the popover to disappear as it covers the modal and Cypress refuses to continue
            .trigger('mouseleave', {force: true});
        ImportSteps.getModal().find('#wb-import-textarea').should('be.visible');

        return ImportSteps;
    }

    static clickImportUrlButton() {
        cy.get('#wb-import-importUrl').click();

        return ImportSteps;
    }

    static selectRDFFormat(rdfFormat) {
        cy.get('.modal-footer .import-format-dropdown').within(() => {
            cy.get('.import-format-dropdown-btn').click();
            cy.get('.dropdown-item').contains(rdfFormat).click().should('not.be.visible');
        });

        return ImportSteps;
    }

    static fillRDFTextSnippet(snippet) {
        ImportSteps.getSnippetTextarea().type(snippet, { parseSpecialCharSequences: false }).should('have.value', snippet);

        return ImportSteps;
    }

    static pasteRDFTextSnippet(snippet) {
        ImportSteps.getSnippetTextarea().invoke('val', snippet).trigger('change');

        return ImportSteps;
    }

    static clickImportTextSnippetButton() {
        cy.get('#wb-import-importText').click();

        return ImportSteps;
    }

    static removeUploadedFiles() {
        ImportSteps.selectAllUserFiles();
        cy.get('#wb-import-removeEntries').click();
        ModalDialogSteps.getDialog().should('be.visible');
        ModalDialogSteps.clickOnConfirmButton();
        cy.get('#wb-import-fileInFiles').should('be.hidden');
        return ImportSteps;
    }

    static selectAllUserFiles() {
        cy.get('#import-user .select-all-files').check();

        return ImportSteps;
    }

    static getImportRdfFileElement() {
        return cy.get('#import-user');
    }

    static getImportStatusMessage() {
        return cy.get('.import-status-message');
    }

    static getImportFileRow(fileName) {
        return cy.contains('tr', fileName);
    }

    static getSnippetTextarea() {
        return cy.get('#wb-import-textarea');
    }

    static selectServerFile(filename) {
        // Forcing it because often times cypress sees it with zero width and height although it's
        // clearly visible.
        ImportSteps.getServerFileElement(filename).find('.import-file-checkbox').click({force: true});

        return ImportSteps;
    }

    static selectAllServerFiles() {
        cy.get('#import-server .select-all-files').check();

        return ImportSteps;
    }

    static importServerFiles(changeSettings) {
        if (changeSettings) {
            // TODO: Check for dialog?
            cy.get('#import-server .import-btn').scrollIntoView().click();
        } else {
            cy.get('#import-server .import-dropdown-btn').scrollIntoView().click()
                .should('have.attr', 'aria-expanded', 'true');
            cy.get('#import-server .import-without-change-btn').scrollIntoView().click();
        }

        return ImportSteps;
    }

    static clickImportOnRow(row) {
        this.getImportFileRow(row).find('.pull-right').contains('Import').click();

        return ImportSteps;
    }

    static importFromSettingsDialog() {
        // Dialog should disappear
        ImportSteps.getModal().
        find('.modal-footer > .btn-primary')
            .should('exist')
            .click()
            .should('not.exist');

        return ImportSteps;
    }

    static getSettingsForm() {
        return ImportSteps.getModal().find('.settings-form');
    }

    static fillBaseURI(baseURI) {
        ImportSteps.getSettingsForm().find('input[name="baseURI"]').type(baseURI).should('have.value', baseURI);

        return ImportSteps;
    }

    static selectNamedGraph() {
        ImportSteps.getSettingsForm().find('.named-graph-btn').check();

        return ImportSteps;
    }

    static fillNamedGraph(namedGraph) {
        ImportSteps.getSettingsForm().find('.named-graph-input').type(namedGraph).should('have.value', namedGraph);

        return ImportSteps;
    }

    static expandAdvancedSettings() {
        ImportSteps.getSettingsForm().within(() => {
            cy.get('.toggle-advanced-settings').click();
            cy.get('.advanced-settings').should('be.visible');
        });

        return ImportSteps;
    }

    static enablePreserveBNodes() {
        ImportSteps.getSettingsForm().find('input[name="preserveBNodeIDs"]').check();

        return ImportSteps;
    }

    static fillContextLink(contextLink) {
        ImportSteps.getSettingsForm().find('input[name="contextLink"]').type(contextLink).should('have.value', contextLink);

        return ImportSteps;
    }

    static setContextLinkToBeVisible() {
        ImportSteps.getSettingsForm().within(() => {
            cy.get('.contextLinkRow').invoke('attr', 'style', 'display: block !important');
        });

        return ImportSteps;
    }

    static resetStatusOfUploadedFiles() {
        // Button should disappear
        cy.get('#import-server #wb-import-clearStatuses')
            .click()
            .then((el) => {
                cy.waitUntil(() => cy.wrap(el).should('not.be.visible'));
            });

        return ImportSteps;
    }

    static resetStatusOfUploadedFile(filename) {
        // List is re-rendered -> ensure it is detached
        ImportSteps
            .getServerFileElement(filename)
            .find('.import-status .import-status-reset')
            .click()
            .should('not.exist');

        return ImportSteps;
    }

    static verifyImportStatusDetails(fileToSelect, details) {
        ImportSteps.getServerFileElement(fileToSelect).find('.import-status .import-status-info').then(infoIconEl => {
            cy.wrap(infoIconEl).should('be.visible');
            cy.wrap(infoIconEl).trigger('mouseenter');

            cy.get('.popover-content').then(content => {
                cy.wrap(content).should('be.visible');
                if (details instanceof Array) {
                    details.forEach(text => {
                        cy.wrap(content).should('contain', text);
                    })
                } else {
                    cy.wrap(content).should('contain', details);
                }
                cy.wrap(infoIconEl).trigger('mousemove', {clientX: 0, clientY: 0});

                // set timeout in order to yield the mousemove
                cy.wait(0);
            }).should('not.exist');
        });

        return ImportSteps;
    }

    static verifyImportStatus(filename, message) {
        cy.waitUntil(() =>
            ImportSteps
                .getServerFileElement(filename)
                .find('.import-status .import-status-message')
                .then(status => status && status.text().indexOf(message) > -1));

        return ImportSteps;
    }

    static verifyNoImportStatus(filename) {
        ImportSteps
            .getServerFileElement(filename)
            .find('.import-status')
            .should('not.be.visible');

        return ImportSteps;
    }

    static getServerFileElement(filename) {
        // Find the element containing the filename and get then the parent row element
        return cy.get('#wb-import-fileInFiles .import-file-header')
            .contains(filename)
            .parentsUntil('.import-file-row')
            .parent();
    }

    static getModal() {
        return cy.get('.modal')
            .should('be.visible')
            .and('not.have.class', 'ng-animate')
            .and('have.class', 'in');
    }
}

export default ImportSteps;
