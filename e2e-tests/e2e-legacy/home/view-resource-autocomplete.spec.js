import HomeSteps from '../../steps/home-steps';

// TODO: Fix me. Broken due to migration (Error unknown)
describe.skip('View resource autocomplete', () => {

    const FOAT_SNIPPET = '@base <http://example.org/> .\n' +
        '@prefix foaf: <http://xmlns.com/foaf/0.1/> .\n' +
        '<#green-goblin>\n' +
        'a foaf:Person ;    # in the context of the Marvel universe\n' +
        'foaf:name "Green Goblin" .\n';
    const GOBLIN_URI = 'http://example.org/#green-goblin';

    beforeEach(() => {
        cy.viewport(1280, 1000);
    });

    /**
     * TODO: Fix me. Broken due to migration (The issue GDB-10501 not implemented)
     */
    it.skip('Test homepage autocomplete when it is enabled', () => {
        const repositoryId = HomeSteps.createRepo();
        HomeSteps.selectRepo(repositoryId);

        // Type an invalid resource
        HomeSteps.getAutocompleteInput().type('hfsafa');
        HomeSteps.noAutocompleteToast();

        cy.importRDFTextSnippet(repositoryId, FOAT_SNIPPET);
        cy.enableAutocomplete(repositoryId);

        HomeSteps.visitAndWaitLoader(true).then((el) => el)
            .then(() => HomeSteps.getAutocompleteDisplayTypeButton('table').click())
            .then(() => HomeSteps.autocompleteText('Green', GOBLIN_URI))
            .then(() => HomeSteps.getAutocompleteResultElement(GOBLIN_URI).click())
            .then(() => // Search result should be opened in new window
                cy.get('@window.open').should('be.calledWith', 'resource?uri=http%3A%2F%2Fexample.org%2F%23green-goblin'))
            .then(() => HomeSteps.getAutocompleteDisplayTypeButton('visual').click())
            .then(() => HomeSteps.getAutocompleteResultElement(GOBLIN_URI).click())
            .then(() => // Search result should be opened in new window
                cy.get('@window.open').should('be.calledWith', 'graphs-visualizations?uri=http%3A%2F%2Fexample.org%2F%23green-goblin'));
        cy.deleteRepository(repositoryId);
    });

    it('should not suggest resources in "View resources" when autocomplete is not enabled', () => {
        const repositoryId = HomeSteps.createRepo();
        cy.importRDFTextSnippet(repositoryId, FOAT_SNIPPET);

        HomeSteps.visitAndWaitLoader();
        HomeSteps.selectRepo(repositoryId);

        HomeSteps.getAutocompleteInput().type('Green');
        HomeSteps.noAutocompleteToast();

        cy.deleteRepository(repositoryId);
    });
});
