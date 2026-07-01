import {BaseSteps} from "./base-steps.js";

const VIEW_URL = '/reactodia';

export class ReactodiaSteps extends BaseSteps {

    static visit(uri) {
        cy.visit(`${VIEW_URL}${uri ? ('?uri=' + uri) : ''}`);
    }

    static verifyUrl() {
        this.validateUrl(`${Cypress.config('baseUrl')}${VIEW_URL}`);
    }

    static verifyStartResourceUri(uri) {
        cy.getQueryParam('uri').should('eq', uri);
    }

    static getComponent() {
        return cy.get('graphwise-reactodia');
    }

    static getWorkspace() {
        return ReactodiaSteps.getComponent().find('.reactodia-workspace');
    }

    static getCanvas() {
        return ReactodiaSteps.getComponent().find('.reactodia-canvas');
    }

    static getSearchInput() {
        return ReactodiaSteps.getComponent().find('.reactodia-unified-search__search-input');
    }

    static getElements() {
        return ReactodiaSteps.getCanvas().find('[data-element-id]');
    }

    static getElement(text) {
        return ReactodiaSteps.getCanvas().find(`[data-element-id]`).contains(text).first();
    }
}
