import {REPOSITORIES_URL} from "../support/repository-commands";

export class OntopRepositorySteps {

    static visitCreate() {
        cy.visit('/repository/create/ontop');
    }
    static getOBDAFileField() {
        return cy.get('div').contains("OBDA or R2RML file *").parent();
    }

    static getOBDAUploadButton() {
        return cy.get('span[for="obdaFile"]').contains("Upload file...");
    }

    static getOntologyFileField() {
        return cy.get('div').contains("Ontology file");
    }

    static getOntologyUploadButton() {
        return cy.get('span[for="owlFile"]').contains("Upload file...");
    }

    static getLensesFileField() {
        return cy.get('div').contains("Lenses file");
    }

    static getLensesUploadButton() {
        return cy.get('span[for="lensesFile"]').contains("Upload file...");
    }

    static getConstraintFileField() {
        return cy.get('div').contains("Constraint file");
    }

    static getConstraintUploadButton() {
        return cy.get('span[for="constraintFile"]').contains("Upload file...");
    }

    static uploadConfigurationFile(file, filename) {
        const fileType = '';
        const url = REPOSITORIES_URL + 'file/upload';
        const blob = Cypress.Blob.binaryStringToBlob(file, fileType);
        const formData = new FormData();
        formData.set('file', blob, filename);
        return cy.form_request(url, formData);
    }

    static getCreateRepositoryButton() {
        return cy.get('#addSaveOntopRepository');
    }

    static clickOnCreateRepositoryButton() {
        OntopRepositorySteps.getCreateRepositoryButton().click();
    }

    static getDatabaseDriver() {
        return cy.get('#driverType');
    }

    static selectDatabaseDriver(driverType) {
        OntopRepositorySteps.getDatabaseDriver()
            .select(driverType);
    }

    static selectMySqlDatabase() {
        OntopRepositorySteps.selectDatabaseDriver('MySQL');
    }

    static selectSnowflakeDatabase() {
        OntopRepositorySteps.selectDatabaseDriver('Snowflake');
    }

    static selectOracleDatabase() {
        OntopRepositorySteps.selectDatabaseDriver('Oracle');
    }

    static getDriverClassInput() {
        return cy.get('#driverClass');
    }

    static getUrlInput() {
        return cy.get('#url');
    }

    static getHostNameInput() {
        return cy.get('#hostName');
    }

    static typeHostName(host) {
        OntopRepositorySteps.getHostNameInput().type(host);
    }

    static getPortInput() {
        return cy.get('#port');
    }

    static typePort(port) {
        OntopRepositorySteps.getPortInput().type(port);
    }

    static getDatabaseNameInput() {
        return cy.get('#databaseName');
    }

    static typeDatabaseName(database) {
        OntopRepositorySteps.getDatabaseNameInput().type(database);
    }

    static getTestConnectionButton() {
        return cy.get('#testConnection');
    }

    static clickObdaFileUploadButton() {
        OntopRepositorySteps.getOBDAUploadButton().click();
    }

    static uploadObdaFile(file) {
        // The label for the input has visibility: hidden, so force must be used
        // eq() index 0 for location of OBDA field input
        cy.get('input[type=file]').eq(0).selectFile(file, {force: true});
    }
}
