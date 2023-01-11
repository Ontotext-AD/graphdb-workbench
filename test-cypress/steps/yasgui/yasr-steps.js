export class YasrSteps {
    static getYasr() {
        return cy.get('.yasr');
    }

    static getResultHeader() {
        return cy.get('.yasr_header');
    }

    static getErrorHeader() {
        return YasrSteps.getResultHeader().get('.errorHeader');
    }

    static getResults() {
        return cy.get('.yasr_results tbody').find('tr');
    }

    static getResultFilter() {
        return cy.get('.tableFilter');
    }
}
