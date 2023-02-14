import VisualGraphSteps from "../../steps/visual-graph-steps";

const FILE_TO_IMPORT = 'wine.rdf';

describe('Visual graph screen validation', () => {

    let repositoryId = 'graphRepo' + Date.now();

    before(() => {
        cy.clearLocalStorage('ls.graphs-viz');
        repositoryId = 'repo' + Date.now();
        cy.createRepository({id: repositoryId});
        cy.importServerFile(repositoryId, FILE_TO_IMPORT);
    });

    after(() => {
        cy.clearLocalStorage('ls.graphs-viz');
        cy.setDefaultUserData();
        cy.deleteRepository(repositoryId);
    });

    beforeEach(() => {
        cy.presetRepository(repositoryId);
    });

    it('CRUD on saved graph', () => {
        const graphConfigName = 'MyGraphConfig_' + Date.now();
        const namedGraph = 'myGraph_' + Date.now();
        const renamedGraph = 'myRenamedGraph_' + Date.now();

        //Creates saved graph
        cy.visit('graphs-visualizations');
        getCreateCustomGraphLink().click();
        cy.url().should('include', '/config/save');
        getGraphConfigName().type(graphConfigName);
        cy.get('[data-cy="graph-config-by-graph-query-checkbox"]').check();
        cy.pasteQuery('CONSTRUCT WHERE {?s ?p ?o} LIMIT 10').then( () => {
                getSaveConfig().click();
            }
        );
        getSaveConfig().click();
        cy.url().should('include', 'graphs-visualizations');
        cy.contains('td', graphConfigName).should('be.visible').parent().within(() => {
            cy.get('td a [data-cy="graph-config-starting-point-query-results"]').click();
        });
        VisualGraphSteps
            .updateGraphConfiguration(namedGraph);

        //Visualize saved graph
        cy.visit('graphs-visualizations');
        cy.contains('td', namedGraph).parent().within(() => {
            cy.get('td a').contains(namedGraph).click();
        });
        cy.get('[data-cy="save-or-update-graph"]').should('be.visible');

        //Finds the button "Get URL to Graph" and opens the modal form "Copy URL to clipboard"
        cy.visit('graphs-visualizations');
        cy.contains('td', namedGraph).parent().within( () => {
            cy.get('td a')
                .get('[data-cy="copy-to-clipboard-saved-graph"]').click();
        });
           cy.get( '[id="copyToClipboardForm"]').contains('Copy URL to clipboard');

        //Renames saved graph
        cy.visit('graphs-visualizations');
        cy.contains('td', namedGraph).parent().within( () => {
            cy.get('td a')
                .get('[data-cy="rename-saved-graph"]').click();
        });
        cy.get('[id="saveGraphForm"]')
            .get('[id="wb-graphviz-savegraph-name"]').clear().type(renamedGraph)
            .get('[id="wb-graphviz-savegraph-submit"]').click();
        cy.get('.toast').contains('Saved graph ' + renamedGraph + ' was edited.');
        cy.hideToastContainer();

        //Deletes saved graph
        VisualGraphSteps
            .deleteSavedGraph(renamedGraph);

        //Deletes graph config
        VisualGraphSteps
            .deleteGraphConfig(graphConfigName);
    });

    function getCreateCustomGraphLink() {
        return cy.get('.create-graph-config').should('be.visible');
    }

    function getGraphConfigName() {
        return cy.get('.graph-config-name').should('be.visible');
    }

    function getSaveConfig() {
        return cy.get('.btn-save-config').should('be.visible');
    }
});
