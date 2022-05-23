/**
 * Reusable functions for interacting with graph dropdown on Class hierarchy and relationships pages.
 */

const GRAPH_FILE = 'graphdb-news-dataset.zip';
const ALL_GRAPHS = 'All graphs';
const NEWS_GRAPH = 'http://example.org/news';

Object.defineProperty(global, 'GRAPH_FILE', {
    get: () => {
        return GRAPH_FILE;
    }
});

Object.defineProperty(global, 'ALL_GRAPHS', {
    get: () => {
        return ALL_GRAPHS;
    }
});

Object.defineProperty(global, 'NEWS_GRAPH', {
    get: () => {
        return NEWS_GRAPH;
    }
});

class ClassViewsSteps {

    static selectGraphFromDropDown(graph) {
        cy.get('#selectGraphDropdown .dropdown-item')
            .each(($el, index, $list) => {
                if ($el.text().trim() === graph) {
                    cy.wrap($el).click();
                }
            });
    }

    static verifyGraphIsDisplayed(graph) {
        cy.get('#selectGraphDropdown').should('be.visible')
            .and('contain', graph);
    }

    static clickGraphBtn() {
        cy.waitUntil(() =>
            cy.get('#graphsBtnGroup')
                .then(graphsBtn => graphsBtn && Cypress.dom.isAttached(graphsBtn) && graphsBtn.trigger('click')));
    }


    static confirmReloadWarningAppear(pageView) {
        cy.get('.modal-body > .lead')
            .should('be.visible')
            .and('contain', 'Calculating ' + pageView + ' data may take some time. Are you sure?');
    }

    static verifyDataChangedWarning() {
        cy.get('#toast-container').find('.toast-title')
            .should('be.visible')
            .and('contain', 'Repository data has changed');
    }

    static confirmReload() {
        cy.get('.modal-footer .confirm-btn')
            .click()
            .then(() => {
                cy.get('.modal').should('not.exist');
            });
    }

    static reloadDiagram() {
        cy.get('.reload-diagram-btn').click();
    }
}

export default ClassViewsSteps;
