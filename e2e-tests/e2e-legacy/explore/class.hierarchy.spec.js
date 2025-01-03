import ClassViewsSteps, {ALL_GRAPHS, GRAPH_FILE, NEWS_GRAPH} from "../../steps/class-views-steps";

const INITIAL_CLASS_COUNT = 50;
const CLASS_COUNT_OF_NEWS_GRAPH = 35;
const FILE_TO_IMPORT = 'wine.rdf';
const CLASS_HIERARCHY = 'class hierarchy';

describe('Class hierarchy screen validation', () => {
    let repositoryId;

    beforeEach(() => {
        repositoryId = 'repo' + Date.now();
        cy.createRepository({id: repositoryId});
        cy.presetRepository(repositoryId);
        cy.importServerFile(repositoryId, FILE_TO_IMPORT);
        ClassViewsSteps.visit();
        ClassViewsSteps.waitForPageLoad();
    });

    afterEach(() => {
        cy.deleteRepository(repositoryId);
    });

    it('should have an initial state of the diagram with a class count of 50', () => {
        verifyCounterValue(INITIAL_CLASS_COUNT);
    });

    it('should show/hide prefixes', () => {
        // Given I verify that switching on/off Show/hide prefixes is reflected on the diagram - prefixes are displayed/hidden
        verifyPrefixes(($element) => cy.wrap($element.text()).should('contain', ':'));

        // Because some of the labels are truncated and is not guaranteed,
        // that after calling cy.get labels will be in the same order,
        // get the initial value of 'Chardonnay' label's text
        // When I get the initial value of 'Chardonnay' label's text
        ClassViewsSteps.getMainGroupTextLabel()
            .contains('Chardonnay')
            .invoke('text')
            .then((initialVal) => {
                // When I switch "show prefixes" to off
                ClassViewsSteps.getToolbarPrefixToggleButton()
                    .scrollIntoView()
                    .should('be.visible');
                // Then I toggle the prefixes
                ClassViewsSteps.clickPrefixToggleButton();
                // Then I wait until the value of the 'Chardonnay' label has changed
                ClassViewsSteps.getMainGroupTextLabel()
                    .contains('Chardonnay')
                    .invoke('text')
                    .should((newVal) => {
                        expect(newVal).not.to.equal(initialVal);
                    });
                // Then I verify that prefixes are removed from diagram
                verifyPrefixes(($element) => {
                    cy.wrap($element.text()).should('not.contain', ':');
                });
            });
    });

    it('should focus on diagram', () => {
        // This must not be a top-level class, and it must have no children, otherwise asserting the zooming becomes tricky
        const className = ':SweetRiesling';
        // Given the class is not expanded
        verifyClassFocus(className, false);
        // When I search for a class
        searchForClass(className);
        // Then I expect the class to become expanded
        verifyClassFocus(className, true);
        // When a class is focused in diagram a side panel is opened on the right and covers the buttons toolbar
        ClassViewsSteps.closeInfoSidePanel();
        // Then I close the side panel
        ClassViewsSteps.getInfoSidePanelCloseButton().should('not.be.visible');
        // Then I focus the diagram
        ClassViewsSteps.focusDiagram();
        // Then I verify that the diagram zooms out, without resetting the class count
        ClassViewsSteps.findClassByName(className);
        ClassViewsSteps.getClassInHierarchy().then(verifyClassIsNotExpanded);
    });

    it('should reload diagram', () => {
        // Given I change the initial class count (50) to a custom value
        ClassViewsSteps.positionSlider('center');
        // Then I confirm the diagram has reloaded
        reloadDiagramAndVerify(INITIAL_CLASS_COUNT);
    });

    it('should export diagram', () => {
        // Given I verify that the diagram converted to svg. It should be present as a base64 encoded string in the href attribute.
        // Note: This is done in the 'mouseover' callback for the link
        // (https://github.com/Ontotext-AD/graphdb-workbench/blob/master/src/js/angular/graphexplore/directives/rdf-class-hierarchy.directive.js#L123)
        ClassViewsSteps.mouseOverSVGButton()
            .should('have.attr', 'download', `class-hierarchy-${repositoryId}.svg`)
            .should('have.attr', 'href')
            .and('not.be.empty')
            .and('include', 'data:image/svg+xml;charset=utf-8;base64,');
    });

    it('should search for a class', () => {
        const className = 'wine';
        ClassViewsSteps.getSearchInputDropdown()
            .should('not.be.visible');
        // When I search for a class
        searchForClass(className);
        // Then a list of suggestions is displayed
        ClassViewsSteps.getSearchInputDropdown()
            .should('be.visible')
            .and('length.be.gt', 0);
        // When I click on a specific element that isn't a top-level one and has children,
        // otherwise it gets tricky to assert whether it was zoomed
        ClassViewsSteps.getSearchInputDropdown()
            .contains('WineColor')
            .then(($el) => {
                const selectedClassName = $el.text().trim();

                // Then I find the selected class from the drop-down menu and verify that it isn't expanded
                ClassViewsSteps.findClassByName(selectedClassName);
                ClassViewsSteps.getClassInHierarchy().then(verifyClassIsNotExpanded);
                // And I click the class name element
                ClassViewsSteps.clickJQueryElement(cy.wrap($el));

                // Then I find the selected class from the drop-down menu and verify that it is expanded
                ClassViewsSteps.findClassByName(selectedClassName);
                ClassViewsSteps.getClassInHierarchy().then(verifyClassIsExpanded);
            });
    });

    it('should load domain range graph', () => {
        const className = ':Region';
        // When I search for a class
        searchForClass(className);
        // And I open a domain range graph
        ClassViewsSteps.openDomainRangeGraph();
        // Then the graph should contain all necessary data
        ClassViewsSteps.getDomainRangeGraphHeader()
            .should('contain', 'Domain-Range graph');
        ClassViewsSteps.getLegendContainer()
            .should('be.visible');
        ClassViewsSteps.getLegendContainer()
            .should('contain', 'main class node')
            .and('contain', 'class node')
            .and('contain', 'collapsed property');
        ClassViewsSteps.getMainDomainRangeDiagram()
            .should('be.visible');
        ClassViewsSteps.getMainDomainRangeDiagram()
            .should('contain', className)
            .and('contain', 'locatedIn')
            .and('contain', ':adjacentRegion')
            .and('contain', 'owl:Thing');
        ClassViewsSteps.getReturnButton()
            .should('be.visible');
        ClassViewsSteps.goBack();
    });

    it('should load class-hierarchy for given graph', () => {
        cy.importServerFile(repositoryId, GRAPH_FILE, {"context": NEWS_GRAPH});
        // Given I re-enter the page to display Graph dropdown
        ClassViewsSteps.visit();
        ClassViewsSteps.verifyDataChangedWarning();
        verifyCounterValue(INITIAL_CLASS_COUNT);
        ClassViewsSteps.verifyGraphIsDisplayed(ALL_GRAPHS);
        // When I reload the diagram
        reloadDiagramAndVerify(INITIAL_CLASS_COUNT + CLASS_COUNT_OF_NEWS_GRAPH);
        ClassViewsSteps.clickGraphBtn();
        // Then I can see the correct graph is displayed
        ClassViewsSteps.selectGraphFromDropDown(NEWS_GRAPH);
        ClassViewsSteps.verifyGraphIsDisplayed(NEWS_GRAPH);
        verifyCounterValue(CLASS_COUNT_OF_NEWS_GRAPH);
    });

    function searchForClass(name) {
        ClassViewsSteps.searchForClass();
        ClassViewsSteps.searchForClassName(name);
    }

    function verifyPrefixes(expectation) {
        ClassViewsSteps.getMainGroupTextLabel()
            .filter(':visible')
            .each(expectation);
    }

    function verifyClassIsNotExpanded($element) {
        // This works well only for classes that aren't top level and have no children
        return cy.wrap($element)
            .should('have.css', 'display')
            .and('eq', 'none');
    }

    function verifyClassIsExpanded($element) {
        // This works well only for classes that aren't top level and have no children
        return cy.wrap($element)
            .should('have.css', 'display')
            .and('not.eq', 'none');
    }

    function verifyCounterValue(classCount) {
        ClassViewsSteps.getCurrentSliderValue()
            .should('be.visible')
            .and('have.attr', 'aria-valuenow', classCount);
    }

    function reloadDiagramAndVerify(expectedClassCount) {
        ClassViewsSteps.reloadDiagram();
        ClassViewsSteps.waitForPageLoad();
        ClassViewsSteps.confirmReloadWarningAppear(CLASS_HIERARCHY);
        ClassViewsSteps.confirmReload();
        verifyCounterValue(expectedClassCount);
    }

    function verifyClassFocus(className, expanded) {
        ClassViewsSteps.findClassByName(className);
        ClassViewsSteps.getClassInHierarchy().then(expanded ? verifyClassIsExpanded : verifyClassIsNotExpanded);
    }
});
