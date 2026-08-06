const VIEW_URL = '/resource';

/**
 * The label of the "triple term" role tab. It differs from the role itself, which is "triple-term".
 * @type {string}
 */
export const TRIPLE_TERM_ROLE_LABEL = 'triple term';

export class ResourceSteps {

    static visit(parameters) {
        cy.visit(`${VIEW_URL}${parameters ? ('?' + parameters) : ''}`);
        // Wait for yasr to be initialized to ensure that the page is loaded.
        cy.get('.yasr');
    }

    static verifyUrl() {
        cy.url().should('include+', `${Cypress.config('baseUrl')}${VIEW_URL}`);
    }

    static getInferenceSelectElement() {
        return cy.get('#inference-select');
    }

    static selectInference(inference = 'Explicit only') {
        ResourceSteps.getInferenceSelectElement().select(inference);
    }

    static selectExplicitOnlyInference() {
        ResourceSteps.selectInference();
    }

    static selectImplicitOnlyInference() {
        ResourceSteps.selectInference('Implicit only');
    }

    static selectExplicitAndImplicitInference() {
        ResourceSteps.selectInference('Explicit and Implicit');
    }

    static getSameAsButton() {
        return cy.get('.same-as-btn');
    }

    static verifySameAsEnable() {
        ResourceSteps.getSameAsButton().find('.icon-same-as-on').should('have.length', 1);
    }

    static verifySameAsDisable() {
        ResourceSteps.getSameAsButton().find('.icon-same-as-off').should('have.length', 1);
    }

    static getShowBlankNodesButton() {
        return cy.get('.show-blank-nodes-btn');
    }

    static clickOnShowBlankNodesButton() {
        ResourceSteps.getShowBlankNodesButton().click();
    }

    static getDownloadAsDropdown() {
        return cy.get('.download-as');
    }

    static clickDownloadAsOption(option) {
        this.getDownloadAsDropdown().click();
        cy.get('.download-options li').eq(option).click();
    }

    static getEditResourceLink() {
        return cy.get('.edit-resource-link');
    }

    static clickOnEditResourceLink() {
        ResourceSteps.getEditResourceLink().click();
    }

    static getSourceLink() {
        return cy.get('.source-link');
    }

    static clickOnSourceLink() {
        ResourceSteps.getSourceLink().click();
    }

    static getContextLink() {
        return cy.get('.context-link');
    }

    static clickOnContextLink() {
        ResourceSteps.getContextLink().click();
    }

    static getRoleSelectionElement() {
        return cy.get('#selection');
    }

    static getRoleTabs() {
        return ResourceSteps.getRoleSelectionElement().find('.nav-link');
    }

    static getRoleTab(role = 'subject') {
        return ResourceSteps.getRoleTabs().contains(role);
    }

    static selectRole(role) {
        ResourceSteps.getRoleTab(role).click({force: false});
    }

    static selectSubjectRole() {
        ResourceSteps.selectRole('subject');
    }

    static selectPredicateRole() {
        ResourceSteps.selectRole('predicate');
    }

    static selectObjectRole() {
        ResourceSteps.selectRole('object');
    }

    static selectContextRole() {
        ResourceSteps.selectRole('context');
    }

    static getAllRoleTab() {
        return ResourceSteps.getRoleTab('all');
    }

    static selectAllRole() {
        ResourceSteps.getAllRoleTab().click();
    }

    /**
     * Verifies that the tab of the given role is the only active one. Only the rendered tabs are checked,
     * because the "triple term" tab is rendered for triple terms only.
     *
     * @param {string} activeRole the label of the role tab which is expected to be active
     */
    static verifyActiveRoleTab(activeRole = 'subject') {
        // Assert that the expected tab is rendered at all, otherwise the check below passes vacuously.
        ResourceSteps.getRoleTab(activeRole).should('have.class', 'active');
        ResourceSteps.getRoleTabs().each(($tab) => {
            const chainer = $tab.text().trim() === activeRole ? 'have.class' : 'not.have.class';
            cy.wrap($tab).should(chainer, 'active');
        });
    }

    static verifyRoleTabDisabled(role) {
        ResourceSteps.getRoleTab(role)
            .should('have.class', 'disabled')
            .and('have.attr', 'tabindex', '-1');
    }

    static verifyRoleTabEnabled(role) {
        ResourceSteps.getRoleTab(role)
            .should('not.have.class', 'disabled')
            .and('have.attr', 'tabindex', '0');
    }

    static verifyRoleTabMissing(role) {
        ResourceSteps.getRoleTabs().contains(role).should('not.exist');
    }

    /**
     * @return {string[]} the roles which can be selected for a resource which is not a triple term.
     */
    static getPlainResourceRoles() {
        return ['subject', 'predicate', 'object', 'context', 'all'];
    }

    /**
     * @return {string[]} the labels of all role tabs, including the "triple term" one.
     */
    static getAllRoles() {
        return [TRIPLE_TERM_ROLE_LABEL, ...ResourceSteps.getPlainResourceRoles()];
    }

    static getTargetLink() {
        return cy.get('.target-link');
    }

    static clickOnTargetLink() {
        ResourceSteps.getTargetLink().click();
    }

    static getTripleResourceLink() {
        return cy.get('.triple-resource-link');
    }

    static clickOnTripleResourceLink() {
        ResourceSteps.getTripleResourceLink().click();
    }

    /**
     * Verifies the text of an element after trimming it. The templates surround the interpolated
     * values with whitespace, which makes a plain "have.text" assertion unusable.
     *
     * @param {Cypress.Chainable} element the element whose text has to be verified
     * @param {string} expectedText the expected text without any surrounding whitespace
     */
    static verifyTrimmedText(element, expectedText) {
        element.invoke('text').invoke('trim').should('eq', expectedText);
    }

    static getDataTable() {
        return cy.get('.dataTable');
    }
}
