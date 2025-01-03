const VIEW_URL = '/resource';

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
        ResourceSteps.getSameAsButton().find('.icon-sameas-on').should('have.length', 1);
    }

    static verifySameAsDisable() {
        ResourceSteps.getSameAsButton().find('.icon-sameas-off').should('have.length', 1);
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

    static getVisualGraphButton() {
        return cy.get('.visual-graph-btn');
    }

    static clickOnVisualGraphButton() {
        ResourceSteps.getVisualGraphButton().click();
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

    static getRoleTab(role = 'subject') {
        return ResourceSteps.getRoleSelectionElement().find('.nav-link').contains(role);
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

    static verifyActiveRoleTab(activeRole = 'subject') {
        ResourceSteps.getAllRoles().forEach((role) => {
            const chainer = activeRole === role ? 'have.class' : 'not.have.class';
            ResourceSteps.getRoleTab(role).should(chainer, 'active');
        });
    }

    static getAllRoles() {
        return ['subject', 'predicate', 'object', 'context', 'all'];
    }

    static getTargetLink() {
        return cy.get('.target-link');
    }

    static getTripleResourceLink() {
        return cy.get('.triple-resource-link');
    }

    static clickOnTripleResourceLink() {
        ResourceSteps.getTripleResourceLink().click();
    }
}
