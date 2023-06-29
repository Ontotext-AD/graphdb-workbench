import {QueryStubDescription, QueryStubs} from "../../../stubs/yasgui/query-stubs";
import {SparqlEditorSteps} from "../../../steps/sparql-editor-steps";
import {YasqeSteps} from "../../../steps/yasgui/yasqe-steps";
import {YasrSteps} from "../../../steps/yasgui/yasr-steps";
import {PaginationSteps} from "../../../steps/yasgui/pagination-steps";
import {NamespaceStubs} from "../../../stubs/namespace-stubs";

describe('Yasr result pagination', () => {
    let repositoryId;
    beforeEach(() => {
        repositoryId = 'sparql-editor-' + Date.now();
        QueryStubs.stubQueryCountResponse();
        cy.createRepository({id: repositoryId});
        cy.presetRepository(repositoryId);
        NamespaceStubs.stubGeneratedOntotextNamespacesResponse(repositoryId);
        // Given: I visit a page with "ontotex-yasgu-web-component" in it.
        SparqlEditorSteps.visitSparqlEditorPage();
    });

    afterEach(() => {
        cy.deleteRepository(repositoryId);
    });

    describe('Visibility of pagination', () => {
        it('should not be visible when a tab is open without a query to be executed', () => {
            // When I visit a page with "ontotext-yasgui" component in it,
            // and there is not executed query.
            //Then I expect pagination to not be visible
            YasrSteps.getPagination().should('not.be.visible');
        });

        it('should not be visible when there aren\'t results', () => {
            // When I visit a page with "ontotext-yasgui" component in it,
            // and execute a query which don't return results
            QueryStubs.stubEmptyQueryResponse();
            YasqeSteps.executeQuery();

            //Then I expect pagination to not be visible
            YasrSteps.getPagination().should('not.be.visible');
        });

        it('should not be visible when results of query are less than configured page size', {
            retries: {
                runMode: 1,
                openMode: 0
            }
        }, () => {
            // When I visit a page with "ontotext-yasgui" component in it,
            // and execute a query which returns results less than page size.
            const queryDescription = new QueryStubDescription()
                .setRepositoryId(repositoryId)
                .setTotalElements(3);
            QueryStubs.stubQueryResults(queryDescription);
            YasqeSteps.executeQuery();

            // Then I expect pagination to not be visible
            YasrSteps.getPagination().should('not.be.visible');

            // When I execute a query witch returns results equals to page size.
            queryDescription
                .setRepositoryId(repositoryId)
                .setTotalElements(1000);
            QueryStubs.stubQueryResults(queryDescription);
            YasqeSteps.executeQuery();

            // Then I expect pagination to not be visible
            YasrSteps.getPagination().should('not.be.visible');
        });

        it('should be visible when results of query are more than configured page size', () => {
            // When I visit a page with "ontotext-yasgui" component in it,
            // and execute a query which returns results more than page size.
            const queryDescription = new QueryStubDescription()
                .setRepositoryId(repositoryId)
                .setTotalElements(1150);
            QueryStubs.stubQueryResults(queryDescription);
            YasqeSteps.executeQuery();

            // Then I expect pagination to be visible
            YasrSteps.getPagination().should('be.visible');
        });

    });

    describe('Pagination behaviour', () => {
        it('should change page when clink on page number button', () => {
            // When I visit a page with "ontotext-yasgui" component in it,
            // and execute a query which returns results more than page size.
            const queryDescription = new QueryStubDescription()
                .setRepositoryId(repositoryId)
                .setTotalElements(1001);
            QueryStubs.stubQueryResults(queryDescription);
            YasqeSteps.executeQuery();
            PaginationSteps.waitPageSelected(1);

            // I expect two pages to be shown in pagination,
            PaginationSteps.getPageNumberButtons().should('have.length', 2);
            // and first page to have 1000 results,
            YasrSteps.getResults().should('have.length', 1000);
            // and results to be from the first page
            YasrSteps.getResultLink(0, 2).should('have.text', 'ontogen:page_1-row_1-column_2');

            // When I click on second page button
            PaginationSteps.clickOnPageNumberButton(2);
            PaginationSteps.waitPageSelected(2);

            // Then I expect second page to have only one result,
            YasrSteps.getResults().should('have.length', 1);
            // and the results to be from the second page
            YasrSteps.getResultLink(0, 2).should('have.text', 'ontogen:page_2-row_1-column_2');
        });

        it('should change page when clink on next or previous page button', {
            retries: {
                runMode: 1,
                openMode: 0
            }
        }, () => {
            // When I visit a page with "ontotext-yasgui" component in it,
            // and execute a query which returns results more than page size.
            const queryDescription = new QueryStubDescription()
                .setRepositoryId(repositoryId)
                .setTotalElements(1002);
            QueryStubs.stubQueryResults(queryDescription);
            YasqeSteps.executeQuery();
            PaginationSteps.waitPageSelected(1);

            // Then I expect two pages to be shown in pagination.
            PaginationSteps.getPageNumberButtons().should('have.length', 2);
            // and first page to have 1000 results
            YasrSteps.getResults().should('have.length', 1000);
            // and results to be from the first page
            YasrSteps.getResultLink(0, 2).should('have.text', 'ontogen:page_1-row_1-column_2');

            // When I click on next page button
            PaginationSteps.clickOnNextPageButton();
            PaginationSteps.waitPageSelected(2);

            // Then I expect second page to have two results.
            YasrSteps.getResults().should('have.length', 2);
            // and the result to be from the second page
            YasrSteps.getResultLink(0, 2).should('have.text', 'ontogen:page_2-row_1-column_2');

            // When I click on previous button
            PaginationSteps.clickOnPreviousPageButton();
            PaginationSteps.waitPageSelected(1);

            // Then I expect first page to have 1000 results,
            YasrSteps.getResults().should('have.length', 1000);
            // and the results to be from the first page.
            YasrSteps.getResultLink(0, 2).should('have.text', 'ontogen:page_1-row_1-column_2');
        });

        it('should have two more page around selected page', {
            retries: {
                runMode: 1,
                openMode: 1
            }
        }, () => {
            // When I visit a page with "ontotext-yasgui" component in it,
            // and execute a query which results are on 6 pages.
            const queryDescription = new QueryStubDescription()
                .setRepositoryId(repositoryId)
                .setTotalElements(5001);
            QueryStubs.stubQueryResults(queryDescription);
            YasqeSteps.executeQuery();
            PaginationSteps.waitPageSelected(1);

            PaginationSteps.getPreviousPageButton().should('be.disabled');
            PaginationSteps.getPageNumberButton(1).should('have.class', 'selected-page');
            PaginationSteps.getPageNumberButton(2).should('be.visible');
            PaginationSteps.getPageNumberButton(3).should('be.visible');
            PaginationSteps.getPageNumberButton(4).should('not.exist');
            PaginationSteps.getPageNumberButton(4).should('not.exist');
            PaginationSteps.getPageNumberButton(5).should('not.exist');
            PaginationSteps.getPageNumberButton(6).should('not.exist');
            PaginationSteps.getNextPageButton().should('not.be.disabled');

            // When select second page
            PaginationSteps.clickOnPageNumberButton(2);
            PaginationSteps.waitPageSelected(2);

            PaginationSteps.getPreviousPageButton().should('not.be.disabled');
            PaginationSteps.getPageNumberButton(1).should('be.visible');
            PaginationSteps.getPageNumberButton(2).should('have.class', 'selected-page');
            PaginationSteps.getPageNumberButton(3).should('be.visible');
            PaginationSteps.getPageNumberButton(4).should('be.visible');
            PaginationSteps.getPageNumberButton(5).should('not.exist');
            PaginationSteps.getPageNumberButton(6).should('not.exist');
            PaginationSteps.getNextPageButton().should('not.be.disabled');

            // When select third page
            PaginationSteps.clickOnPageNumberButton(3);
            PaginationSteps.waitPageSelected(3);

            PaginationSteps.getPreviousPageButton().should('not.be.disabled');
            PaginationSteps.getPageNumberButton(1).should('be.visible');
            PaginationSteps.getPageNumberButton(2).should('be.visible');
            PaginationSteps.getPageNumberButton(3).should('have.class', 'selected-page');
            PaginationSteps.getPageNumberButton(4).should('be.visible');
            PaginationSteps.getPageNumberButton(5).should('be.visible');
            PaginationSteps.getPageNumberButton(6).should('not.exist');
            PaginationSteps.getNextPageButton().should('not.be.disabled');

            // When select fifth page
            PaginationSteps.clickOnPageNumberButton(5);
            PaginationSteps.waitPageSelected(5);

            PaginationSteps.getPreviousPageButton().should('not.be.disabled');
            PaginationSteps.getPageNumberButton(1).should('not.exist');
            PaginationSteps.getPageNumberButton(2).should('not.exist');
            PaginationSteps.getPageNumberButton(3).should('be.visible');
            PaginationSteps.getPageNumberButton(4).should('be.visible');
            PaginationSteps.getPageNumberButton(5).should('have.class', 'selected-page');
            PaginationSteps.getPageNumberButton(6).should('be.visible');
            PaginationSteps.getPageNumberButton(7).should('not.exist');
            PaginationSteps.getNextPageButton().should('not.be.disabled');

            // When select last page
            PaginationSteps.clickOnPageNumberButton(6);
            PaginationSteps.waitPageSelected(6);

            PaginationSteps.getPreviousPageButton().should('not.be.disabled');
            PaginationSteps.getPageNumberButton(1).should('not.exist');
            PaginationSteps.getPageNumberButton(2).should('not.exist');
            PaginationSteps.getPageNumberButton(3).should('not.exist');
            PaginationSteps.getPageNumberButton(4).should('be.visible');
            PaginationSteps.getPageNumberButton(5).should('be.visible');
            PaginationSteps.getPageNumberButton(6).should('have.class', 'selected-page');
            PaginationSteps.getPageNumberButton(7).should('not.exist');
            PaginationSteps.getNextPageButton().should('be.disabled');
        });
    });
});
