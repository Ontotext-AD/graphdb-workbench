import {BaseSteps} from "../base-steps.js";

export class NotFoundSteps extends BaseSteps {
    static visit(url) {
        BaseSteps.visit(url);
    }

    static getNotFoundBanner() {
        return cy.getByTestId('not-found-banner');
    }

    static getNotFoundContent() {
        return this.getNotFoundBanner().invoke('text');
    }

    static getGoHomeButton() {
        return this.getNotFoundBanner().find('a.btn.btn-primary');
    }

    static clickGoHomeButton() {
        this.getGoHomeButton().click();
    }
}
