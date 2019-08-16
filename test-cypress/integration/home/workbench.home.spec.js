import HomeSteps from '../../steps/home-steps';
import ImportSteps from '../../steps/import-steps';


describe('Home screen validation', function () {

    const FOAT_SNIPPET = '@base <http://example.org/> .\n' +
                       '@prefix foaf: <http://xmlns.com/foaf/0.1/> .\n' +
                       '<#green-goblin>\n' +
                           'a foaf:Person ;    # in the context of the Marvel universe\n' +
                           'foaf:name "Green Goblin" .\n'
    const GOBLIN_URI = 'http://example.org/#green-goblin'


    beforeEach(function () {
        cy.viewport(1280, 1000)
        cy.visitAndWaitLoader('/');
    });

    it('Verify that tutorial panel exists', function () {
        HomeSteps.verifyTutorialVisible(true);
    });

    it('Test tutorial text', function () {
        HomeSteps.verifyTutorialText(0, 'Welcome to GraphDB');
        HomeSteps.verifyTutorialText(1, 'Create a repository');
        HomeSteps.verifyTutorialText(2, 'Load a sample dataset');
        HomeSteps.verifyTutorialText(3, 'Run a SPARQL query');
        HomeSteps.verifyTutorialText(4, 'REST API');
    });


    it('Verify that tutorial panel disappears if "No, thanks button" is clicked', function () {
        // Verify that tutorial panel is still visible
        HomeSteps.verifyTutorialVisible(true);
        HomeSteps.declineTutorial();
        HomeSteps.verifyTutorialVisible(false);
    });

    it('Test create and select new repository via home page', function () {

        HomeSteps.verifyCreateRepositoryLink();

        let repositoryId = HomeSteps.createRepo();
        HomeSteps.selectRepo(repositoryId);
        HomeSteps.verifyRepositoryIsSelected(repositoryId);
        HomeSteps.hasRepositoryInfo(repositoryId);

        cy.deleteRepository(repositoryId);
    });

    it('Test saved SPARQL queries links on home page and confirm dialog appearance', function () {
        let repositoryId = HomeSteps.createRepo();
        HomeSteps.selectRepo(repositoryId);

        HomeSteps.verifyQueryLink('Add statements', true, '/sparql?savedQueryName=Add%20statements&execute');
        HomeSteps.verifyQueryLink('Clear graph', true, '/sparql?savedQueryName=Clear%20graph&execute');
        HomeSteps.verifyQueryLink('Remove statements', true, '/sparql?savedQueryName=Remove%20statements&execute');
        HomeSteps.verifyQueryLink('SPARQL Select template', false, '/sparql?savedQueryName=SPARQL%20Select%20template&execute');

        cy.deleteRepository(repositoryId);
    });

    it('Test homepage autocomplete', function () {
        let repositoryId = HomeSteps.createRepo();
        HomeSteps.selectRepo(repositoryId);

        // Type an invalid resource
        HomeSteps.getAutocompleteInput().type('hfsafa');
        HomeSteps.noAutocompleteToast();

        cy.importRDFTextSnippet(repositoryId, FOAT_SNIPPET);
        cy.enableAutocomplete(repositoryId);

        cy.visitAndWaitLoader('/');
        HomeSteps.autocompleteText('Green', GOBLIN_URI);
        HomeSteps.getAutocompleteResultElement(GOBLIN_URI).click();
        HomeSteps.verifyAutocompleteResourceLink(GOBLIN_URI);

        HomeSteps.goBackAndWaitAutocomplete(function() {
            HomeSteps.autocompleteText('Green', GOBLIN_URI);
            HomeSteps.getAutocompleteButton('text').click();
            HomeSteps.verifyAutocompleteResourceLink(GOBLIN_URI);
        });

        HomeSteps.goBackAndWaitAutocomplete(function() {
            HomeSteps.autocompleteText('Green', GOBLIN_URI);
            HomeSteps.getAutocompleteButton('visual').click();
            cy.url()
                .should('contain', '/graphs-visualizations?uri=http:%2F%2Fexample.org%2F%23green-goblin');
        });


        cy.deleteRepository(repositoryId);

    });
});
