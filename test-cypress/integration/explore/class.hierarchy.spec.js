import ClassViewsSteps from "../../steps/class-views-steps";

const INITIAL_CLASS_COUNT = 50;
const CLASS_COUNT_OF_NEWS_GRAPH = 35;
const SEARCH_INPUT_DROPDOWN_ID = '#search_input_dropdown';
const CLASS_LABEL_SELECTOR = '#main-group > text.label';
const FILE_TO_IMPORT = 'wine.rdf';
const CLASS_HIERARCHY = 'class hierarchy';

describe('Class hierarchy screen validation', () => {
    let repositoryId;

    beforeEach(() => {
        repositoryId = 'repo' + Date.now();
        cy.createRepository({id: repositoryId});
        cy.presetRepositoryCookie(repositoryId);

        cy.importServerFile(repositoryId, FILE_TO_IMPORT);

        cy.visit('/hierarchy');
        // Wait for the chart and diagram to be visible, also check if a class is displayed.
        cy.get('#classChart').should('be.visible').within(() => {
            cy.get('#main-group').should('be.visible');
            findClassByName('food:Grape');
            cy.get('@classInHierarchy').should('be.visible');
        });
    });

    afterEach(() => {
        cy.deleteRepository(repositoryId);
    });

    it('Test initial state of the diagram has a class count 50', () => {
        verifyCounterValue(INITIAL_CLASS_COUNT);
    });

    it('Test show/hide prefixes', () => {
        // Verify that switching on/off Show/hide prefixes is reflected on the diagram -
        // prefixes are displayed/hidden
        verifyPrefixes(($element) => expect($element.text()).to.contain(':'));

        // Switch show prefixes to off
        cy.get('.toolbar-holder .prefix-toggle-btn').click();

        // Verify that prefixes are removed from diagram
        verifyPrefixes(($element) => expect($element.text()).to.not.contain(':'));
    });

    it('Test focus on diagram', () => {
        let className = ':CabernetSauvignon';
        findClassByName(className);
        cy.get('@classInHierarchy').then(verifyClassIsNotExpanded);

        // Verify that the diagram zooms that class
        searchForClass(className);

        // Verify font-size is changed
        findClassByName(className);
        cy.get('@classInHierarchy').then(verifyClassIsExpanded);

        // When a class is focused in diagram a side panel is opened on the right and covers the
        // buttons toolbar.
        cy.get('[ps-class=rdf-info-side-panel] .close').click()
            .should('not.be.visible');
        cy.get('.toolbar-holder .focus-diagram-btn').click();

        // Verify that the diagram zooms out without resetting the class count.
        findClassByName(className);
        cy.get('@classInHierarchy').then(verifyClassIsNotExpanded);
    });

    it('Test reload diagram', () => {
        // Initial class count is 50
        // Change the class count to a custom value
        cy.get('.class-cnt-slider > .ng-isolate-scope').trigger('click', 'center');

        // Reload diagram
        ClassViewsSteps.reloadDiagram();

        // Verify that warning message appears
        ClassViewsSteps.confirmReloadWarningAppear(CLASS_HIERARCHY);

        // Confirm diagram reloading
        ClassViewsSteps.confirmReload();

        // Verify that the diagram zooms out and the class count is reset
        verifyCounterValue(INITIAL_CLASS_COUNT);
    });

    it('Test export diagram', () => {
        // TODO: Verify that there aren't issues with this approach as there is no guarantee that the click will happen after mouseover event!
        // Eventually file an issue for refactoring.
        cy.get('#download-svg')
            .then(($element) => {
                let href = $element.prop('href');
                // Verify that a svg with the current diagram state is saved on your hdd.
                expect(href).to.contain(Cypress.config("baseUrl"));
            });

        // This is how I see it should be tested properly but for some reason when the whole spec is
        // executed the test fails.
        // Verify that the diagram converted to svg is present as base64 encoded string in
        // the href attribute. This is done in the mouseover over the link
        // (https://github.com/Ontotext-AD/graphdb-workbench/blob/master/src/js/angular/graphexplore/directives/rdf-class-hierarchy.directive.js#L127)
        // cy.get('#download-svg')
        //     .trigger('mouseover')
        //     .should('have.attr', 'download', `class-hierarchy-${repositoryId}.svg`)
        //     .should('have.attr', 'href')
        //     .and('not.be.empty')
        //     .and('include', 'data:image/svg+xml;charset=utf-8;base64,');
    });

    it('Test search for a class', () => {
        let className = 'wine';
        cy.get(SEARCH_INPUT_DROPDOWN_ID)
            .should('not.be.visible');

        searchForClass(className);

        // Verify that a list of suggestions is displayed.
        cy.get(SEARCH_INPUT_DROPDOWN_ID)
            .should('be.visible')
            .and('length.be.gt', 0);

        // Click on a suggested random third class
        cy.get('#search_input_dropdown > :nth-child(3)')
            .then(($el) => {
                let selectedClassName = $el.text().trim();

                // Find selected class from drop-down menu and verify that isn't expanded
                findClassByName(selectedClassName);
                cy.get('@classInHierarchy').then(verifyClassIsNotExpanded);

                cy.wrap($el).click();

                // Find selected class from drop-down menu after clicking on it and verify that it is expanded
                findClassByName(selectedClassName);
                cy.get('@classInHierarchy').then(verifyClassIsExpanded);
            });
    });

    it('Test domain range graph', () => {
        let className = ':Region';
        searchForClass(className);
        getDomainRangeGraphButton().click();
        getDomainRangeGraphHeader().should('contain','Domain-Range graph');
        getLegendContainer().should('be.visible');
        getLegendContainer().should('contain', 'main class node').
            and('contain', 'class node').
            and('contain', 'collapsed property');
        getMainDomainRangeDiagram().should('be.visible');
        getMainDomainRangeDiagram().should('contain', className).
            and('contain', 'locatedIn').
            and('contain', ':adjacentRegion').
            and('contain', 'owl:Thing');
        getReturnButton().should('be.visible').click();
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

        ClassViewsSteps.confirmReloadWarningAppear(CLASS_HIERARCHY);
        ClassViewsSteps.confirmReload();
        cy.visit('/hierarchy#1');
        verifyCounterValue(INITIAL_CLASS_COUNT + CLASS_COUNT_OF_NEWS_GRAPH);
        ClassViewsSteps.clickGraphBtn();
        ClassViewsSteps.selectGraphFromDropDown(NEWS_GRAPH);
        ClassViewsSteps.verifyGraphIsDisplayed(NEWS_GRAPH);
        verifyCounterValue(CLASS_COUNT_OF_NEWS_GRAPH);
    });

    function getDomainRangeGraphButton() {
        return cy.get('.domain-range-graph-btn');
    }

    function getDomainRangeGraphHeader() {
        return cy.get('h1');
    }

    function getLegendContainer() {
        return cy.get('.legend-container');
    }

    function getMainDomainRangeDiagram() {
        return cy.get('g');
    }

    function getReturnButton() {
        return cy.get('.icon-arrow-left');
    }

    function getCurrentSliderValue() {
        // The count is taken from the rz-pointer's attribute and not from a visible in the UI value
        // as the rz-slider library doesn't provide a reliable way to get this. It just has multiple
        // '.rz-bubble' elements and no appropriate selector for the one which holds the visible
        // value.
        return cy.get('.rz-pointer[role="slider"]')
            .then(($element) => $element.attr('aria-valuenow'));
    }

    function searchForClass(name) {
        cy.get('.toolbar-holder .icon-search')
            .click()
            .then(() => {
                cy.get('#search_input_value').type(name).type('{enter}');
            });
    }

    function verifyPrefixes(expectation) {
        cy.get(CLASS_LABEL_SELECTOR)
            .each(($element) => {
                if ($element.prop('style').display !== 'none') {
                    expectation($element);
                }
            });
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

    function verifyClassIsNotExpanded($element) {
        return cy.wrap($element).should('have.css', 'font-size').and('eq', '10px');
    }

    function verifyClassIsExpanded($element) {
        return cy.wrap($element).should('have.css', 'font-size').and('not.eq', '10px');
    }

    function verifyCounterValue(classCount) {
        getCurrentSliderValue()
            .then((currentValue) => {
                expect(currentValue === classCount);
            });
    }
});
