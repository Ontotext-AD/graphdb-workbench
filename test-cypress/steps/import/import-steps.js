import {ModalDialogSteps} from "../modal-dialog-steps";

/**
 * Reusable functions for interacting with the import page.
 */
class ImportSteps {

    //
    // Template methods.
    //
    static getResourcesTable() {}
    static getHelpMessage() {}

    static createFile(filename, content) {
        return {
            contents: Cypress.Buffer.from(content),
            fileName: filename,
            mimeType: 'text/plain',
            lastModified: Date.now()
        };
    }

    static visit() {
        cy.visit('/import');
        cy.url().should('include', '/import');
    }

    static getView() {
        return cy.get('#wb-import');
    }

    static getPageInfoIcon() {
        return this.getView().find('.page-info-icon');
    }

    static showPageInfoPopover() {
        this.getPageInfoIcon().realHover();
    }

    static getPageInfoPopover() {
        return cy.get('.help-info');
    }

    static visitUserImport(repository) {
        this.visitImport('user', repository);
    }

    static verifyUserImportUrl() {
        cy.url().should('include', '/import#user');
    }

    static visitServerImport(repository) {
        this.visitImport('server', repository);
    }

    static getImportUrlInput() {
        return this.getModal().find('.url-import-form input[name="dataUrl"]');
    }

    static visitImport(type, repository) {
        if (repository) {
            cy.presetRepository(repository);
        }

        cy.visit('/import#' + type);

        // cy.get('.ot-splash').should('not.be.visible');

        cy.get('#import-' + type).should('be.visible');

        // cy.get('.ot-loader').should('not.be.visible');

        return this;
    }

    static closePopover() {
        cy.get('.popover.in').click();
    }

    static getFilterField() {
        return this.getResourcesTable().find('#fileQuery');
    }

    static typeInFilterField(query) {
        return this.getFilterField().type(query);
    }

    static getTabs() {
        return this.getView().find('.nav-tabs .nav-item');
    }

    static getActiveTab() {
        return this.getTabs().find('.nav-link.active');
    }

    static openUserDataTab() {
        // cy.get('.ot-loader').should('not.be.visible');
        return this.getTabs().eq(0).click();
    }

    static getUserDataTab() {
        return this.getView().find('#import-user');
    }

    static getServerFilesTab() {
        return this.getView().find('#import-server');
    }

    static openServerFilesTab() {
        // cy.get('.ot-loader').should('not.be.visible');
        return this.getTabs().eq(1).click();
    }

    static getUploadRdfFilesButton() {
        return this.getView().find('.upload-rdf-files-btn');
    }

    static getUploadFromUrlButton() {
        return this.getView().find('.import-from-url-btn');
    }

    static getUploadTextSnippetButton() {
        return this.getView().find('.import-from-url-btn');
    }

    static getFileSizeLimitWarning() {
        return this.getView().find('.file-size-limit-warning');
    }

    static openServerFilesTabFromWarning() {
        this.getFileSizeLimitWarning().find('.server-files-tab-link').click();
    }

    static openAPIViewFromWarning() {
        this.getFileSizeLimitWarning().find('.api-link').click();
    }

    static copyMaxFileSizeLimitProperty() {
        return this.getImportUserDataHelp().find('.copy-btn').click();
    }

    static getClipboardTextContent() {
        return cy.window().its('navigator.clipboard').invoke('readText').then((text) => text);
    }

    static openHelpMessage() {
        this.getView().find('.toggle-help-btn').click();
    }

    static closeHelpMessage() {
        return this.getHelpMessage().find('button.close').click();
    }

    static getResources() {
        return this.getResourcesTable().find('.row.title-row');
    }

    static getSelectedResources() {
        return this.getResources().find('.select-checkbox:checked');
    }

    static getSelectedResourceName(index) {
        return this.getSelectedResources().eq(index).closest('.title-row');
    }

    static getResource(index) {
        return this.getResources().eq(index);
    }

    static getResourceByName(name) {
        return this.getResources().find('.cell-title').contains(name)
            .closest('.row.title-row');
    }

    static selectFileByIndex(index) {
        this.getResource(index).find('.select-checkbox').click();
    }

    static selectFileByName(name) {
        this.getResourceByName(name).find('.select-checkbox').click();
    }

    static deselectFileByName(name) {
        this.getResourceByName(name).find('.select-checkbox').click();
    }

    static getResourceStatus(name) {
        return this.getResourceByName(name).next().find('import-resource-message');
    }

    static getImportedResourcesStates() {
        return this.getResources().find('.import-resource-message');
    }

    static checkImportedResource(index, resourceName, expectedStatus) {
        const status = expectedStatus || 'Imported successfully';
        this.getResourceByName(resourceName).should('contain', resourceName);
        this.getResourceStatus(resourceName).should('contain', status);
    }

    static checkUserDataUploadedResource(index, resourceName) {
        // this.getResource(index).should('contain', resourceName);
        this.getResourceByName(resourceName).should('contain', resourceName);
        this.getResourceStatus(resourceName).should('be.hidden');
    }

    static getStatusSelectMenu() {
        return this.getResourcesTable().find('.import-resource-status-dropdown');
    }

