import ClassViewsSteps, {ALL_GRAPHS, GRAPH_FILE, NEWS_GRAPH} from "../../../steps/class-views-steps";
import {ClassRelationshipsSteps} from "../../../steps/explore/class-relationships-steps";

const FILE_TO_IMPORT = 'wine.rdf';

describe('Class relations screen validation', () => {

    let repositoryId;

    beforeEach(() => {
        repositoryId = 'class-relations-repo' + Date.now();
        cy.createRepository({id: repositoryId});
        cy.presetRepository(repositoryId);

        cy.importServerFile(repositoryId, FILE_TO_IMPORT);

        ClassRelationshipsSteps.visit();
        // The diagram and the list should be visible in order to assume the page is ready
        ClassRelationshipsSteps.getDependenciesDiagram().should('be.visible');
        ClassRelationshipsSteps.getDependenciesList().should('be.visible');
    });

    afterEach(() => {
        cy.deleteRepository(repositoryId);
    });

    it('Test initial state', function () {
        // Filter field should be visible
        ClassRelationshipsSteps.getFilterField().should('be.visible');
        // Dependencies label should be present and showing proper text
        ClassRelationshipsSteps.getAvailableDependenciesLabel()
            .should('be.visible')
            .contains('Showing the dependencies between 10 classes');
        // Directions filter buttons should be visible
        ClassRelationshipsSteps.getDirectionFilter().should('be.visible');
        // And the "All" radio button must be selected by default
        ClassRelationshipsSteps.verifySelectedDirectionFilter('all');
        // The toolbar and its buttons should be visible
        ClassRelationshipsSteps.verifyRelationsToolbarContent();
        // Class relations list should be visible and have 10 classes selected
        ClassRelationshipsSteps.getDependenciesList().should('be.visible').within(() => {
            cy.get('.item .row.active').should('have.length', 10);
        });
        // Diagram should be visible and showing 10 classes
        ClassRelationshipsSteps.getDependenciesDiagram().should('be.visible').within(() => {
                cy.get('.group').should('have.length', 10);
        });
    });

    it('Search for a class', function () {
        // Expect 39 rows initially to be visible
        ClassRelationshipsSteps.verifyListLength(39);
        // Filter by partial name
        ClassRelationshipsSteps.filterByClass(':Wine');
        // Expecting 6 rows to be present
        ClassRelationshipsSteps.verifyListLength(6);
        // Clear the filter and expect all rows to be visible again
        ClassRelationshipsSteps.getFilterField().clear();
        ClassRelationshipsSteps.verifyListLength(39);
    });

    it('Test class relationships for given graph', () => {
        cy.importServerFile(repositoryId, GRAPH_FILE, {"context": NEWS_GRAPH});
        // Should re-enter page to display Graph dropdown
        ClassRelationshipsSteps.visit();
        ClassViewsSteps.verifyDataChangedWarning();
        ClassViewsSteps.verifyGraphIsDisplayed(ALL_GRAPHS);

        // Reload diagram
        ClassViewsSteps.reloadDiagram();

        ClassViewsSteps.confirmReloadWarningAppear('relationships');
        ClassViewsSteps.confirmReload();
        ClassViewsSteps.clickGraphBtn();
        ClassViewsSteps.selectGraphFromDropDown(NEWS_GRAPH);
        ClassViewsSteps.verifyGraphIsDisplayed(NEWS_GRAPH);
    });
});
