/**
 * Reusable functions for interacting with graph dropdown on Class hierarchy and relationships pages.
 */

export const GRAPH_FILE = 'graphdb-news-dataset.zip';
export const ALL_GRAPHS = 'All graphs';
export const NEWS_GRAPH = 'http://example.org/news';

class ClassViewsSteps {
    static visit() {
        cy.visit('/hierarchy');
        cy.window();
    }

    static waitForPageLoad() {
        // Wait for the chart and diagram to be visible, also check if a class is displayed.
        this.getClassChart().scrollIntoView().should('be.visible').within(() => {
            this.getMainGroup().scrollIntoView().should('be.visible');
            this.findClassByName('food:Grape');
            this.getClassInHierarchy().scrollIntoView().should('be.visible');
        });
    }

    static getClassChart() {
        return cy.get('#classChart');
    }

    static getMainGroup() {
        return cy.get('#main-group');
    }

    static getMainGroupTextLabel() {
        return this.getMainGroup().find('text.label');
    }

    static getClassInHierarchy() {
        return cy.get('@classInHierarchy');
    }

    static getToolbarHolder() {
        return cy.get('.toolbar-holder');
    }

    static getToolbarPrefixToggleButton() {
        return this.getToolbarHolder().find('.prefix-toggle-btn');
    }

    static clickPrefixToggleButton() {
        return this.getToolbarPrefixToggleButton().click();
    }

    static getSearchInputDropdown() {
        return cy.get('#search_input_dropdown');
    }

    static getInfoSidePanelCloseButton() {
        return cy.get('[ps-class=rdf-info-side-panel] .close');
    }

    static closeInfoSidePanel() {
        this.getInfoSidePanelCloseButton().click();
    }

    static getFocusDiagramButton() {
        return cy.get('.toolbar-holder .focus-diagram-btn');
    }

    static focusDiagram() {
        this.getFocusDiagramButton().click();
    }

    static getSlider() {
        return cy.get('.class-cnt-slider > .ng-isolate-scope');
    }

    static positionSlider(location) {
        this.getSlider().trigger('click', location);
    }

    static getSVGButton() {
        return cy.get('#download-svg');
    }

    static mouseOverSVGButton() {
        return this.getSVGButton().trigger('mouseover');
    }

    static getDomainRangeGraphButton() {
        return cy.get('.domain-range-graph-btn');
    }

    static openDomainRangeGraph() {
        this.getDomainRangeGraphButton().click();
    }

    static getDomainRangeGraphHeader() {
        return cy.get('h1');
    }

    static getLegendContainer() {
        return cy.get('.legend-container');
    }

    static getMainDomainRangeDiagram() {
        return cy.get('g');
    }

    static getReturnButton() {
        return cy.get('.icon-arrow-left');
    }

    static goBack() {
        this.getReturnButton().click();
    }

    static getCurrentSliderValue() {
        // The count is taken from the rz-pointer's attribute and not from a visible in the UI value
        // as the rz-slider library doesn't provide a reliable way to get this. It just has multiple
        // '.rz-bubble' elements and no appropriate selector for the one which holds the visible
        // value.
        return cy.get('.rz-pointer[role="slider"]');
    }

    static searchForClass() {
        return cy.get('.toolbar-holder .icon-search').click();
    }

    static getSearchInput() {
        return cy.get('#search_input_value');
    }

    static searchForClassName(name) {
        this.getSearchInput().type(name).type('{enter}');
    }

    static clickJQueryElement(element) {
        element.click();
    }

    static findClassByName(className) {
        this.getMainGroupTextLabel()
            .each(($element) => {
                const data = $element.prop('__data__');
                if (data.data.name === className) {
                    cy.wrap($element).as('classInHierarchy');
                }
            });
    }

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
        cy.get('#graphsBtnGroup').click();
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
        cy.get('.modal-footer .confirm-btn').click();
        cy.get('.modal').should('not.exist');
    }

    static reloadDiagram() {
        cy.get('.reload-diagram-btn').click();
    }
}

export default ClassViewsSteps;
