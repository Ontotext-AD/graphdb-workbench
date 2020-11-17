import HomeSteps from '../../steps/home-steps';

describe('Home screen validation', () => {

    const FOAT_SNIPPET = '@base <http://example.org/> .\n' +
        '@prefix foaf: <http://xmlns.com/foaf/0.1/> .\n' +
        '<#green-goblin>\n' +
        'a foaf:Person ;    # in the context of the Marvel universe\n' +
        'foaf:name "Green Goblin" .\n';
    const GOBLIN_URI = 'http://example.org/#green-goblin';

    beforeEach(() => cy.viewport(1280, 1000));

    context('First visit', () => {
        beforeEach(() => HomeSteps.visitAndWaitLoader());

        it('Verify that tutorial panel exists', () => {
            HomeSteps.verifyTutorialVisible(true);
        });

        it('Test tutorial text', () => {
            HomeSteps.verifyTutorialText(0, 'Welcome to GraphDB');
            HomeSteps.verifyTutorialText(1, 'Create a repository');
            HomeSteps.verifyTutorialText(2, 'Load a sample dataset');
            HomeSteps.verifyTutorialText(3, 'Run a SPARQL query');
            HomeSteps.verifyTutorialText(4, 'REST API');
        });

        it('Verify that tutorial panel disappears if "No, thanks button" is clicked', () => {
            // Verify that tutorial panel is still visible
            HomeSteps.verifyTutorialVisible(true);
            HomeSteps.declineTutorial();
            HomeSteps.verifyTutorialVisible(false);
        });
    });

    context('Creating repository', () => {
        beforeEach(() => HomeSteps.visitAndWaitLoader());

        it('Test create and select new repository via home page', () => {
            HomeSteps.verifyCreateRepositoryLink();

            let repositoryId = HomeSteps.createRepo();
            // Initializing the repository to speed up retrieving repository info
            cy.initializeRepository(repositoryId);

            HomeSteps.selectRepo(repositoryId);
            HomeSteps.verifyRepositoryIsSelected(repositoryId);
            HomeSteps.hasRepositoryInfo(repositoryId);

            cy.deleteRepository(repositoryId);
        });

        it('Test saved SPARQL queries links on home page and confirm dialog appearance', () => {
            let repositoryId = HomeSteps.createRepo();
            HomeSteps.selectRepo(repositoryId);

            HomeSteps.verifyQueryLink('Add statements', true, '/sparql?savedQueryName=Add%20statements&owner=admin&execute');
            HomeSteps.verifyQueryLink('Clear graph', true, '/sparql?savedQueryName=Clear%20graph&owner=admin&execute');
            HomeSteps.verifyQueryLink('Remove statements', true, '/sparql?savedQueryName=Remove%20statements&owner=admin&execute');
            HomeSteps.verifyQueryLink('SPARQL Select template', false, '/sparql?savedQueryName=SPARQL%20Select%20template&owner=admin&execute');

            cy.deleteRepository(repositoryId);
        });
    });

    context('"View resource" autocomplete', () => {
        it('Test homepage autocomplete when it is enabled', () => {
            let repositoryId = HomeSteps.createRepo();
            HomeSteps.selectRepo(repositoryId);

            // Type an invalid resource
            HomeSteps.getAutocompleteInput().type('hfsafa');
            HomeSteps.noAutocompleteToast();

            cy.importRDFTextSnippet(repositoryId, FOAT_SNIPPET);
            cy.enableAutocomplete(repositoryId);

            HomeSteps.visitAndWaitLoader().then((el) => el)
                .then(() => HomeSteps.autocompleteText('Green', GOBLIN_URI))
                .then(() => HomeSteps.getAutocompleteResultElement(GOBLIN_URI).click());

            HomeSteps.verifyAutocompleteResourceLink(GOBLIN_URI);

            HomeSteps.goBackAndWaitAutocomplete(function () {
                HomeSteps.autocompleteText('Green', GOBLIN_URI);
                HomeSteps.getAutocompleteButton('text').click();
                HomeSteps.verifyAutocompleteResourceLink(GOBLIN_URI);
            });

            HomeSteps.goBackAndWaitAutocomplete(function () {
                HomeSteps.autocompleteText('Green', GOBLIN_URI);
                HomeSteps.getAutocompleteButton('visual').click();
                cy.url()
                    .should('contain', '/graphs-visualizations?uri=http:%2F%2Fexample.org%2F%23green-goblin');
            });

            cy.deleteRepository(repositoryId);
        });

        it('should not suggest resources in "View resources" when autocomplete is not enabled', () => {
            let repositoryId = HomeSteps.createRepo();
            cy.importRDFTextSnippet(repositoryId, FOAT_SNIPPET);

            HomeSteps.visitAndWaitLoader();
            HomeSteps.selectRepo(repositoryId);

            HomeSteps.getAutocompleteInput().type('Green');
            HomeSteps.noAutocompleteToast();
        });
    });

});
