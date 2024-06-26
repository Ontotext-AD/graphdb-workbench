export class JsonLdModalSteps {
    static getJSONLDModal() {
        return cy.get('.modal-content');
    }

    static selectJSONLDMode(option) {
        cy.get('[id=wb-JSONLD-mode]').select(option);
    }

    static getSelectedJSONLDModeField() {
        return cy.get('#wb-JSONLD-mode option:checked');
    }

    static getJSONLDFrame() {
        return cy.get('[id=wb-JSONLD-frame]');
    }

    static getJSONLDContext() {
        return cy.get('[id=wb-JSONLD-context]');
    }

    static typeJSONLDFrame(text) {
        this.getJSONLDFrame().type(text);
    }

    static typeJSONLDContext(text) {
        this.getJSONLDContext().type(text);
    }

    static clickExportJSONLD() {
        cy.get('[id=wb-export-JSONLD]').click();
    }

    static clickRestoreDefaultsJSONLD() {
        cy.get('.restore-defaults').click();
    }

    static verifyFileExists(fileName) {
        cy.readFile('cypress/downloads/' + fileName);
    }
}
