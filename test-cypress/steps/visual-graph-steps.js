class VisualGraphSteps {

    static updateGraphConfiguration(namedGraph) {
        cy.get('[data-cy="save-or-update-graph"]').click()
            .get( '[id="wb-graphviz-savegraph-name"]').type(namedGraph)
            .get('[id="wb-graphviz-savegraph-submit"]').click();
        cy.get('.toast').contains('Saved graph ' + namedGraph + ' was saved');
    }

    static deleteSavedGraph(renamedGraph) {
        cy.contains('td', renamedGraph).parent().within( () => {
            cy.get('[data-cy="delete-saved-graph"]').click();
        });
        VisualGraphSteps.confirmDelete();
    }

    static deleteGraphConfig(graphConfigName) {
        cy.contains('td', graphConfigName).parent().within( () => {
            cy.get('[data-cy="delete-graph-config"]').click();
        });
        VisualGraphSteps.confirmDelete();
    }

    static confirmDelete() {
        cy.get('.modal-footer .confirm-btn').click();
        cy.get('.modal').should('not.exist');
    }

}

export default VisualGraphSteps;
