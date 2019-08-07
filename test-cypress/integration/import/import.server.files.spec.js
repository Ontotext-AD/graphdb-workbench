describe('Import screen validation', function () {
    let existingRepo = 'w11' + Date.now();
    let baseURI = 'http://purl.org/dc/elements/1.1/';
    let context = 'http://example.org/context';
    let messageSuccess = 'Imported successfully';
    let fileToImport = 'italian_public_schools_links.nt.gz';
    let blankNodeFile = 'bnodes.ttl';

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
        cy.checkAllServerFiles(true);
        cy.resetStatusOfUploadedFiles().wait(1000);
        cy.checkAllServerFiles(false);
    });

    after(function () {
        cy.navigateToPage('Setup', 'Repositories');
        cy.deleteRepo(existingRepo).wait(1000);
    });

    it('Test import Server files successfully without changing settings', function () {
        cy.chooseServerFilesTab();
        cy.selectDistinctFileToImport(fileToImport);
        cy.importChangingSettings().wait(2000);
        cy.verifyMessageOccurs(messageSuccess);
    });

    it('Test import Server files successfully with changing base uri', function () {
        cy.chooseServerFilesTab();
        cy.selectDistinctFileToImport(fileToImport);
        cy.importChangingSettings(true);
        cy.fillBaseURIInputField(baseURI).wait(1000);
        cy.clickImportBtnOnPopUpMenu().wait(1500);
        cy.verifyMessageOccurs(messageSuccess);
        cy.confirmTextPresentsInDistinctFileInfo(baseURI, fileToImport);
    });

    it('Test import Server files successfully with changing context on newly created repository', function () {
        let repoId = 'repo1' + Date.now();
        // First navigate to create repository
        cy.navigateToPage('Setup', 'Repositories');
        // Create new one
        cy.createNewRepo(repoId).wait(2000);
        cy.selectRepo(repoId).wait(1000);
        // Should return to import page
        cy.navigateToPage('Import', 'RDF');

        cy.chooseServerFilesTab();
        cy.selectDistinctFileToImport(fileToImport);
        cy.importChangingSettings(true);
        cy.selectNamedGraphCheck();
        cy.fillNamedGraphInputField(context).wait(1000);
        cy.clickImportBtnOnPopUpMenu().wait(2000);
        cy.verifyMessageOccurs(messageSuccess);
        cy.confirmTextPresentsInDistinctFileInfo(context, fileToImport);

        // First navigate to create repository
        cy.navigateToPage('Setup', 'Repositories');
        cy.deleteRepo(repoId).wait(1000);
        cy.selectRepo(existingRepo).wait(1000);
        // Should return to import page
        cy.navigateToPage('Import', 'RDF');
        cy.chooseServerFilesTab();
    });

    it('Test import Server file successfully with preserve BNodes IDs = false', function () {
        let repoId = 'repo2' + Date.now();
        // First navigate to create repository
        cy.navigateToPage('Setup', 'Repositories');
        // Create new one
        cy.createNewRepo(repoId).wait(2000);
        cy.selectRepo(repoId).wait(1000);
        // Should return to import page
        cy.navigateToPage('Import', 'RDF');

        cy.chooseServerFilesTab();
        cy.selectDistinctFileToImport(blankNodeFile);
        cy.importChangingSettings().wait(2000);
        cy.verifyMessageOccurs(messageSuccess);
        cy.confirmTextPresentsInDistinctFileInfo('"preserveBNodeIds": false,', blankNodeFile);

        // First navigate to create repository
        cy.navigateToPage('Setup', 'Repositories');
        cy.deleteRepo(repoId).wait(1000);
        cy.selectRepo(existingRepo).wait(1000);
        // Should return to import page
        cy.navigateToPage('Import', 'RDF');
        cy.chooseServerFilesTab();
    });


    it('Test import Server file successfully with preserve BNodes IDs = true', function () {
        let repoId = 'repo3' + Date.now();
        // First navigate to create repository
        cy.navigateToPage('Setup', 'Repositories');
        // Create new one
        cy.createNewRepo(repoId).wait(2000);
        cy.selectRepo(repoId).wait(1000);
        // Should return to import page
        cy.navigateToPage('Import', 'RDF');

        cy.chooseServerFilesTab();

        cy.selectDistinctFileToImport(blankNodeFile);
        cy.importChangingSettings(true);
        cy.expandAdvancedSettings();
        cy.get('[name="preserveBNodeIDs"]').check();
        cy.clickImportBtnOnPopUpMenu().wait(1500);
        cy.verifyMessageOccurs(messageSuccess);
        cy.confirmTextPresentsInDistinctFileInfo('"preserveBNodeIds": true,', blankNodeFile);

        // First navigate to create repository
        cy.navigateToPage('Setup', 'Repositories');
        cy.deleteRepo(repoId).wait(1000);
        cy.selectRepo(existingRepo).wait(1000);
        // Should return to import page
        cy.navigateToPage('Import', 'RDF');
        cy.chooseServerFilesTab();
    });

    it('Test import all Server files successfully without changing settings', function () {
        cy.chooseServerFilesTab();
        cy.checkAllServerFiles(true);
        cy.importChangingSettings().wait(2000);
        cy.verifyMessageOccurs(messageSuccess);
    });
})
