export class PaginationSteps {

    static getPagination() {
        return cy.get('.ontotext-pagination');
    }

    static getPageSelectors() {
        return PaginationSteps.getPagination().find('.page-selectors');
    }

    static getPageNumberButtons() {
        return PaginationSteps.getPageSelectors().find('.page-button');
    }

    static getNextPageButton() {
        return PaginationSteps.getPageSelectors().find('.next-button');
    }

    static getPreviousPageButton() {
        return PaginationSteps.getPageSelectors().find('.previous-button');
    }

    static getPageNumberButton(pageNumber) {
        return PaginationSteps.getPagination().find(`button:contains("${pageNumber}")`);
    }

    static clickOnPageNumberButton(pageNumber) {
        PaginationSteps.getPageNumberButton(pageNumber).scrollIntoView().click();
    }

    static clickOnNextPageButton() {
        PaginationSteps.getNextPageButton().scrollIntoView().click();
    }

    static clickOnPreviousPageButton() {
        PaginationSteps.getPreviousPageButton().scrollIntoView().click();
    }

    /**
     * Checks when a page button is selected. When the button is selected this mean that current page is loaded.
     * Use this method to wait until new page loaded.
     * @param expectedPage - expected page.
     */
    static waitPageSelected(expectedPage) {
        PaginationSteps.getPageNumberButton(expectedPage).should('have.class', 'selected-page');
    }
}
