describe('Home screen validation', function () {
    beforeEach(function () {
        cy.viewport(1280, 1000)
        cy.navigateToPageS('Home');
    });

    let firstPageText = '                            Welcome to GraphDB\n' +
        '                            GraphDB is a graph database compliant with RDF and SPARQL specifications. It supports open APIs based on RDF4J (ex-Sesame) project and enables fast publishing of linked data on the web. The Workbench is used for searching, exploring and managing GraphDB semantic repositories. This quick tutorial will guide you through the basics: (1) Create a repository(2) Load a sample dataset(3) Run a SPARQL queryYou can always come back to this tutorial by pressing the GraphDB icon in the top left corner.';

    let secondPageText = '                            Create a repository\n' +
        '                            Now let’s create your first repository. Go to Setup > Repositories and press Create new repository button. Fill the field Repository ID and press enter. The default repository parameters are optimized for datasets up to 100 million RDF statements. If you plan to load more check for more information: Configuring a repository';
    let thirdPageText = '                            Load a sample dataset\n' +
        '                            GraphDB includes a sample dataset in the distribution under the directory examples/data/news. The dataset represents new articles semantically enriched with structured information from Wikipedia. To load the data go to Import > RDF and select the local files.';
    let fourthPageText = '                            Run a SPARQL query\n' +
        '                            You can find a list of sample SPARQL queries under examples/data/news/queries.txt demonstrating how to find interesting searches of news articles and the mentioned entities like: (1) Give me articles about persons born in New York(2) Show me all occupations of every person in the news(3) List me the members of a specific political party';
    let fifthPageText = '                            REST API\n' +
        '                            GraphDB allows you to perform every operation also via a REST API or by using language specific RDF4J client application. To see the full list of supported functionality go to Help > REST API or check the sample code under examples/developer-getting-started/\n' +
        'Have fun!';

    let selectSPARQLQueryToExecute = function (query) {
        cy.get('.card > div > .list-group > li:contains("' + query + '")').should("be.visible");
        //todo: fix the force by hover action?
        cy.get('.card > div > .list-group > li:contains("' + query + '") span.help-label').click({force: true});
    };

    it('Verify that tutorial panel exists', function () {
        cy.get('.pages-wrapper')
            .should('be.visible');
    });

    it('Test first page tutorial message', function () {
        // Click first tutorial page button
        cy.get('.btn-toolbar > .btn-group >').eq(0).click();
        // Verify that the page is visible and contains distinct text
        cy.get('.pages-wrapper > div.page-slide.ng-scope').eq(0)
            .should('be.visible').and('contain', firstPageText);
    });

    it('Test second page tutorial message', function () {
        // Click second tutorial page button
        cy.get('.btn-toolbar > .btn-group >').eq(1).click();
        // Verify that the page is visible and contains distinct text
        cy.get('.pages-wrapper > div.page-slide.ng-scope').eq(1)
            .should('be.visible').and('contain', secondPageText);
    });

    it('Test third page tutorial message', function () {
        // Click third tutorial page button
        cy.get('.btn-toolbar > .btn-group >').eq(2).click();
        // Verify that the page is visible and contains distinct text
        cy.get('.pages-wrapper > div.page-slide.ng-scope').eq(2)
            .should('be.visible').and('contain', thirdPageText);
    });

    it('Test fourth page tutorial message', function () {
        // Click fourth tutorial page button
        cy.get('.btn-toolbar > .btn-group >').eq(3).click();
        // Verify that the page is visible and contains distinct text
        cy.get('.pages-wrapper > div.page-slide.ng-scope').eq(3)
            .should('be.visible').and('contain', fourthPageText);
    });

    it('Test fifth page tutorial message', function () {
        // Click fifth tutorial page button
        cy.get('.btn-toolbar > .btn-group >').eq(4).click();
        // Verify that the page is visible and contains distinct text
        cy.get('.pages-wrapper > div.page-slide.ng-scope').eq(4)
            .should('be.visible').and('contain', fifthPageText);
    });

    it('Verify that tutorial panel disappears if "No, thanks button" is clicked', function () {
        // Verify that tutorial panel is still visible
        cy.get('.pages-wrapper')
            .should('be.visible');
        // Click "No, thanks" button
        cy.get('.btn-outline-secondary').click();
        // Verify that tutorial panel disappeared
        cy.get('.pages-wrapper')
            .should('not.be.visible');
    });

    // it('Test set license via home page', function () {
    // 	// Setting couldn't be set in this environment because the GraphDB instance license is set on start
    // 	cy.get('.alert > .btn')
    // 		.then(($el => {
    // 			let href = $el.prop('href');
    // 			expect(href, Cypress.config("baseUrl") + '/license/register');
    // 		}));
    // });

    it('Test create new repository via home page', function () {
        let repoId = 'repoId' + Date.now();
        cy.get('.card > .pull-right > .btn').should("be.visible");
        cy.get(".ot-loader-new-content").should("not.be.visible");
        cy.get('.card > .pull-right > .btn')
            .click()
            .url()
            .should('eq', Cypress.config("baseUrl") + '/repository/create?previous=home');

        cy.get('#id')
            .type(repoId);

        cy.get('#addSaveRepository')
            .click()
            .url()
            .should('eq', Cypress.config("baseUrl") + '/');

        cy.get('.card > .list-group')
            .should('contain', repoId);

        cy.get('.card > .list-group')
            .contains(repoId)
            .click().wait(300);

        cy.get('.card > .list-group')
            .contains(repoId).and('be.hidden');

        cy.get('#btnReposGroup')
            .should('contain', repoId);

        cy.deleteRepoS(repoId);
    });

    it('Test saved SPARQL queries on home page and confirm dialog appearance', function () {
        let confirmationMessage = 'This is an update and it may change the data in the repository.';
        let repoId = 'repoId' + Date.now();
        cy.get('.card > .pull-right > .btn')
            .click()
            .url()
            .should('eq', Cypress.config("baseUrl") + '/repository/create?previous=home');

        cy.get('#id')
            .type(repoId);

        cy.get('#addSaveRepository')
            .click()
            .url()
            .should('eq', Cypress.config("baseUrl") + '/');

        cy.get('.card > .list-group')
            .contains(repoId)
            .click().wait(500);


        selectSPARQLQueryToExecute('Add statements');

        cy.get('.modal-body').should('be.visible');

        cy.get(".ot-loader-new-content").should("not.be.visible");
        cy.get('.modal-body').should('contain', confirmationMessage);
        cy.wait(1000);

        cy.get('.modal-footer > .btn-primary')
            .click();

        cy.verifyUpdateMessage('Added 2 statements.');

        cy.get('.big-logo').click();

        selectSPARQLQueryToExecute('Clear graph');

        cy.get('.modal-body').should('be.visible');
        cy.get(".ot-loader-new-content").should("not.be.visible");

        cy.get('.modal-body').should('contain', confirmationMessage);
        cy.wait(1000);

        cy.get('.modal-footer > .btn-primary')
            .click();

        cy.verifyUpdateMessage('Removed 2 statements.');

        cy.get('.big-logo').click();

        selectSPARQLQueryToExecute('Remove statements');

        cy.get('.modal-body').should('be.visible');
        cy.get(".ot-loader-new-content").should("not.be.visible");

        cy.get('.modal-body').should('contain', confirmationMessage);
        cy.wait(1000);

        cy.get('.modal-footer > .btn-primary')
            .click();

        cy.verifyUpdateMessage('The number of statements did not change.');

        cy.get('.big-logo').click();

        selectSPARQLQueryToExecute('SPARQL Select template');
        cy.get(".ot-loader-new-content").should("not.be.visible");

        cy.verifyQueryResultsS(74);

        cy.deleteRepoS(repoId);
    });

    it('Test repository info', function () {
        let repoId = 'repoId' + Date.now();
        cy.get('.card > .pull-right > .btn')
            .click();

        cy.get('#id')
            .type(repoId);

        cy.get('#addSaveRepository')
            .click();

        cy.get('.card > .list-group')
            .contains(repoId)
            .click().wait(300);

        cy.get('.card > .card-block > .card-title')
            .should('contain', repoId);

        cy.get('.card > .card-block').should('contain', repoId);
        cy.get('.card > .card-block').should('contain', 'total statements');
        cy.get('.card > .card-block').should('contain', 'explicit');
        cy.get('.card > .card-block').should('contain', 'inferred');
        cy.get('.card > .card-block').should('contain', 'expansion ratio');

        cy.deleteRepoS(repoId);
    });

    it('Test view resource', function () {
        let repoId = 'repoId' + Date.now();
        cy.get('.card > .pull-right > .btn')
            .click();

        cy.get('#id')
            .type(repoId);

        cy.get('#addSaveRepository')
            .click();

        cy.get('.card > .list-group')
            .contains(repoId)
            .click().wait(300);

        // Type an invalid resource
        cy.get('.card-block > search-resource-input > div.input-group.input-group-lg > input.form-control')
            .type('hfsafa');
        // Verify that the “Enable autocomplete” toast message is displayed.
        cy.get('#auto-complete-results-wrapper')
            .its('length')
            .should('be.gt', '0');
        // Click "Text" button
        cy.get('.input-group > :nth-child(2) > .btn').click();
        // Verify that an "Invalid URI" message is displayed
        cy.get('#toast-container').should("contain", 'Invalid URI');

        // Enable autocomplete
        cy.navigateToPageS('Setup', 'Autocomplete');
        cy.get('label[for="toggleIndex"]').click();
        //Wait for autocomplete to build
        cy.get('#toggleIndex .tag-success', {timeout: 20000}).should("be.visible");


        // Import wine ontology (https://www.w3.org/TR/owl-guide/wine.rdf)
        cy.navigateToPageS('Import', 'RDF');
        cy.openImportURLDialog('https://www.w3.org/TR/owl-guide/wine.rdf');
        cy.clickImportUrlBtn();
        cy.clickImportBtnOnPopUpMenu();

        // Navigate to home page
        cy.get('.big-logo').click();
        // Search for “USRegion” and press on “Text”
        cy.get('.card-block > search-resource-input > div.input-group.input-group-lg > input.form-control')
            .should("be.visible");
        cy.get('.card-block > search-resource-input > div.input-group.input-group-lg > input.form-control')
            .type('USRegion');

        //wait for autocomplete
        cy.get("#auto-complete-results-wrapper").should("be.visible");
        cy.get("#auto-complete-results-wrapper .ng-scope.active").should("be.visible");
        cy.get(".icon-reload.loader").should("not.be.visible");
        cy.wait(500);

        // Click "Text" button
        cy.get("#auto-complete-results-wrapper .ng-scope.active").click();
        // Verify that the resource is opened
        cy.get('.resource-info').should('be.visible').and("contain", "USRegion");

        // Navigate to home page
        cy.get('.big-logo').click();
        // Search for “USRegion” and press on “Visual”
        cy.get('.card-block > search-resource-input > div.input-group.input-group-lg > input.form-control')
            .type('USRegion');
        // Click "Visual" button
        cy.get('.input-group > :nth-child(3) > .btn').click();
        // Verify that the Visual graph is loaded with the expanded “USRegion” node
        cy.url()
            .should('contain', '/graphs-visualizations?uri=http:%2F%2Fwww.w3.org%2FTR%2F2003%2FPR-owl-guide-20031209%2Fwine%23USRegion');

        cy.deleteRepoS(repoId);
    });
});
