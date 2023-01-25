export class YasguiSteps {

    static getYasgui() {
        return cy.get('.yasgui');
    }

    static getYasguiTag() {
        return cy.get('ontotext-yasgui');
    }

    static openANewTab() {
        cy.get('button.addTab').click();
    }

    static getTabs() {
        return cy.get('.tab');
    }

    static getCurrentTab() {
        return cy.get('.tab.active');
    }

    static openTab(index) {
        this.getTabs().eq(index).click();
    }

    static getTabQuery(tabIndex) {
        return cy.get('.yasqe .CodeMirror').then((el) => {
            return el[tabIndex].CodeMirror.getValue();
        });
    }

    static getCreateSavedQueryButton() {
        return cy.get('.yasqe_createSavedQueryButton');
    }

    static createSavedQuery() {
        this.getCreateSavedQueryButton().click();
    }

    static getShowSavedQueriesButton() {
        return cy.get('.yasqe_showSavedQueriesButton');
    }

    static showSavedQueries() {
        this.getShowSavedQueriesButton().click();
    }

    static getYasguiModeButton() {
        return cy.get('.btn-mode-yasgui');
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

    static getDeleteQueryConfirmation() {
        return cy.get('.confirmation-dialog');
    }

    static rejectDeleteOperation() {
        this.getDeleteQueryConfirmation().find('.cancel-button').click();
    }

    static confirmDeleteOperation() {
        this.getDeleteQueryConfirmation().find('.confirm-button').click();
    }
}
