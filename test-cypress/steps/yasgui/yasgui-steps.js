export class YasguiSteps {

    static getYasgui() {
        return cy.get('.yasgui');
    }

    static getCreateSavedQueryButton() {
        return cy.get('.yasqe_createSavedQueryButton');
    }

    static createSavedQuery() {
        this.getCreateSavedQueryButton().click();
    }

    static getSaveQueryDialog() {
        return cy.get('.dialog');
    }

    static closeSaveQueryDialog() {
        this.getSaveQueryDialog().find('.close-button').click();
    }

    static cancelSaveQuery() {
        this.getSaveQueryDialog().find('.cancel-button').click();
    }

    static getSaveQueryButton() {
        return this.getSaveQueryDialog().find('.ok-button');
    }

    static saveQuery() {
        this.getSaveQueryButton().click();
    }

    static getQueryField() {
        return this.getSaveQueryDialog().find('#query');
    }

    static writeQuery(query) {
        this.getQueryField().type(query, {parseSpecialCharSequences: false});
    }

    static clearQueryField() {
        this.getQueryField().clear();
    }

    static getQueryNameField() {
        return this.getSaveQueryDialog().find('#queryName');
    }

    static writeQueryName(queryName) {
        this.getQueryNameField().type(queryName);
    }

    static clearQueryNameField() {
        this.getQueryNameField().clear();
    }

    static toggleIsPublic() {
        this.getSaveQueryDialog().find('#publicQuery').click();
    }

    static getErrorsPane() {
        return this.getSaveQueryDialog().find('.alert-danger');
    }

    static getErrors() {
        return this.getErrorsPane().find('.error-message');
    }

    static getYasguiModeButton() {
        return cy.get('.btn-mode-yasgui');
    }

    static getYasguiTag() {
        return cy.get('ontotext-yasgui');
    }

    static getTabs() {
        return cy.get('.tab');
    }

    static openANewTab() {
        cy.get('button.addTab').click();
    }

    static isYasguiModeSelected() {
        return this.getYasguiModeButton().should('have.class', 'btn-selected');
    }

    static isYasguiModeDeselected() {
        return this.getYasguiModeButton().should('not.have.class', 'btn-selected');
    }

    static getYasqeModeButton() {
        return cy.get('.btn-mode-yasqe');
    }

    static isYasqeModeSelected() {
        return this.getYasqeModeButton().should('have.class', 'btn-selected');
    }

    static isYasqeModeDeselected() {
        return this.getYasqeModeButton().should('not.have.class', 'btn-selected');
    }

    static isVerticalOrientation() {
        this.getYasguiTag().should('have.class', 'orientation-vertical');
    }

    static getYasrModeButton() {
        return cy.get('.btn-mode-yasr');
    }

    static isYasrModeSelected() {
        return this.getYasrModeButton().should('have.class', 'btn-selected');
    }

    static getOrientationButton() {
        return cy.get('.btn-orientation');
    }

    static isBtnOrientationVerticalOrientation() {
        this.getOrientationButton().should('not.have.class', 'icon-rotate-90');
    }

    static isBtnOrientationHorizontalOrientation() {
        this.getOrientationButton().should('have.class', 'icon-rotate-90');
    }

    static switchToModeYasgui() {
        this.getYasguiModeButton().click();
    }

    static switchToModeYasqe() {
        this.getYasqeModeButton().click();
    }

    static switchToModeYasr() {
        this.getYasrModeButton().click();
    }

    static toggleOrientation() {
        this.getOrientationButton().click();
    }

    static getHideToolbarButton() {
        return cy.get('#hideToolbar');
    }

    static hideToolbar() {
        this.getHideToolbarButton().click();
    }

    static getShowToolbarButton() {
        return cy.get('#showToolbar');
    }

    static showToolbar() {
        this.getShowToolbarButton().click();
    }

    static getToolbar() {
        return cy.get('.yasgui-toolbar');
    }

    static showLayoutOrientationButtonTooltip() {
        YasguiSteps.getOrientationButton().trigger('mouseover');
    }

    static hideLayoutOrientationButtonTooltip() {
        YasguiSteps.getOrientationButton().trigger('mouseleave');
    }

    static isYasrModeDeselected() {
        return this.getYasrModeButton().should('not.have.class', 'btn-selected');
    }

    static isHorizontalOrientation() {
        this.getYasguiTag().should('have.class', 'orientation-horizontal');
    }
}