    static openStatusSelectMenu() {
        return this.getStatusSelectMenu().click().find('.dropdown-menu .dropdown-item');
    }

    static selectAllResources() {
        this.openStatusSelectMenu().contains('All').click();
    }

    static deselectAllResources() {
        this.openStatusSelectMenu().contains('None').click();
    }

    static selectImportedResources() {
        this.openStatusSelectMenu().contains('Imported').click();
    }

    static selectNotImportedResources() {
        this.openStatusSelectMenu().contains('Not imported').click();
    }

    static getBatchImportButton() {
        return this.getResourcesTable().find('.batch-import-btn');
    }

    static batchImport() {
        this.getBatchImportButton().click();
    }

    static batchImportWithoutChangingDefaultSettings() {
        this.getResourcesTable().find('.batch-import-dropdown .dropdown-toggle').click();
        this.getResourcesTable().find('.batch-import-without-change-btn').click();
    }

    static getBatchResetButton() {
        return this.getResourcesTable().find('.batch-reset-btn');
    }

    static batchReset() {
        this.getBatchResetButton().click();
    }

    static getRemoveResourcesButton() {
        return this.getResourcesTable().find('.remove-resources-btn');
    }

    static removeSelectedResources() {
        this.getRemoveResourcesButton().click();
    }

    static deleteUploadedFile(index) {
        this.getResource(index).find('.import-resource-action-remove-btn').click();
    }

    static importFile(index) {
        this.getResource(index).find('.import-resource-action-import-btn').click();
    }

    static importFileByName(name) {
        this.getResourceByName(name).find('.import-resource-action-import-btn').click();
    }

    static resetFileStatus(index) {
        this.getResource(index).find('.import-resource-action-reset-btn').click();
    }

    static resetFileStatusByName(name) {
        this.getResourceByName(name).find('.import-resource-action-reset-btn').click();
    }

    static getServerFilesTable() {
        return this.getView().find('#import-server table');
    }

    static openFileUploadDialog() {
        this.getUploadRdfFilesButton().find('#wb-import-uploadFile').click();
    }

    static selectFile(files) {
        cy.get('input[type=file]').selectFile(files, {force: true});
    }

    static uploadFile(filePath) {
        const filePathsList = Array.isArray(filePath)? filePath : [filePath];
        cy.fixtures(filePathsList).then((files) => {
            const aliases = filePathsList.map((filePath, i) => `@file-${i}`);
            // with force because the field is hidden
            cy.get('input[type=file]').selectFile(aliases, {force: true});
        });
    }

    static openImportURLDialog(importURL) {
        cy.get('#import-user .import-from-url-btn').click();
        // Forces the popover to disappear as it covers the modal and Cypress refuses to continue
        this.closePopover();
        this.getImportUrlInput().type(importURL).should('have.value', importURL);
        this.closePopover();
        return this;
    }

    static clickImportUrlButton() {
        cy.get('#wb-import-importUrl').click();

        return this;
    }

    static removeUploadedFiles() {
        this.selectAllUserFiles();
        cy.get('#wb-import-removeEntries').click();
        ModalDialogSteps.getDialog().should('be.visible');
        ModalDialogSteps.clickOnConfirmButton();
        cy.get('#wb-import-fileInFiles').should('be.hidden');
        return this;
    }

    static selectAllUserFiles() {
        cy.get('#import-user .select-all-files').check();

        return this;
    }

    static getImportRdfFileElement() {
        return cy.get('#import-user');
    }

    static getImportStatusMessage() {
        return cy.get('.import-status-message');
    }

    static getImportStatusRow(index = 0) {
        return cy.get('.import-resource-message').eq(index);
    }

    static getSnippetTextarea() {
        return cy.get('#wb-import-textarea');
    }

    static selectAllServerFiles() {
        cy.get('#import-server .select-all-files').check();

        return this;
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

        return this;
    }

    static clickImportOnRow(row) {
        cy.get('.import-file-btn').contains('Import').click();

        return this;
    }

    static resetStatusOfUploadedFiles() {
        // Button should disappear
        cy.get('#import-server #wb-import-clearStatuses')
            .click()
            .then((el) => {
                cy.waitUntil(() => cy.wrap(el).should('not.be.visible'));
            });

        return this;
    }

    static resetStatusOfUploadedFile(filename) {
        // List is re-rendered -> ensure it is detached
        this
            .getServerFileElement(filename)
            .find('.import-status .import-status-reset')
            .click()
            .should('not.exist');

        return this;
    }

    static verifyImportStatusDetails(fileToSelect, details) {
        this.getServerFileElement(fileToSelect).find('.import-status .import-status-info').then(infoIconEl => {
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

        return this;
    }

    static verifyImportStatus(filename, message) {
        cy.waitUntil(() =>
            this
                .getServerFileElement(filename)
                .find('.import-status .import-status-message')
                .then(status => status && status.text().indexOf(message) > -1));

        return this;
    }

    static verifyNoImportStatus(filename) {
        this
            .getServerFileElement(filename)
            .find('.import-status')
            .should('not.be.visible');

        return this;
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
