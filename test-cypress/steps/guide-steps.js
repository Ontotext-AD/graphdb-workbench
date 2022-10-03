class GuideSteps {
    static visitGuidesPage() {
        cy.get('[guide-selector="menu-help"]').click();
        cy.get('[guide-selector="sub-menu-guide"]').click();
    }

    static runGuide(guideName) {
        cy.contains('td', guideName)
            .parent()
            .within($tr => {
                cy.get('.btn').click();
            });
    }

    static cancelGuide() {
        cy.get('.shepherd-cancel-icon:visible').click();
    }

    static verifyPageNotInteractive() {
        cy.get('.shepherd-modal-is-visible');
    }

    static clickOnNextButton(stepIndex, waitForAnimations = false) {
        cy.get(`[data-shepherd-step-id="${stepIndex}"] footer button:visible`).contains('Next').click({waitForAnimations});
    }

    static verifyIsElementInteractable(selector) {
        cy.get(selector).should('be.visible');
    }

    static clickOnMenuSetup() {
        cy.get('[guide-selector="menu-setup"]').click();
    }

    static clickOnSubMenuRepositories() {
        cy.get('[guide-selector="sub-menu-repositories"]').click();
    }

    static clickOnOpenCreateRepositoryFormButton() {
        cy.get('[guide-selector="createRepository"]').click();
    }

    static clickOnCreateRepositoryButton() {
        cy.get('[guide-selector="graphDBRepositoryCrateButton"]').click();
    }

    static clickOnGraphDBRepositoryButton() {
        cy.get('[guide-selector="createGraphDBRepository"]').click();
    }

    static clickOnChooseRepositoryButton() {
        cy.get('[guide-selector="repositoriesGroupButton"]').click();
    }

    static clickOnSelectRepositoryButton(repositoryId) {
        cy.get(`[guide-selector="repository-${repositoryId}-button"]`).click();
    }

    static clickOnSubMenuAutocompleteButton() {
        cy.get('[guide-selector="sub-menu-autocomplete"]').click();
    }

    static clickOnEnableAutocompleteButton() {
        cy.get('[guide-selector="autocompleteCheckbox"]').click();
    }

    static clickOnMenuImportButton() {
        cy.get('[guide-selector="menu-import"]').click();
    }

    static clickOnImportRepositoryRdfFileButton(rdfFileName) {
        cy.get(`[guide-selector="import-file-${rdfFileName}"]`).click();
    }

    static clickOnImportButton() {
        cy.get(`[guide-selector="import-settings-import-button"]`).click();
    }

    static clickOnMenuExploreButton() {
        cy.get(`[guide-selector="menu-explore"]`).click();
    }

    static clickOnSubMenuVisualGraphButton() {
        cy.get(`[guide-selector="sub-menu-visual-graph"]`).click();
    }

    static clickOnVisualGraphNodeButton(iri) {
        cy.get(`.node-wrapper[id^="${iri}"] circle`).click();
    }

    static clickOnClosePropertiesInfoPanelButton() {
        cy.get('[guide-selector="close-info-panel"]').click();
    }

    static clickOnMenuSparqlButton() {
        cy.get('[guide-selector="menu-sparql"]').click();
    }

    static clickOnSaprqlRunButton() {
        cy.get('[guide-selector="runSparqlQuery"]').click();
    }

    static dblclickOnVisualGraphNodeButton(iri) {
        cy.get(`.node-wrapper[id^="${iri}"] circle`).dblclick();
    }

    static typeToRepositoryIdField(repositoryId) {
        cy.get('[guide-selector="graphDBRepositoryIdInput"]').type(repositoryId);
    }

    static typetToSearchRdfResources(input) {
        cy.get('[guide-selector="graphVisualisationSearchInputNotConfigured"] input').type(input);
    }

    static waitDialogWithTitleBeVisible(text, stepIndex) {
        cy.get(`[data-shepherd-step-id="${stepIndex}"]:visible`).contains(text);
    }

    static uploadFile(fileName) {
        cy.get('#ngf-wb-import-uploadFile')
            .attachFile(`guides/${fileName}`);
        // Wait until import button appeared.
        cy.get(`[guide-selector="import-file-${fileName}"]`);
    }

    static verifyIsNotElementInteractable(selector) {
        cy.get(selector).should('not.be.visible');
    }

    static verifyNextButtonNotVisible() {
        cy.get('.shepherd-content:visible .shepherd-button:visible').contains('Next').should('not.exist');
    }

    static verifyNextButtonIsVisible() {
        cy.get('.shepherd-button:visible').contains('Next').should('have.length', 1);
    }

    static clickOnPreviousButton(stepIndex, waitForAnimations = false) {
        cy.get(`[data-shepherd-step-id="${stepIndex}"] footer button:visible`).contains('Previous').click({waitForAnimations});
    }

    static clickOnPauseButton() {
        cy.get('.shepherd-button:visible').contains('Pause').click({waitForAnimations: false});
    }

    static verifyPauseButtonNotVisible() {
        cy.get('.shepherd-content:visible .shepherd-button:visible').contains('Pause').should('not.exist');
    }

    static clickOnSkipButton() {
        cy.get('.shepherd-button:visible').contains('Skip').click({waitForAnimations: false});
    }

    static verifySkipButtonNotVisible() {
        cy.get('.shepherd-content:visible .shepherd-button:visible').contains('Pause').should('not.exist');
    }
}

export default GuideSteps;
