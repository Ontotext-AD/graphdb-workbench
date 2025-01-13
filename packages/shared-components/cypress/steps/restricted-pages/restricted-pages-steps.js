import {BaseSteps} from "../base-steps";

export class RestrictedPagesSteps extends BaseSteps {
    static visit() {
        cy.visit('/pages/restricted-pages');
    }

    static getPageContentElement() {
        return cy.get('#app');
    }

    static makeHomePageRestricted() {
        cy.get('#make-current-page-restricted').click();
    }

    static makeCurrentPageUnrestricted() {
        cy.get('#make-current-page-unrestricted').click();
    }

    static makeRestrictedPagesMapEmpty() {
        cy.get('#make-restriction-pages-map-empty').click();
    }

    static makeRestrictedPagesMapUndefined() {
        cy.get('#make-restriction-pages-map-undefined').click();
    }

    static navigateToRestrictedPage() {
        cy.get('#restricted-page-link').click();
    }

    static navigateToUnrestrictedPage() {
        cy.get('#unrestricted-page-link').click();
    }
}
