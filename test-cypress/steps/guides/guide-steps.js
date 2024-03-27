import {GuideDialogSteps} from "./guide-dialog-steps";
import {MainMenuSteps} from "../main-menu-steps";
import {RepositorySteps} from "../repository-steps";
import {RepositorySelectorSteps} from "../repository-selector-steps";
import {AutocompleteSteps} from "../autocomplete-steps";
import ImportSteps from "../import/import-steps";

export class GuideSteps {
    static visit() {
        cy.visit('/guides');
    }

    static runGuide(guideName) {
        cy.contains('td', guideName)
            .parent()
            .within($tr => {
                cy.get('.btn').click();
            });
    }

    static getElementByGuideSelector(selctor) {
        return cy.get(`[guide-selector="${selctor}"]`);
    }

    static assertIsElementInteractable(selector) {
        cy.get(selector).should('be.visible');
    }

    static uploadFile(fileName) {
        cy.get('#ngf-wb-import-uploadFile')
            .attachFile(`guides/${fileName}`);
        // Wait until import button appeared.
        cy.get(`[guide-selector="import-file-${fileName}"]`);
    }

    static assertPageNotInteractive() {
        cy.get('.shepherd-modal-is-visible');
    }

    static assertWelcomePage(guideName) {
        GuideDialogSteps.assertDialogWithTitleIsVisible(`Welcome to ${guideName} — 2/2`);
        GuideSteps.assertPageNotInteractive();
    }

    static assertCreateRepositoryStep1() {
        GuideDialogSteps.assertDialogWithTitleIsVisible('Create repository — 1/7');
    }

    static assertCreateRepositoryStep2() {
        GuideDialogSteps.assertDialogWithTitleIsVisible('Create repository — 2/7');
        GuideSteps.assertPageNotInteractive();
        MainMenuSteps.getMenuSetup().should('be.visible');
        MainMenuSteps.getMenuButton('Repositories').should('not.be.visible');
    }

    static assertCreateRepositoryStep3() {
        GuideDialogSteps.assertDialogWithTitleIsVisible('Create repository — 3/7');
        GuideSteps.assertPageNotInteractive();
        MainMenuSteps.getMenuButton('Repositories').should('be.visible');
    }

    static assertCreateRepositoryStep4() {
        GuideDialogSteps.assertDialogWithTitleIsVisible('Create repository — 4/7');
        GuideSteps.assertPageNotInteractive();
        RepositorySteps.getCreateRepositoryButton().should('be.visible');
    }

    static assertCreateRepositoryStep5() {
        GuideDialogSteps.assertDialogWithTitleIsVisible('Create repository — 5/7');
        GuideSteps.assertPageNotInteractive();
        RepositorySteps.getGDBRepositoryTypeButton().should('be.visible');
    }

    static assertCreateRepositoryStep6() {
        GuideDialogSteps.assertDialogWithTitleIsVisible('Create repository — 6/7');
        GuideSteps.assertPageNotInteractive();
        RepositorySteps.getRepositoryIdField().should('be.visible');
    }

    static assertCreateRepositoryStep7(repositoryId) {
        GuideDialogSteps.assertDialogWithTitleIsVisible('Create repository — 7/7');
        GuideSteps.assertPageNotInteractive();
        RepositorySteps.getRepositoryIdField().should('have.value', repositoryId);
        RepositorySteps.getSaveRepositoryButton().should('be.visible');
    }

    static createRepositoryByNextButton(repositoryId) {
        GuideSteps.assertCreateRepositoryStep1();

        GuideDialogSteps.clickOnNextButton();
        GuideSteps.assertCreateRepositoryStep2();

        GuideDialogSteps.clickOnNextButton();
        GuideSteps.assertCreateRepositoryStep3();

        GuideDialogSteps.clickOnNextButton();
        GuideSteps.assertCreateRepositoryStep4();

        // Step click on button "GraphDB Repository".
        GuideDialogSteps.clickOnNextButton();
        GuideSteps.assertCreateRepositoryStep5();

        // Step enter "Repository ID".
        GuideDialogSteps.clickOnNextButton();
        GuideSteps.assertCreateRepositoryStep6();

        // Step select "Create" repository button.
        GuideDialogSteps.clickOnNextButton();
        GuideSteps.assertCreateRepositoryStep7(repositoryId);

        GuideDialogSteps.clickOnNextButton();
        GuideSteps.assertPageNotInteractive();
    }

    static assertSelectRepositoryStep1() {
        GuideDialogSteps.assertDialogWithTitleIsVisible('Connect to repository — 1/2');
        RepositorySelectorSteps.getRepositorySelectorsButton().should('be.visible');
    }

    static assertSelectRepositoryStep2(repositoryId) {
        GuideSteps.assertPageNotInteractive();
        GuideDialogSteps.assertDialogWithTitleIsVisible('Connect to repository — 2/2');
        RepositorySelectorSteps.getRepositorySelectorButton(repositoryId).should('be.visible');
    }

    static selectRepositoryByNextButton(repositoryId) {
        GuideSteps.assertSelectRepositoryStep1();

        GuideDialogSteps.clickOnNextButton();
        GuideSteps.assertSelectRepositoryStep2(repositoryId);
    }

    static assertEnableAutocompleteStep1() {
        GuideDialogSteps.assertDialogWithTitleIsVisible('Enable autocomplete — 1/5');
    }

