export class YasrSteps {
    static getYasr() {
        return cy.get('.yasr');
    }

    static getResultHeader() {
        return cy.get('.yasr_header');
    }

    static getErrorHeader() {
        return YasrSteps.getResultHeader().get('.errorHeader');
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

    static getResultCell(rowNumber, cellNumber) {
        return this.getResultRow(rowNumber).find('td').eq(cellNumber);
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

    static getPagination() {
        return YasrSteps.getYasr().find('.ontotext-pagination');
    }
}
