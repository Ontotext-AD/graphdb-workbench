describe('Import screen validation - users', function () {
    let existingRepo = 'w11' + Date.now();
    let rdfTextSnippet1 = '@prefix d:<http://learningsparql.com/ns/data#>.\n' +
        '@prefix dm:<http://learningsparql.com/ns/demo#>.\n' +
        '\n' +
        'd:item342 dm:shipped "2011-02-14"^^<http://www.w3.org/2001/XMLSchema#date>.\n' +
        'd:item342 dm:quantity 4.\n' +
        'd:item342 dm:invoiced true.\n' +
        'd:item342 dm:costPerItem 3.50.';

    let rdfTextSnippet2 = '@prefix ab:<http://learningsparql.com/ns/addressbook#>.\n' +
        '\n' +
        'ab:richard ab:homeTel "(229)276-5135".\n' +
        'ab:richard ab:email "richard49@hotmail.com".\n' +
        'ab:richard ab:email "richard491@hotmail.com".';

    let baseURI = 'http://purl.org/dc/elements/1.1/';
    let context = 'http://example.org/graph';

    let importURL = 'https://www.w3.org/TR/owl-guide/wine.rdf';
    let textSnippet = 'Text snippet';
    let invalidRDFfFormat = 'JSON-LD';
    let validURLRDFfFormat = 'RDF/XML';
    let validSnippetRDFfFormat = 'Turtle';
    let rdfErrorMessage = 'RDF Parse Error:';
    let messageSuccess = 'Imported successfully';

    before(function () {
        cy.visit('/repository');
        // Create new one
        cy.createNewRepo(existingRepo).wait(2000);
    });

    beforeEach(function () {
        cy.visit('/import#user').wait(1000);
        cy.selectRepo(existingRepo);
    });

    afterEach(function () {
        cy.removeUploadedFiles();
        cy.get('#wb-import-fileInFiles').should('be.hidden');
    });

    after(function () {
        cy.navigateToPage('Setup', 'Repositories');
        cy.deleteRepo(existingRepo).wait(1000);
    });

    it('Test import file via URL successfully with Auto format selected', function () {
        cy.openImportURLDialog(importURL);
        cy.clickImportUrlBtn();
        cy.clickImportBtnOnPopUpMenu();
        cy.verifyFileUpload(importURL);
        cy.verifyMessageOccurs(messageSuccess);
    });

    it('Test import file via URL with invalid RDF format selected', function () {
        cy.openImportURLDialog(importURL);
        cy.selectRDFFormat(invalidRDFfFormat);
        cy.clickImportUrlBtn();
        cy.clickImportBtnOnPopUpMenu();
        cy.verifyFileUpload(importURL);
        cy.verifyMessageOccurs(rdfErrorMessage);
    });

    it('Test import file via URL successfully with valid RDF format selected', function () {
        cy.openImportURLDialog(importURL);
        cy.selectRDFFormat(validURLRDFfFormat);
        cy.clickImportUrlBtn();
        cy.clickImportBtnOnPopUpMenu();
        cy.verifyFileUpload(importURL);
        cy.verifyMessageOccurs(messageSuccess);
    });


    it('Test import RDF text snippet successfully with Auto format selected', function () {
        cy.openImportTextSnippetDialog();
        cy.fillRDFTextSnippet(rdfTextSnippet1);
        cy.clickImportRDFTextSnippetBtn();
        cy.clickImportBtnOnPopUpMenu();
        cy.verifyFileUpload(textSnippet);
        cy.verifyMessageOccurs(messageSuccess);
    });

    it('Test import RDF text snippet with invalid RDF format selected', function () {
        cy.openImportTextSnippetDialog();
        cy.fillRDFTextSnippet(rdfTextSnippet1);
        cy.selectRDFFormat(invalidRDFfFormat);
        cy.clickImportRDFTextSnippetBtn();
        cy.clickImportBtnOnPopUpMenu();
        cy.verifyFileUpload(textSnippet);
        cy.verifyMessageOccurs(rdfErrorMessage);
    });

    it('Test import RDF text snippet successfully with valid RDF format selected', function () {
        cy.openImportTextSnippetDialog();
        cy.fillRDFTextSnippet(rdfTextSnippet1);
        cy.selectRDFFormat(validSnippetRDFfFormat);
        cy.clickImportRDFTextSnippetBtn();
        cy.clickImportBtnOnPopUpMenu();
        cy.verifyFileUpload(textSnippet);
        cy.verifyMessageOccurs(messageSuccess);
    });

    it('Test import RDF text snippet successfully with filled base URI and context', function () {
        cy.openImportTextSnippetDialog();
        cy.fillRDFTextSnippet(rdfTextSnippet2);
        cy.clickImportRDFTextSnippetBtn();
        cy.fillBaseURIInputField(baseURI);
        cy.selectNamedGraphCheck();
        cy.fillNamedGraphInputField(context);
        cy.clickImportBtnOnPopUpMenu();
        cy.verifyFileUpload(textSnippet);
        cy.verifyMessageOccurs(messageSuccess);

        // Go to Graphs overview
        cy.navigateToPage('Explore', 'Graphs overview');
        let graphName = context.slice(0, context.lastIndexOf('.'));
        // Verify that created graph is found
        cy.get('.form-control').type(graphName);
        cy.get('#export-graphs').should('be.visible').should('contain', graphName);

        // Should return to initial url in order after each block of the tests to be executed
        cy.navigateToPage('Import', 'RDF');
    });
});