    static assertEnableAutocompleteStep2() {
        GuideDialogSteps.assertDialogWithTitleIsVisible('Enable autocomplete — 2/5');
        GuideSteps.assertPageNotInteractive();
        MainMenuSteps.getMenuSetup().should('be.visible');
    }

    static assertEnableAutocompleteStep3() {
        GuideDialogSteps.assertDialogWithTitleIsVisible('Enable autocomplete — 3/5');
        GuideSteps.assertPageNotInteractive();
        MainMenuSteps.getSubmenuAutocomplete().should('be.visible');
    }

    static assertEnableAutocompleteStep4() {
        GuideDialogSteps.assertDialogWithTitleIsVisible('Enable autocomplete — 4/5');
        GuideSteps.assertPageNotInteractive();
        AutocompleteSteps.getAutocompleteSwitch().should('be.visible');
    }

    static assertEnableAutocompleteStep5() {
        GuideDialogSteps.assertDialogWithTitleIsVisible('Enable autocomplete — 5/5');
        GuideSteps.assertPageNotInteractive();
        AutocompleteSteps.getSuccessStatusElement().should('be.visible');
    }

    static enableAutocompleteByNextButton() {
        GuideSteps.assertEnableAutocompleteStep1();

        // Step select menu setup.
        GuideDialogSteps.clickOnNextButton();
        GuideSteps.assertEnableAutocompleteStep2();

        // Step select autocomplete.
        GuideDialogSteps.clickOnNextButton();
        GuideSteps.assertEnableAutocompleteStep3();

        // Step enable autocomplete index.
        GuideDialogSteps.clickOnNextButton();
        GuideSteps.assertEnableAutocompleteStep4();

        // Step wait autocomplete indexing complete
        GuideDialogSteps.clickOnNextButton();
        GuideSteps.assertEnableAutocompleteStep5();
    }

    static assertImportFileStep1() {
        GuideDialogSteps.assertDialogWithTitleIsVisible('Import file — 1/7');
    }

    static assertImportFileStep2() {
        GuideDialogSteps.assertDialogWithTitleIsVisible('Import file — 2/7');
        GuideSteps.assertPageNotInteractive();
        MainMenuSteps.getMenuImport().should('be.visible');
    }

    static assertImportFileStep3() {
        GuideSteps.assertPageNotInteractive();
        GuideDialogSteps.assertDialogWithTitleIsVisible('Import file — 3/7');
    }

    static assertImportFileStep4() {
        GuideDialogSteps.assertDialogWithTitleIsVisible('Import file — 4/7');
        GuideSteps.assertPageNotInteractive();
        ImportSteps.getImportRdfFileElement().should('be.visible');
    }

    static assertImportFileStep5(fileToImport) {
        GuideDialogSteps.assertDialogWithTitleIsVisible('Import file — 5/7');
        GuideSteps.assertIsElementInteractable('[guide-selector="import-file-' + fileToImport + '"]');
    }

    static assertImportFileStep6() {
        GuideSteps.assertPageNotInteractive();
        GuideDialogSteps.assertDialogWithTitleIsVisible('Import file — 6/7');
    }

    static assertImportFileStep7(fileToImport) {
        GuideDialogSteps.assertDialogWithTitleIsVisible('Import file — 7/7');
        GuideSteps.assertPageNotInteractive();
        ImportSteps.getImportFileRow(fileToImport).contains('Imported successfully');
    }

    static importFileByNextButton(fileToImport) {
        GuideSteps.assertImportFileStep1();

        // Step select "Import" button.
        GuideDialogSteps.clickOnNextButton();
        GuideSteps.assertImportFileStep2();

        // Step described download of file.
        GuideDialogSteps.clickOnNextButton();
        GuideSteps.assertImportFileStep3();

        // Step click Upload RDF files button.
        GuideDialogSteps.clickOnNextButton();
        GuideSteps.assertImportFileStep4();

        GuideSteps.uploadFile(fileToImport);
        GuideSteps.assertImportFileStep5(fileToImport);

        GuideDialogSteps.clickOnNextButton();
        GuideSteps.assertImportFileStep6();

        // Step click on Import button.
        GuideDialogSteps.clickOnNextButton();
        GuideSteps.assertImportFileStep7(fileToImport);
    }

    static runGuideTest(guideName, repositoryId, fileToImport, stepAssertions = []) {
        GuideSteps.runGuide(guideName);
        GuideSteps.assertPageNotInteractive();

        // Step Welcome to Star Wars guide
        GuideDialogSteps.clickOnNextButton();
        GuideSteps.assertWelcomePage(guideName);

        GuideDialogSteps.clickOnNextButton();
        GuideSteps.assertPageNotInteractive();
        GuideSteps.createRepositoryByNextButton(repositoryId);

        // Step select "Choose repository" button.
        GuideSteps.selectRepositoryByNextButton(repositoryId);

        // Step described autocomplete.
        GuideDialogSteps.clickOnNextButton();
        GuideSteps.assertPageNotInteractive();
        GuideSteps.enableAutocompleteByNextButton();

        // Step import file intro
        GuideDialogSteps.clickOnNextButton();
        GuideSteps.assertPageNotInteractive();
        GuideSteps.importFileByNextButton(fileToImport);


        GuideDialogSteps.clickOnNextButton();
        stepAssertions.forEach((stepAssert) => {
            stepAssert.assert();
            GuideDialogSteps.clickOnNextButton(stepAssert.forceButtonClick);
        });

        GuideDialogSteps.assertDialogWithTitleIsVisible('End of guide');
    }
}
