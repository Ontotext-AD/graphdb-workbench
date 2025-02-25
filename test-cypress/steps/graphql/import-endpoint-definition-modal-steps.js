import {ModalDialogSteps} from "../modal-dialog-steps";

export class ImportEndpointDefinitionModalSteps extends ModalDialogSteps {

    static getFileselectorButton() {
        return this.getDialogBody().find('.file-selector-btn');
    }

    static getUploadButton() {
        return this.getDialogBody().find('.upload-btn');
    }

    static upload() {
        this.getUploadButton().click();
    }

    static getAbortButton() {
        return this.getDialogBody().find('.abort-upload-btn');
    }

    static selectFile(filePaths) {
        if (Array.isArray(filePaths)) {
            cy.get('input[type="file"]').attachFile(filePaths);
        } else {
            cy.get('input[type="file"]').attachFile(filePaths);
        }
    }

    static getSelectedFiles() {
        return this.getDialogBody().find('.file-list .file-item');
    }

    static getFileItem(index) {
        return this.getSelectedFiles().eq(index);
    }

    static getSelectedFileName(index) {
        return this.getFileItem(index).find('.file-name');
    }

    static getSelectedFileSize(index) {
        return this.getFileItem(index).find('.file-size');
    }

    static getImportStatus(index) {
        return this.getFileItem(index).find('.import-status .status');
    }

    static getGeneratedEndpointLink(index) {
        return this.getFileItem(index).find('.endpoint-link');
    }

    static getReportLink(index) {
        return this.getFileItem(index).find('.report-link');
    }

    static openReport(index) {
        this.getReportLink(index).click();
    }

    static getRemoveSelectedFileButton(index) {
        return this.getFileItem(index).find('.remove-file-btn');
    }

    static removeSelectedFile(index) {
        this.getRemoveSelectedFileButton(index).click();
    }

    static getProgressBar() {
        return this.getDialogBody().find('.progress-bar');
    }

    static getValidationErrors() {
        return this.getDialogBody().find('.validation-errors');
    }

    static getValidationError(index) {
        return this.getValidationErrors().find('.error').eq(index);
    }
}
