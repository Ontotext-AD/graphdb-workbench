export class SimilarityIndexCreateSteps {

    static visit() {
        cy.visit('/similarity/index/create');
    }

    static verifyUrl() {
        cy.url().should('include', '/similarity/index/create');
    }

    static getCancelButton() {
        return cy.get('.cancel-similarity-index-btn');
    }

    static cancel() {
        SimilarityIndexCreateSteps.getCancelButton().click();
    }

    static getCreateButton() {
        return cy.get('.create-similarity-index-btn');
    }

    static create() {
        SimilarityIndexCreateSteps.getCreateButton().click();
    }

    static getQueryButton() {
        return cy.get('.save-query-btn');
    }

    static save() {
        SimilarityIndexCreateSteps.getQueryButton().click();
    }

    static getSimilarityIndexNameInput() {
        return cy.get('.similarity-index-name');
    }

    static typeSimilarityIndexName(similarityIndexName) {
        // Forced because yasqe gets focus when it is initialized and can break typing of name.
        // For example, if we type a long name, the first half will be typed in the input field and the second half into yasqe.
        SimilarityIndexCreateSteps.getSimilarityIndexNameInput().type(similarityIndexName, {force: true});
    }

    static getSemanticVectorsInput() {
        return cy.get('#indexParameters');
    }

    static getStopWordsInput() {
        return cy.get('.stop-words');
    }

    static getAnalyzerClassInput() {
        return cy.get('.analyzer-class');
    }

    static getLiteralIndexCheckbox() {
        return cy.get('.literal-index');
    }

    static checkLiteralIndex() {
        SimilarityIndexCreateSteps.getLiteralIndexCheckbox().check();
    }

    static getMoreOptions() {
        return cy.get('.more-options-btn');
    }

    static showMoreOptions() {
        SimilarityIndexCreateSteps.getMoreOptions().click();
    }

    static getSelectQueryTab() {
        return cy.get('.select-query-tab');
    }

    static checkSelectQueryTabActive() {
        SimilarityIndexCreateSteps.getSelectQueryTab().find('a.active');
    }

    static getSearchQueryTab() {
        return cy.get('.search-query-tab');
    }
    static checkSearchQueryTabActive() {
        SimilarityIndexCreateSteps.getSearchQueryTab().find('a.active');
    }

    static switchToSearchQueryTab() {
        SimilarityIndexCreateSteps.getSearchQueryTab().click();
        SimilarityIndexCreateSteps.checkSearchQueryTabActive();
    }

    static getAnalogicalQueryTab() {
        return cy.get('.analogical-query-tab');
    }

    static checkAnalogicalQueryTabActive() {
        SimilarityIndexCreateSteps.getAnalogicalQueryTab().find('a.active');
    }

    static switchToAnalogicalQueryTab() {
        SimilarityIndexCreateSteps.getAnalogicalQueryTab().click();
        SimilarityIndexCreateSteps.checkAnalogicalQueryTabActive();
    }

    static getCreatePredictionIndexTab() {
        return cy.get('#create-predication-index');
    }

    static switchToCreatePredictionIndexTab() {
        SimilarityIndexCreateSteps.getCreatePredictionIndexTab().click();
    }
}
