describe('Graphs overview screen validation', function () {

    let repoId = 'graphRepo' + Date.now();
    let messageSuccess = 'Imported successfully';
    let graphToDelete = "urn:9";
    let graphToSearch = "urn:2";
    let validSnippetRDFfFormat = "TriG";
    let rdfTextSnippet1 = "<urn:1> {<urn:a1> <urn:b1> <urn:c1> .}\n" +
        "<urn:2> {<urn:a2> <urn:b2> <urn:c2> .}\n" +
        "<urn:3> {<urn:a3> <urn:b3> <urn:c3> .}\n" +
        "<urn:4> {<urn:a4> <urn:b4> <urn:c4> .}\n" +
        "<urn:5> {<urn:a5> <urn:b5> <urn:c5> .}\n" +
        "<urn:6> {<urn:a6> <urn:b6> <urn:c6> .}\n" +
        "<urn:7> {<urn:a7> <urn:b7> <urn:c7> .}\n" +
        "<urn:8> {<urn:a8> <urn:b8> <urn:c8> .}\n" +
        "<urn:9> {<urn:a9> <urn:b9> <urn:c9> .}\n" +
        "<urn:10> {<urn:a10> <urn:b10> <urn:c10> .}\n" +
        "<urn:11> {<urn:a11> <urn:b11> <urn:c11> .}\n" +
        "<urn:12> {<urn:a12> <urn:b12> <urn:c12> .}\n" +
        "<urn:13> {<urn:a13> <urn:b13> <urn:c13> .}\n" +
        "<urn:14> {<urn:a14> <urn:b14> <urn:c14> .}\n" +
        "<urn:15> {<urn:a15> <urn:b15> <urn:c15> .}\n" +
        "<urn:16> {<urn:a16> <urn:b16> <urn:c16> .}\n" +
        "<urn:17> {<urn:a17> <urn:b17> <urn:c17> .}\n" +
        "<urn:18> {<urn:a18> <urn:b18> <urn:c18> .}\n" +
        "<urn:19> {<urn:a19> <urn:b19> <urn:c19> .}\n" +
        "<urn:20> {<urn:a20> <urn:b20> <urn:c20> .}\n" +
        "<urn:21> {<urn:a21> <urn:b21> <urn:c21> .}";


    before(function () {
        cy.visit('/repository');
        // Create new one
        cy.createNewRepo(repoId).wait(2000);
        cy.setRepoDefault(repoId);
        cy.selectRepo(repoId);

        // Import Wine dataset which will be used in most of the following tests
        cy.navigateToPage('Import', 'RDF');
        cy.openImportTextSnippetDialog();
        cy.fillRDFTextSnippet(rdfTextSnippet1);
        cy.selectRDFFormat(validSnippetRDFfFormat);
        cy.clickImportRDFTextSnippetBtn();
        cy.clickImportBtnOnPopUpMenu();
        cy.verifyMessageOccurs(messageSuccess);
    });

    beforeEach(function () {
        // Go to Graphs overview page
        cy.visit('/graphs').wait(1000);
    });

    after(function () {
        cy.navigateToPage('Setup', 'Repositories');
        cy.deleteRepo(repoId);
    });

    it('Test graphs overview pagination is visible', function () {

        cy.get("div[paginations]").should('be.visible').should('contain', '3');
        cy.verifyGraphExists("The default graph");
    });

    it('Test graphs overview pagination - switch pages', function () {
        cy.wait(500);
        cy.get("div[paginations] ul li a").eq(2).click().wait(500);
        cy.get("li").should('contain', "2").should('be', 'active')
        cy.verifyGraphExists("urn:11");
        cy.get("div[paginations] ul li a").eq(3).click().wait(500);
        cy.get("li").should('contain', "3").should('be', 'active')
        cy.verifyGraphExists("urn:21");
    });


    it('Test graphs overview pagination - test items per page', function () {
        cy.get('[class="btn btn-secondary btn-sm dropdown-toggle"]').click();
        cy.get('[class="dropdown-menu small"] li').eq(1).click();
        cy.verifyGraphExists("urn:19");
        cy.get('[class="btn btn-secondary btn-sm dropdown-toggle"]').click();
        cy.get('[class="dropdown-menu small"] li').eq(2).click();
        cy.verifyGraphExists("urn:1");
        cy.verifyGraphExists("urn:21");
    });

    it('Test graphs overview search', function () {
        cy.wait(1000);
        cy.get('.form-control').type(graphToSearch);
        cy.verifyGraphExists(graphToSearch);
        cy.get("tbody").should('not.contain', "urn:11");

    });

    it('Delete graph', function () {
        cy.wait(1000);
        cy.get('tbody tr a')
            .each(($el, index) => {
                if ($el.attr('title') === graphToDelete) {
                    cy.get('[class="fa fa-trash-o fa-lg"]').eq(index).click({force: true});
                    cy.get('.modal-content button.btn.btn-primary').click({force: true});
                }
            });
        cy.get("tbody").should('not.contain', graphToDelete);
    });

    it('Clear repository - should delete all graphs', function () {
        cy.get(".clearfix button.btn.btn-secondary").contains('Clear').click();
        cy.get(".modal-content button.btn.btn-primary").click();
        cy.get("tbody").should('not.contain', "urn");
        cy.verifyGraphExists("The default graph");

    });


});
