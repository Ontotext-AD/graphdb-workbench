import {LicenseWidgetSteps} from './widgets/license-widget-steps';
import {RepositoryErrorsWidgetSteps} from './widgets/repository-errors-widget-steps';
import {ActiveRepositoryWidgetSteps} from './widgets/active-repository-widget-steps';
import {SavedSparqlQueriesWidgetSteps} from './widgets/saved-sparql-queries-widget-steps';
import {RepositorySteps} from './repository-steps';
import {BaseSteps} from './base-steps';
import {EnvironmentStubs} from '../stubs/environment-stubs';

class HomeSteps extends BaseSteps {

    static visit() {
        cy.visit('/');
        HomeSteps.getTutorialPanel().should('be.visible');
    }

    static visitInProdMode() {
        cy.visit('/', {
            onBeforeLoad: () => {
                EnvironmentStubs.stubWbProdMode();
            }
        });
    }

    static visitInDevMode() {
        cy.visit('/', {
            onBeforeLoad: () => {
                EnvironmentStubs.stubWbDevMode();
            }
        });
    }

    static visitAndWaitLoader() {
        cy.visit('/');
        return cy.get('.ot-loader-new-content').should('not.exist');
    }

    static getLayout() {
        return cy.get('.wb-layout');
    }

    static getView() {
        return cy.get('#wb-home');
    }

    static getTutorialPanel() {
        return cy.get('.tutorial-container');
    }

    static hideTutorial() {
        this.getTutorialPanel().find('.decline-tutorial').click();
    }

    static showTutorialPanel() {
        this.getView().find('.show-tutorial').click();
    }

    static getNavigationMenu() {
        return this.getLayout().find('.wb-navbar');
    }

    static getPageHeader() {
        return this.getLayout().find('.wb-header');
    }

    // ===========================
    // RDF search box
    // ===========================

    static getRDFSearchButton() {
        return this.getPageHeader().find('.rdf-search-button i');
    }

    // ===========================
    // Repository selector
    // ===========================

    static getRepositorySelector() {
        return this.getPageHeader().find('onto-repository-selector');
    }

    static getSelectedRepository() {
        return this.getRepositorySelector().find('.onto-dropdown-button');
    }

    // ===========================
    // Language selector
    // ===========================

    static getLanguageSelector() {
        return this.getPageHeader().find('onto-language-selector');
    }

    static getSelectedLanguage() {
        return this.getLanguageSelector().find('.onto-dropdown-button');
    }

    // ===========================
    // Active repository widget
    // ===========================

    static getActiveRepositoryWidget() {
        return ActiveRepositoryWidgetSteps.getWidget();
    }

    // ===========================
    // License widget
    // ===========================

    static getLicenseWidget() {
        return LicenseWidgetSteps.getWidget();
    }

    // ===========================
    // Repository errors widget
    // ===========================

    static getRepositoryErrorsWidget() {
        return RepositoryErrorsWidgetSteps.getWidget();
    }

    // ===========================
    // Saved SPARQL queries widget
    // ===========================

    static getSavedSparqlQueriesWidget() {
        return SavedSparqlQueriesWidgetSteps.getWidget();
    }

    // ===========================
    // Page footer
    // ===========================

    static getPageFooter() {
        return cy.get('.footer-component');
    }

    // ==========================

    static selectSPARQLQueryToExecute(query) {
        cy.contains('ul.saved-queries li', query)
            .as('savedQueryItem')
            .scrollIntoView();

        cy.get('@savedQueryItem')
            .should('be.visible');

        cy.get('@savedQueryItem')
            .trigger('hover');

        cy.get('@savedQueryItem')
            .find('.execute-saved-query')
            .click({force: true});
    }


    static verifyQueryLink(queryName, modifiesRepoModal) {
        HomeSteps.selectSPARQLQueryToExecute(queryName);
        modifiesRepoModal ? cy.get('.modal-body').should('be.visible') : cy.get('.modal-body').should('not.exist');
        HomeSteps.visitAndWaitLoader();
    }

    static selectRepo(repositoryId) {
        HomeSteps.visitAndWaitLoader();
        cy.get('ul.repos')
            .contains(repositoryId)
            .closest('.repository')
            .click();
    }

    static createRepo() {
        const repositoryId = 'home-repository-' + Date.now();
        cy.createRepository({id: repositoryId});
        return repositoryId;
    }

    static verifyRepositoryIsSelected(repositoryId) {
        return RepositorySteps.getRepositorySelection().should('contain', repositoryId);
    }

    static hasRepositoryInfo(repositoryId) {
        cy.get('.active-repo-card')
            .should('contain', repositoryId)
            .and('contain', 'total statements')
            .and('contain', 'explicit')
            .and('contain', 'inferred')
            .and('contain', 'expansion ratio')
            .within(() => {
                cy.get('.total-statements').should('contain', '70');
                cy.get('.explicit-statements').should('contain', '0');
                cy.get('.inferred-statements').should('contain', '70');
            });
    }

