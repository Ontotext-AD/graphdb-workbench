import ClassViewsSteps from "../../steps/class-views-steps";

const INITIAL_CLASS_COUNT = 50;
const CLASS_COUNT_OF_NEWS_GRAPH = 35;
const CLASS_LABEL_SELECTOR = '#main-group > text.label';
const FILE_TO_IMPORT = 'wine.rdf';
const CLASS_HIERARCHY = 'class hierarchy';

describe('Class hierarchy screen validation', () => {
    let repositoryId;

    beforeEach(() => {
        repositoryId = 'repo' + Date.now();
        cy.createRepository({id: repositoryId});
        cy.presetRepository(repositoryId);

        cy.importServerFile(repositoryId, FILE_TO_IMPORT);

        cy.visit('/hierarchy');
        cy.window();
        // Wait for the chart and diagram to be visible, also check if a class is displayed.
        cy.get('#classChart').scrollIntoView().should('be.visible').within(() => {
            cy.get('#main-group').scrollIntoView().should('be.visible');
            findClassByName('food:Grape');
            cy.get('@classInHierarchy').scrollIntoView().should('be.visible');
        });
    });

    afterEach(() => {
        cy.deleteRepository(repositoryId);
    });

    it('Test class-hierarchy for given graph', () => {
        cy.importServerFile(repositoryId, GRAPH_FILE, {"context": NEWS_GRAPH});
        // Should re-enter page to display Graph dropdown
        cy.visit('/hierarchy');
        ClassViewsSteps.verifyDataChangedWarning();
        verifyCounterValue(INITIAL_CLASS_COUNT);
        ClassViewsSteps.verifyGraphIsDisplayed(ALL_GRAPHS);

        // Reload diagram
        ClassViewsSteps.reloadDiagram();
        cy.intercept('/rest/class-hierarchy*').as('hierarchyReload');
        ClassViewsSteps.confirmReloadWarningAppear(CLASS_HIERARCHY);
        ClassViewsSteps.confirmReload();
        cy.wait('@hierarchyReload');
        verifyCounterValue(INITIAL_CLASS_COUNT + CLASS_COUNT_OF_NEWS_GRAPH);
        ClassViewsSteps.clickGraphBtn();
        ClassViewsSteps.selectGraphFromDropDown(NEWS_GRAPH);
        ClassViewsSteps.verifyGraphIsDisplayed(NEWS_GRAPH);
        verifyCounterValue(CLASS_COUNT_OF_NEWS_GRAPH);
    });

    function getCurrentSliderValue() {
        // The count is taken from the rz-pointer's attribute and not from a visible in the UI value
        // as the rz-slider library doesn't provide a reliable way to get this. It just has multiple
        // '.rz-bubble' elements and no appropriate selector for the one which holds the visible
        // value.
        return cy.get('.rz-pointer[role="slider"]');
    }

    function findClassByName(className) {
        cy.get(CLASS_LABEL_SELECTOR)
            .each(($element) => {
                let data = $element.prop('__data__');
                if (data.name === className) {
                    cy.wrap($element).as('classInHierarchy');
                }
            });
    }

    function verifyCounterValue(classCount) {
        getCurrentSliderValue().should('be.visible').and('have.attr', 'aria-valuenow', classCount);
    }
});
