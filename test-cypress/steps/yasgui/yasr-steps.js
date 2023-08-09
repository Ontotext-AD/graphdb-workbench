export class YasrSteps {
    static getYasr(yasrIndex = 0) {
        return cy.get('.yasr').eq(yasrIndex);
    }

    static getResultHeader() {
        return cy.get('.yasr_header');
    }

    static getResponseInfo(yasrIndex = 0) {
        return YasrSteps.getYasr(yasrIndex).find('.yasr_response_chip');
    }

    static getErrorHeader() {
        return YasrSteps.getResultHeader().get('.errorHeader');
    }

    static getErrorBody() {
        return YasrSteps.getResultHeader().get('.error-response-plugin-body');
    }

    static getResults() {
        return cy.get('.yasr_results tbody').find('tr');
    }

    static getResultFilter() {
        return cy.get('.tableFilter');
    }

    static getResultRow(rowNumber) {
        return this.getResults().eq(rowNumber);
    }

    static getResultRowCells(rowNumber) {
        return YasrSteps.getResultRow(rowNumber).find('td');
    }

    static getResultCell(rowNumber, cellNumber) {
        return YasrSteps.getResultRowCells(rowNumber).eq(cellNumber);
    }

    static getResultLink(rowNumber, cellNumber) {
        return YasrSteps.getResultCell(rowNumber, cellNumber).find('a');
    }

    static hoverCell(rowNumber, cellNumber) {
        this.getResultCell(rowNumber, cellNumber).realHover();
    }

    static getCopyResourceLink(rowNumber, cellNumber) {
        return this.getResultCell(rowNumber, cellNumber)
            .realHover()
            .find('.copy-resource-link-button a');
    }

    static showSharedResourceLink(rowNumber, cellNumber) {
        return this.getResultCell(rowNumber, cellNumber)
            .find('.copy-resource-link-button a');
    }

    static clickOnCopyResourceLink(rowNumber, cellNumber) {
        this.showSharedResourceLink(rowNumber, cellNumber).realClick();
    }

    static getDownloadAsDropdown() {
        return this.getYasr().find('ontotext-download-as');
    }

    static openDownloadAsDropdown() {
        this.getDownloadAsDropdown().click();
    }

    static getDownloadAsOption(number) {
        return this.getDownloadAsDropdown().find('.ontotext-dropdown-menu-item').eq(number);
    }

    static downloadAs(option) {
        this.openDownloadAsDropdown();
        this.getDownloadAsOption(option).click();
    }

    static getPagination() {
        return YasrSteps.getYasr().find('.ontotext-pagination');
    }

    static getYasrToolbar() {
        return YasrSteps.getYasr().find('.yasr-toolbar');
    }

    static getVisualButton() {
        return YasrSteps.getYasrToolbar().find('.explore-visual-graph-button-name');
    }

    static getNoDataElement() {
        return cy.get('.dataTables_empty');
    }
}
