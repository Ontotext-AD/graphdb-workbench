import {ModalDialogSteps} from "../modal-dialog-steps";

export class EditGraphqlEndpointSteps extends ModalDialogSteps {
    static getModalTitle() {
        return this.getDialog().find('.modal-title');
    }

    static getDynamicForm() {
        return this.getDialog().find('dynamic-form');
    }

    static getFormFields() {
        return this.getDynamicForm().find('.form-field');
    }

    static getInputField(index) {
        return this.getFormFields().find('.input-field input').eq(index);
    }

    static getBooleanField(index) {
        return this.getFormFields().find('.boolean-field input').eq(index);
    }

    static getSelectField(index) {
        return this.getFormFields().find('.select-field select').eq(index);
    }

    static getMultiSelectField(index) {
        return this.getFormFields().find('.multiselect-field multiselect-dropdown').eq(index);
    }

    static toggleMultiSelectOption(index, optionLabel) {
        this.getMultiSelectField(index)
            .within(() => {
                cy.get('button.dropdown-toggle').click();
                cy.get('ul.dropdown-menu li')
                    .contains(optionLabel)
                    .click();
            });
    }

    static verifyMultiSelectOptionSelected(index, optionLabel) {
        this.getModalTitle().click();
        this.getMultiSelectField(index)
            .within(() => {
                cy.get('button.dropdown-toggle')
                    .should('contain.text', optionLabel);
            });
    }

    static getJsonField(index) {
        return this.getFormFields().find('.json-field textarea').eq(index);
    }

    static clearJsonField(index) {
        return this.getJsonField(index).clear();
    }

    static setJsonField(index, value) {
        return this.clearJsonField(index).type(value, {parseSpecialCharSequences:false});
    }

    static fillInputField(index, value) {
        return this.getInputField(index).clear().type(value);
    }

    static checkBooleanField(index) {
        return this.getBooleanField(index).check();
    }

    static uncheckBooleanField(index) {
        return this.getBooleanField(index).uncheck();
    }

    static toggleBooleanField(index) {
        return this.getBooleanField(index).click();
    }

    static selectOption(index, option) {
        this.getSelectField(index).select(option);
    }

    static getLoader() {
        return this.getDialog().find('.graphql-endpoint-configuration-loader')
    }

    static getSavingLoader() {
        return this.getDialog().find('.saving-endpoint-settings')
    }
}