    static getCreateRepositoryLink() {
        return cy.get('.create-repository-btn');
    }

    static verifyCreateRepositoryLink() {
        cy.get('.card.repository-errors').should('be.visible')
            .within(() => {
                HomeSteps.getCreateRepositoryLink()
                    .click()
                    .url()
                    .should('eq', Cypress.config('baseUrl') + '/repository/create?previous=%2F');
            });
        cy.get('.big-logo').click();
    }

    static verifyTutorialText(number, text) {
        cy.get('.btn-toolbar > .btn-group >').eq(number).click();
        cy.get('.tutorial-container h1').contains(text).should('be.visible');
    }

    static noAutocompleteToast() {
        // Verify that the “Enable autocomplete” toast message is displayed.
        cy.get('.autocomplete-toast')
            .contains('Autocomplete is OFF').should('be.visible');
    }

    static getAutocompleteInput() {
        return cy.get('.home-rdf-resource-search search-resource-input .view-res-input')
            .should('be.visible');
    }

    static shouldHaveAutocompleteResult(uri) {
        return HomeSteps.getAutocompleteResultElement(uri).should('be.visible');
    }

    static autocompleteText(text, uri) {
        HomeSteps.getAutocompleteInput().type(text);
        return HomeSteps.shouldHaveAutocompleteResult(uri);
    }

    static getAutocompleteResultElement(uri) {
        return cy.get('#auto-complete-results-wrapper p')
            .contains(uri)
            .trigger('mouseover');
    }

    static verifyAutocompleteResourceLink(uri) {
        cy.get('#results-loader.ot-loader').should('not.exist');
        cy.get('.resource-info').should('be.visible').and('contain', uri);
    }

    static getAutocompleteButton(type) {
        return cy.get('.home-rdf-resource-search search-resource-input .autocomplete-' + type + '-btn');
    }

    static getAutocompleteDisplayTypeButton(type) {
        return cy.get('.home-rdf-resource-search search-resource-input .display-type-' + type + '-btn');
    }

    static goBackAndWaitAutocomplete(callback) {
        cy.server();
        cy.route('/rest/autocomplete/enabled').as('getAutocompleteStatus');
        cy.go('back');
        cy.wait('@getAutocompleteStatus').then(callback);
    }

    static getRdfResourceSearchComponent() {
        return this.getByTestId('search-rdf-resource-component');
    }

    static getRdfResourceSearchInput() {
        return this.getRdfResourceSearchComponent().getByTestId('rdf-resource-input');
    }

    static getAutocompleteResultsContainer() {
        return this.getRdfResourceSearchComponent().getByTestId('auto-complete-results');
    }

    static getAutocompleteSuggestion() {
        return this.getAutocompleteResultsContainer().getByTestId('autocomplete-suggestion');
    }

    static getAutocompleteSuggestionByPartialText(partialText) {
        return this.getAutocompleteSuggestion().contains(partialText);
    }

    static getTableDisplayButton() {
        return this.getRdfResourceSearchComponent().getByTestId('display-table-button');
    }

    static getVisualDisplayButton() {
        return this.getRdfResourceSearchComponent().getByTestId('display-visual-button');
    }

    static getRdfResourceSearchCloseButton() {
        return this.getRdfResourceSearchComponent().getByTestId('rdf-resource-clear-button');
    }

    static closeRdfResourceSearchBox() {
        this.getRdfResourceSearchCloseButton().click();
    }

    static getViewResourceAsLabel() {
        return cy.get('#view-resource-label-home');
    }

    static getActiveRepoAsLabel() {
        return cy.get('#active-repo-label-home');
    }

    static getSavedSparqlQueriesAsLabel() {
        return cy.get('#saved-queries-label-home');
    }

    static getLicenseAsLabel() {
        return cy.get('#license-label-home');
    }

    static getCookieConsentPopup() {
        return cy.get('.cookie-consent-modal');
    }

    static getAgreeButton() {
        return HomeSteps.getCookieConsentPopup().find('button');
    }

    static clickAgreeButton() {
        return HomeSteps.getAgreeButton().click();
    }

    static getCookiePolicyLink() {
        return cy.get('.cookie-consent-content a');
    }

    static clickCookiePolicyLink() {
        return HomeSteps.getCookiePolicyLink().click();
    }

    static getCookiePolicyModal() {
        return cy.get('.cookie-policy-modal');
    }

    static getDocumentationLink() {
        return cy.get('[guide-selector="sub-menu-documentation"]');
    }

    static getTutorialsLink() {
        return cy.get('[guide-selector="sub-menu-developer-hub"]');
    }

    static getSupportLink() {
        return cy.get('[guide-selector="sub-menu-support"]');
    }
}

export default HomeSteps;
