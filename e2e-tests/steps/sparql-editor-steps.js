import {YasqeSteps} from "./yasgui/yasqe-steps";

const VIEW_URL = '/sparql';

export class SparqlEditorSteps {
    static visitSparqlEditorPage() {
        cy.visit(VIEW_URL);
    }

    static visitSparqlEditorPageAndWaitForEditor() {
        SparqlEditorSteps.visitSparqlEditorPage();
        // Because we use angularjs less than 1.7.3 we use additional library ng-custom-element.umd.js to solve problem with property bindings
        // This library make additional call to ontotext-yasgui-web-component and the component that's way the component renders twice when page loaded.
        // This is bad because in tests cypress can find an element when it is rendered from first call and try to click it for example.
        // If time of clicking such element is when second call to the component is done then exception that element is detached will be thrown.
        // We will wait a little , to give a chance page is loaded correctly before test start.
        // eslint-disable-next-line cypress/no-unnecessary-waiting
        cy.wait(1000);
        YasqeSteps.waitUntilQueryIsVisible();
    }

    static verifyUrl() {
        cy.url().should('include', `${Cypress.config('baseUrl')}${VIEW_URL}`);
    }
}
