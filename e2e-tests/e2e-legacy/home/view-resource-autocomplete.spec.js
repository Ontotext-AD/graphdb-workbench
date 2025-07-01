import HomeSteps from '../../steps/home-steps';
import {BrowserStubs} from "../../stubs/browser-stubs";

describe('View resource autocomplete', () => {

    const FOAT_SNIPPET = '@base <http://example.org/> .\n' +
        '@prefix foaf: <http://xmlns.com/foaf/0.1/> .\n' +
        '<#green-goblin>\n' +
        'a foaf:Person ;    # in the context of the Marvel universe\n' +
        'foaf:name "Green Goblin" .\n';
    const GOBLIN_URI = 'http://example.org/#green-goblin';

    let repositoryId;

    beforeEach(() => {
        cy.viewport(1280, 1000);
        repositoryId = 'view-resource-autocomplete-' + Date.now();
        cy.createRepository({id: repositoryId});
        BrowserStubs.stubWindowOpen();
    });

    afterEach(() => {
        cy.deleteRepository(repositoryId);
    });

    it('Test homepage autocomplete when it is enabled', () => {
        HomeSteps.selectRepo(repositoryId);

        // Type an invalid resource
        HomeSteps.getAutocompleteInput().type('hfsafa');
        HomeSteps.noAutocompleteToast();

        cy.importRDFTextSnippet(repositoryId, FOAT_SNIPPET);
        cy.enableAutocomplete(repositoryId);

        HomeSteps.visitAndWaitLoader();
        BrowserStubs.stubWindowOpen();

        // When: The table display button is active
        HomeSteps.getAutocompleteDisplayTypeButton('table').click();
        // And: select an autocomplete suggestion
        HomeSteps.autocompleteText('Green', GOBLIN_URI)
        HomeSteps.autocompleteText('Green', GOBLIN_URI)
        HomeSteps.getAutocompleteResultElement(GOBLIN_URI).click()
        // Then: The clicked suggestion should be opened in new window
        cy.get(BrowserStubs.WINDOW_OPEN_ALIAS()).should('be.calledWith', 'resource?uri=http%3A%2F%2Fexample.org%2F%23green-goblin');

        // When: The visual display button is active
        HomeSteps.getAutocompleteDisplayTypeButton('visual').click();
        // And: select an autocomplete suggestion
        HomeSteps.getAutocompleteResultElement(GOBLIN_URI).click()
        // Then: clicked suggestion should be opened in new window
        cy.get(BrowserStubs.WINDOW_OPEN_ALIAS()).should('be.calledWith', 'graphs-visualizations?uri=http%3A%2F%2Fexample.org%2F%23green-goblin')
    });

    it('should not suggest resources in "View resources" when autocomplete is not enabled', () => {
        cy.importRDFTextSnippet(repositoryId, FOAT_SNIPPET);

        HomeSteps.visitAndWaitLoader();
        HomeSteps.selectRepo(repositoryId);

        HomeSteps.getAutocompleteInput().type('Green');
        HomeSteps.noAutocompleteToast();
    });
});
