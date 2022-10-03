import GuideSteps from "../../steps/guide-steps";

const MOVIES_FILE_FOR_IMPORT = 'movies.ttl';
const MOVIES_REPOSITORY_ID = 'movies';
describe.skip('Interactive guides', () => {

    beforeEach(() => {
        cy.intercept('/rest/guides', {fixture: '/guides/guides.json'}).as('getGuides');
        cy.deleteRepository(MOVIES_REPOSITORY_ID);
    });

    afterEach(() => {
        cy.deleteRepository(MOVIES_REPOSITORY_ID);
    });

    context('Describes "Movies" interactive guide', () => {
        it('Tests movies interactive guide using "Next" button to the end and "Previous" button to the beginning', () => {
            cy.deleteRepository(MOVIES_REPOSITORY_ID);
            cy.visit('');
            // Start the guide.
            GuideSteps.visitGuidesPage();
            cy.wait(['@getGuides']);

            GuideSteps.runGuide('3 The Movies database guide');
            GuideSteps.verifyPageNotInteractive();

            // Step Welcome to Star Wars guide
            cy.get('footer button:visible').contains('Next').click();
            GuideSteps.waitDialogWithTitleBeVisible('Welcome to 3 The Movies database guide — 2/2', 1);
            GuideSteps.verifyPageNotInteractive();

            GuideSteps.clickOnNextButton(1);
            GuideSteps.verifyPageNotInteractive();
            createRepositoryByNextButton(MOVIES_REPOSITORY_ID);

            // Step select "Choose repository" button.
            selectRepositoryByNextButton(MOVIES_REPOSITORY_ID);

            // Step described autocomplete.
            GuideSteps.clickOnNextButton(10);
            GuideSteps.verifyPageNotInteractive();
            enableAutocompleteByNextButton();

            // Step import file intro
            GuideSteps.clickOnNextButton(15);
            GuideSteps.verifyPageNotInteractive();
            importFileByNextButton(MOVIES_FILE_FOR_IMPORT);

            GuideSteps.clickOnNextButton(22);
            GuideSteps.verifyPageNotInteractive();
            GuideSteps.waitDialogWithTitleBeVisible('Explore the class hierarchy — 1/7', 23);

            GuideSteps.clickOnNextButton(23);
            GuideSteps.verifyPageNotInteractive();
            GuideSteps.waitDialogWithTitleBeVisible('Explore the class hierarchy — 2/7', 24);
            GuideSteps.verifyIsElementInteractable('[guide-selector="menu-explore"]');

            GuideSteps.clickOnNextButton(24);
            GuideSteps.verifyPageNotInteractive();
            GuideSteps.waitDialogWithTitleBeVisible('Explore the class hierarchy — 3/7', 25);
            GuideSteps.verifyIsElementInteractable('[guide-selector="menu-class-hierarchy"]');

            GuideSteps.clickOnNextButton(25);
            GuideSteps.verifyPageNotInteractive();
            GuideSteps.waitDialogWithTitleBeVisible('Explore the class hierarchy — 4/7', 26);

            GuideSteps.clickOnNextButton(26);
            GuideSteps.verifyPageNotInteractive();
            GuideSteps.waitDialogWithTitleBeVisible('Explore the class hierarchy — 5/7', 27);
            GuideSteps.verifyIsElementInteractable('#classChart #main-group');

            GuideSteps.clickOnNextButton(27);
            GuideSteps.verifyPageNotInteractive();
            GuideSteps.waitDialogWithTitleBeVisible('Explore the class hierarchy — 6/7', 28);
            GuideSteps.verifyIsElementInteractable('[guide-selector="class-schema:Movie"]');

            GuideSteps.clickOnNextButton(28);
            GuideSteps.verifyPageNotInteractive();
            GuideSteps.waitDialogWithTitleBeVisible('Explore the class hierarchy — 7/7', 29);
            GuideSteps.verifyIsElementInteractable('[guide-selector="class-schema:Movie"]');

            GuideSteps.clickOnNextButton(29);
            GuideSteps.verifyPageNotInteractive();
            GuideSteps.waitDialogWithTitleBeVisible('Class hierarchy instances — 1/8', 30);
            GuideSteps.verifyIsElementInteractable('[guide-selector="class-imdb:ColorMovie"]');

            GuideSteps.clickOnNextButton(30);
            GuideSteps.verifyPageNotInteractive();
            GuideSteps.waitDialogWithTitleBeVisible('Class hierarchy instances — 2/8', 31);

            GuideSteps.clickOnNextButton(31);
            GuideSteps.verifyPageNotInteractive();
            GuideSteps.waitDialogWithTitleBeVisible('Class hierarchy instances — 3/8', 32);
            GuideSteps.verifyIsElementInteractable('[guide-selector="instance-imdb:title/Superman"]');

            GuideSteps.clickOnNextButton(32);
            GuideSteps.verifyPageNotInteractive();
            GuideSteps.waitDialogWithTitleBeVisible('Class hierarchy instances — 4/8', 33);
            GuideSteps.verifyIsElementInteractable('[guide-selector="instance-imdb:title/Mulan"]');

            GuideSteps.clickOnNextButton(33);
            GuideSteps.verifyPageNotInteractive();
            GuideSteps.waitDialogWithTitleBeVisible('Class hierarchy instances — 5/8', 34);
            GuideSteps.verifyIsElementInteractable('[guide-selector="instances-count"]');

            GuideSteps.clickOnNextButton(34);
            GuideSteps.verifyPageNotInteractive();
            GuideSteps.waitDialogWithTitleBeVisible('Class hierarchy instances — 6/8', 35);

            GuideSteps.clickOnNextButton(35);
            GuideSteps.verifyPageNotInteractive();
            GuideSteps.waitDialogWithTitleBeVisible('Class hierarchy instances — 7/8', 36);
            GuideSteps.verifyIsElementInteractable('[guide-selector="yasrResults"]');

            GuideSteps.clickOnNextButton(36);
            GuideSteps.verifyPageNotInteractive();
            GuideSteps.waitDialogWithTitleBeVisible('Class hierarchy instances — 8/8', 37);
            GuideSteps.verifyIsElementInteractable('[guide-selector="close-info-panel"]');

            GuideSteps.clickOnNextButton(37);
            GuideSteps.verifyPageNotInteractive();
            GuideSteps.waitDialogWithTitleBeVisible('Execute SPARQL query — 1/8', 38);

            GuideSteps.clickOnNextButton(38);
            GuideSteps.verifyPageNotInteractive();
            GuideSteps.waitDialogWithTitleBeVisible('Execute SPARQL query — 2/8', 39);
            GuideSteps.verifyIsElementInteractable('[guide-selector="menu-sparql"]');

            GuideSteps.clickOnNextButton(39);
            GuideSteps.verifyPageNotInteractive();
            GuideSteps.waitDialogWithTitleBeVisible('Execute SPARQL query — 3/8', 40);

            GuideSteps.clickOnNextButton(40);
            GuideSteps.verifyPageNotInteractive();
            GuideSteps.waitDialogWithTitleBeVisible('Execute SPARQL query — 4/8', 41);
            GuideSteps.verifyIsElementInteractable('[guide-selector="runSparqlQuery"]');

            GuideSteps.clickOnNextButton(41);
            GuideSteps.verifyPageNotInteractive();
            GuideSteps.waitDialogWithTitleBeVisible('Execute SPARQL query — 5/8', 42);
            GuideSteps.verifyIsElementInteractable('[guide-selector="yasrResults"]');

            GuideSteps.clickOnNextButton(42);
            GuideSteps.verifyPageNotInteractive();
            GuideSteps.waitDialogWithTitleBeVisible('Execute SPARQL query — 6/8', 43);

            GuideSteps.clickOnNextButton(43);
            GuideSteps.verifyPageNotInteractive();
            GuideSteps.waitDialogWithTitleBeVisible('Execute SPARQL query — 7/8', 44);
            GuideSteps.verifyIsElementInteractable('[guide-selector="runSparqlQuery"]');

            GuideSteps.clickOnNextButton(44);
            GuideSteps.verifyPageNotInteractive();
            GuideSteps.waitDialogWithTitleBeVisible('Execute SPARQL query — 8/8', 45);
            GuideSteps.verifyIsElementInteractable('[guide-selector="yasrResults"]');

            GuideSteps.clickOnNextButton(45);
            cy.scrollTo('bottom');
            GuideSteps.verifyPageNotInteractive();
            GuideSteps.waitDialogWithTitleBeVisible('Explore RDF as a table — 1/10', 46);
            GuideSteps.verifyIsElementInteractable('a[title="http://academy.ontotext.com/imdb/title/DjangoUnchained"]');

            GuideSteps.clickOnNextButton(46);
            GuideSteps.verifyPageNotInteractive();
            GuideSteps.waitDialogWithTitleBeVisible('Explore RDF as a table — 2/10', 47);
            GuideSteps.verifyIsElementInteractable('[guide-selector="yasrResults"] tbody');

            GuideSteps.clickOnNextButton(47);
            GuideSteps.verifyPageNotInteractive();
            GuideSteps.waitDialogWithTitleBeVisible('Explore RDF as a table — 3/10', 48);
            GuideSteps.verifyIsElementInteractable('a[title="http://academy.ontotext.com/imdb/person/QuentinTarantino"]');

            GuideSteps.clickOnNextButton(48);
            GuideSteps.verifyPageNotInteractive();
            GuideSteps.waitDialogWithTitleBeVisible('Explore RDF as a table — 4/10', 49);
            GuideSteps.verifyIsElementInteractable('[guide-selector="yasrResults"] tbody');

            GuideSteps.clickOnNextButton(49);
            GuideSteps.verifyPageNotInteractive();
            GuideSteps.waitDialogWithTitleBeVisible('Explore RDF as a table — 5/10', 50);
            GuideSteps.verifyIsElementInteractable('[guide-selector="role-all"]');

            GuideSteps.clickOnNextButton(50);
            GuideSteps.verifyPageNotInteractive();
            GuideSteps.waitDialogWithTitleBeVisible('Explore RDF as a table — 6/10', 51);
            GuideSteps.verifyIsElementInteractable('[guide-selector="yasrResults"] tbody');

            GuideSteps.clickOnNextButton(51);
            GuideSteps.verifyPageNotInteractive();
            GuideSteps.waitDialogWithTitleBeVisible('Explore RDF as a table — 7/10', 52);
            GuideSteps.verifyIsElementInteractable('[guide-selector="explore-visual"]');

            GuideSteps.clickOnNextButton(52);
            GuideSteps.verifyPageNotInteractive();
            GuideSteps.waitDialogWithTitleBeVisible('Explore RDF as a table — 8/10', 53);

            GuideSteps.clickOnNextButton(53);
            GuideSteps.verifyPageNotInteractive();
            GuideSteps.waitDialogWithTitleBeVisible('Explore RDF as a table — 9/10', 54);

            GuideSteps.clickOnNextButton(55);
            GuideSteps.verifyPageNotInteractive();
            GuideSteps.waitDialogWithTitleBeVisible('Explore RDF as a table — 10/10', 55);

            GuideSteps.clickOnNextButton(55);
            GuideSteps.verifyPageNotInteractive();
            GuideSteps.waitDialogWithTitleBeVisible('Execute SPARQL query — 1/7', 56);
            GuideSteps.verifyIsElementInteractable('[guide-selector="menu-sparql"]');

            GuideSteps.clickOnNextButton(56);
            GuideSteps.verifyPageNotInteractive();
            GuideSteps.waitDialogWithTitleBeVisible('Execute SPARQL query — 2/7', 57);

            GuideSteps.clickOnNextButton(58);
            GuideSteps.verifyPageNotInteractive();
            GuideSteps.waitDialogWithTitleBeVisible('Execute SPARQL query — 3/7', 59);
            GuideSteps.verifyIsElementInteractable('[guide-selector="runSparqlQuery"]');

            GuideSteps.clickOnNextButton(59);
            GuideSteps.verifyPageNotInteractive();
            GuideSteps.waitDialogWithTitleBeVisible('Execute SPARQL query — 4/7', 60);
            GuideSteps.verifyIsElementInteractable('[guide-selector="yasrResults"] tbody');

            GuideSteps.clickOnNextButton(60);
            GuideSteps.verifyPageNotInteractive();
            GuideSteps.waitDialogWithTitleBeVisible('Execute SPARQL query — 5/7', 61);

            GuideSteps.clickOnNextButton(61);
            GuideSteps.verifyPageNotInteractive();
            GuideSteps.waitDialogWithTitleBeVisible('Execute SPARQL query — 6/7', 62);
            GuideSteps.verifyIsElementInteractable('[guide-selector="runSparqlQuery"]');

            GuideSteps.clickOnNextButton(62);
            GuideSteps.verifyPageNotInteractive();
            GuideSteps.waitDialogWithTitleBeVisible('Execute SPARQL query — 7/7', 63);
            GuideSteps.verifyIsElementInteractable('[guide-selector="yasrResults"] tbody');

            GuideSteps.waitDialogWithTitleBeVisible('End of guide', 63);

            // We are reached the end of the guide, now we will go to the start.
            executePreviousFlowOfMovieGuide(MOVIES_REPOSITORY_ID);
            GuideSteps.cancelGuide();
            cy.deleteRepository(MOVIES_REPOSITORY_ID);
        });

        function executePreviousFlowOfMovieGuide(repositoryId) {
            GuideSteps.clickOnNextButton(63);
            GuideSteps.verifyPageNotInteractive();
            GuideSteps.waitDialogWithTitleBeVisible('Execute SPARQL query — 7/7', 62);
            GuideSteps.verifyIsElementInteractable('[guide-selector="yasrResults"] tbody');

            GuideSteps.clickOnPreviousButton(62);
            GuideSteps.verifyPageNotInteractive();
            GuideSteps.waitDialogWithTitleBeVisible('Execute SPARQL query — 6/7', 61);
            GuideSteps.verifyIsElementInteractable('[guide-selector="runSparqlQuery"]');

            GuideSteps.clickOnPreviousButton(61);
            GuideSteps.verifyPageNotInteractive();
            GuideSteps.waitDialogWithTitleBeVisible('Execute SPARQL query — 5/7', 60);

            GuideSteps.clickOnPreviousButton(60);
            GuideSteps.verifyPageNotInteractive();
            GuideSteps.waitDialogWithTitleBeVisible('Execute SPARQL query — 4/7', 59);
            GuideSteps.verifyIsElementInteractable('[guide-selector="yasrResults"] tbody');

            GuideSteps.clickOnPreviousButton(59);
            GuideSteps.verifyPageNotInteractive();
            GuideSteps.waitDialogWithTitleBeVisible('Execute SPARQL query — 3/7', 58);
            GuideSteps.verifyIsElementInteractable('[guide-selector="runSparqlQuery"]');

            GuideSteps.clickOnPreviousButton(58);
            GuideSteps.verifyPageNotInteractive();
            GuideSteps.waitDialogWithTitleBeVisible('Execute SPARQL query — 2/7', 57);

            GuideSteps.clickOnPreviousButton(57);
            GuideSteps.verifyPageNotInteractive();
            GuideSteps.waitDialogWithTitleBeVisible('Execute SPARQL query — 1/7', 56);
            GuideSteps.verifyIsElementInteractable('[guide-selector="menu-sparql"]');

            GuideSteps.clickOnPreviousButton(56);
            GuideSteps.verifyPageNotInteractive();
            GuideSteps.waitDialogWithTitleBeVisible('Explore RDF as a table — 10/10', 55);

            GuideSteps.clickOnPreviousButton(55);
            GuideSteps.verifyPageNotInteractive();
            GuideSteps.waitDialogWithTitleBeVisible('Explore RDF as a table — 9/10', 54);

            GuideSteps.clickOnPreviousButton(54);
            GuideSteps.verifyPageNotInteractive();
            GuideSteps.waitDialogWithTitleBeVisible('Explore RDF as a table — 8/10', 53);

            GuideSteps.clickOnPreviousButton(53);
            GuideSteps.verifyPageNotInteractive();
            GuideSteps.waitDialogWithTitleBeVisible('Explore RDF as a table — 7/10', 52);
            GuideSteps.verifyIsElementInteractable('[guide-selector="explore-visual"]');

            GuideSteps.clickOnPreviousButton(52);
            GuideSteps.verifyPageNotInteractive();
            GuideSteps.waitDialogWithTitleBeVisible('Explore RDF as a table — 6/10', 51);
            GuideSteps.verifyIsElementInteractable('[guide-selector="yasrResults"] tbody');

            GuideSteps.clickOnPreviousButton(50);
            GuideSteps.verifyPageNotInteractive();
            GuideSteps.waitDialogWithTitleBeVisible('Explore RDF as a table — 5/10', 50);
            GuideSteps.verifyIsElementInteractable('[guide-selector="role-all"]');

            GuideSteps.clickOnPreviousButton(50);
            GuideSteps.verifyPageNotInteractive();
            GuideSteps.waitDialogWithTitleBeVisible('Explore RDF as a table — 4/10', 49);
            GuideSteps.verifyIsElementInteractable('[guide-selector="yasrResults"] tbody');

            GuideSteps.clickOnPreviousButton(49);
            GuideSteps.verifyPageNotInteractive();
            GuideSteps.waitDialogWithTitleBeVisible('Explore RDF as a table — 3/10', 48);
            GuideSteps.verifyIsElementInteractable('a[title="http://academy.ontotext.com/imdb/person/QuentinTarantino"]');

            GuideSteps.clickOnPreviousButton(48);
            GuideSteps.verifyPageNotInteractive();
            GuideSteps.waitDialogWithTitleBeVisible('Explore RDF as a table — 2/10', 47);
            GuideSteps.verifyIsElementInteractable('[guide-selector="yasrResults"] tbody');

            GuideSteps.clickOnPreviousButton(47);
            GuideSteps.verifyPageNotInteractive();
            GuideSteps.waitDialogWithTitleBeVisible('Explore RDF as a table — 1/10', 46);
            GuideSteps.verifyIsElementInteractable('a[title="http://academy.ontotext.com/imdb/title/DjangoUnchained"]');

            GuideSteps.clickOnPreviousButton(46);
            GuideSteps.verifyPageNotInteractive();
            GuideSteps.waitDialogWithTitleBeVisible('Execute SPARQL query — 8/8', 45);
            GuideSteps.verifyIsElementInteractable('[guide-selector="yasrResults"]');

            GuideSteps.clickOnPreviousButton(45);
            GuideSteps.verifyPageNotInteractive();
            GuideSteps.waitDialogWithTitleBeVisible('Execute SPARQL query — 7/8', 44);
            GuideSteps.verifyIsElementInteractable('[guide-selector="runSparqlQuery"]');

            GuideSteps.clickOnPreviousButton(44);
            GuideSteps.verifyPageNotInteractive();
            GuideSteps.waitDialogWithTitleBeVisible('Execute SPARQL query — 6/8', 43);

            GuideSteps.clickOnPreviousButton(43);
            GuideSteps.verifyPageNotInteractive();
            GuideSteps.waitDialogWithTitleBeVisible('Execute SPARQL query — 5/8', 42);
            GuideSteps.verifyIsElementInteractable('[guide-selector="yasrResults"]');

            GuideSteps.clickOnPreviousButton(42);
            GuideSteps.verifyPageNotInteractive();
            GuideSteps.waitDialogWithTitleBeVisible('Execute SPARQL query — 4/8', 41);
            GuideSteps.verifyIsElementInteractable('[guide-selector="runSparqlQuery"]');

            GuideSteps.clickOnPreviousButton(41);
            GuideSteps.verifyPageNotInteractive();
            GuideSteps.waitDialogWithTitleBeVisible('Execute SPARQL query — 3/8', 40);

            GuideSteps.clickOnPreviousButton(40);
            GuideSteps.verifyPageNotInteractive();
            GuideSteps.waitDialogWithTitleBeVisible('Execute SPARQL query — 2/8', 39);
            GuideSteps.verifyIsElementInteractable('[guide-selector="menu-sparql"]');

            GuideSteps.clickOnPreviousButton(39);
            GuideSteps.verifyPageNotInteractive();
            GuideSteps.waitDialogWithTitleBeVisible('Execute SPARQL query — 1/8', 38);

            GuideSteps.clickOnPreviousButton(38);
            GuideSteps.verifyPageNotInteractive();
            GuideSteps.waitDialogWithTitleBeVisible('Class hierarchy instances — 8/8', 37);
            GuideSteps.verifyIsElementInteractable('[guide-selector="close-info-panel"]');

            GuideSteps.clickOnPreviousButton(37);
            GuideSteps.verifyPageNotInteractive();
            GuideSteps.waitDialogWithTitleBeVisible('Class hierarchy instances — 7/8', 36);
            GuideSteps.verifyIsElementInteractable('[guide-selector="yasrResults"]');

            GuideSteps.clickOnPreviousButton(36);
            GuideSteps.verifyPageNotInteractive();
            GuideSteps.waitDialogWithTitleBeVisible('Class hierarchy instances — 6/8', 35);

            GuideSteps.clickOnPreviousButton(35);
            GuideSteps.verifyPageNotInteractive();
            GuideSteps.waitDialogWithTitleBeVisible('Class hierarchy instances — 5/8', 34);
            GuideSteps.verifyIsElementInteractable('[guide-selector="instances-count"]');

            GuideSteps.clickOnPreviousButton(34);
            GuideSteps.verifyPageNotInteractive();
            GuideSteps.waitDialogWithTitleBeVisible('Class hierarchy instances — 4/8', 33);
            GuideSteps.verifyIsElementInteractable('[guide-selector="instance-imdb:title/Mulan"]');

            GuideSteps.clickOnPreviousButton(33);
            GuideSteps.verifyPageNotInteractive();
            GuideSteps.waitDialogWithTitleBeVisible('Class hierarchy instances — 3/8', 32);
            GuideSteps.verifyIsElementInteractable('[guide-selector="instance-imdb:title/Superman"]');

            GuideSteps.clickOnPreviousButton(32);
            GuideSteps.verifyPageNotInteractive();
            GuideSteps.waitDialogWithTitleBeVisible('Class hierarchy instances — 2/8', 31);

            GuideSteps.clickOnPreviousButton(31);
            GuideSteps.verifyPageNotInteractive();
            GuideSteps.waitDialogWithTitleBeVisible('Class hierarchy instances — 1/8', 30);
            GuideSteps.verifyIsElementInteractable('[guide-selector="class-imdb:ColorMovie"]');

            GuideSteps.clickOnPreviousButton(30);
            GuideSteps.verifyPageNotInteractive();
            GuideSteps.waitDialogWithTitleBeVisible('Explore the class hierarchy — 7/7', 29);
            GuideSteps.verifyIsElementInteractable('[guide-selector="class-schema:Movie"]');

            GuideSteps.clickOnPreviousButton(29);
            GuideSteps.verifyPageNotInteractive();
            GuideSteps.waitDialogWithTitleBeVisible('Explore the class hierarchy — 6/7', 28);
            GuideSteps.verifyIsElementInteractable('[guide-selector="class-schema:Movie"]');

            GuideSteps.clickOnPreviousButton(28);
            GuideSteps.verifyPageNotInteractive();
            GuideSteps.waitDialogWithTitleBeVisible('Explore the class hierarchy — 5/7', 27);
            GuideSteps.verifyIsElementInteractable('#classChart #main-group');

            GuideSteps.clickOnPreviousButton(27);
            GuideSteps.verifyPageNotInteractive();
            GuideSteps.waitDialogWithTitleBeVisible('Explore the class hierarchy — 4/7', 26);

            GuideSteps.clickOnPreviousButton(26);
            GuideSteps.verifyPageNotInteractive();
            GuideSteps.waitDialogWithTitleBeVisible('Explore the class hierarchy — 3/7', 25);
            GuideSteps.verifyIsElementInteractable('[guide-selector="menu-class-hierarchy"]');

            GuideSteps.clickOnPreviousButton(25);
            GuideSteps.verifyPageNotInteractive();
            GuideSteps.waitDialogWithTitleBeVisible('Explore the class hierarchy — 2/7', 24);
            GuideSteps.verifyIsElementInteractable('[guide-selector="menu-explore"]');

            GuideSteps.clickOnPreviousButton(24);
            GuideSteps.verifyPageNotInteractive();
            GuideSteps.waitDialogWithTitleBeVisible('Explore the class hierarchy — 1/7', 23);

            cy.pause();
        }
    });

    function selectRepository(repositoryId) {
        GuideSteps.waitDialogWithTitleBeVisible('Connect to repository — 1/2', 9);
        GuideSteps.verifyPageNotInteractive();
        GuideSteps.verifyIsElementInteractable('[guide-selector="repositoriesGroupButton"]');

        // Step select "starwars" repository button.
        GuideSteps.clickOnChooseRepositoryButton();
        GuideSteps.waitDialogWithTitleBeVisible('Connect to repository — 2/2', 10);
        GuideSteps.verifyPageNotInteractive();
        GuideSteps.verifyIsElementInteractable('[guide-selector="repository-' + repositoryId + '-button"]');

        // Step described autocomplete.
        GuideSteps.clickOnSelectRepositoryButton(repositoryId);
    }

    function createRepository(repositoryId) {
        GuideSteps.waitDialogWithTitleBeVisible('Create repository — 1/7', 2);

        // Step select menu "Setup".
        GuideSteps.clickOnNextButton(2);
        GuideSteps.waitDialogWithTitleBeVisible('Create repository — 2/7', 3);
        GuideSteps.verifyPageNotInteractive();
        GuideSteps.verifyIsElementInteractable('[guide-selector="menu-setup"]');
        GuideSteps.verifyIsNotElementInteractable('[guide-selector="sub-menu-repositories"]');

        // Step select menu "Repositories".
        GuideSteps.clickOnMenuSetup();
        GuideSteps.waitDialogWithTitleBeVisible('Create repository — 3/7', 4);
        GuideSteps.verifyPageNotInteractive();
        GuideSteps.verifyIsElementInteractable('[guide-selector="sub-menu-repositories"]');

        // Step select repository.
        GuideSteps.clickOnSubMenuRepositories();
        GuideSteps.waitDialogWithTitleBeVisible('Create repository — 4/7', 5);
        GuideSteps.verifyPageNotInteractive();
        GuideSteps.verifyIsElementInteractable('[guide-selector="createRepository"]');

        // Step click on button "GraphDB Repository".
        GuideSteps.clickOnOpenCreateRepositoryFormButton();
        GuideSteps.waitDialogWithTitleBeVisible('Create repository — 5/7', 6);
        GuideSteps.verifyPageNotInteractive();
        GuideSteps.verifyIsElementInteractable('[guide-selector="createGraphDBRepository"]');

        // Step enter "Repository ID".
        GuideSteps.clickOnGraphDBRepositoryButton();
        GuideSteps.waitDialogWithTitleBeVisible('Create repository — 6/7', 7);
        GuideSteps.verifyPageNotInteractive();
        GuideSteps.verifyIsElementInteractable('[guide-selector="graphDBRepositoryIdInput"]');

        // Step select "Create" repository button.
        GuideSteps.clickOnNextButton(7);
        GuideSteps.waitDialogWithTitleBeVisible('Create repository — 7/7', 8);
        GuideSteps.verifyPageNotInteractive();
        cy.get('[guide-selector="graphDBRepositoryIdInput"]').should('have.value', repositoryId);
        GuideSteps.verifyIsElementInteractable('[guide-selector="graphDBRepositoryCrateButton"]');

        GuideSteps.clickOnCreateRepositoryButton();
        GuideSteps.verifyPageNotInteractive();
    }

    function createRepositoryByNextButton(repositoryId) {
        GuideSteps.waitDialogWithTitleBeVisible('Create repository — 1/7', 2);

        // Step select menu "Setup".
        GuideSteps.clickOnNextButton(2);
        GuideSteps.waitDialogWithTitleBeVisible('Create repository — 2/7', 3);
        GuideSteps.verifyPageNotInteractive();
        GuideSteps.verifyIsElementInteractable('[guide-selector="menu-setup"]');
        GuideSteps.verifyIsNotElementInteractable('[guide-selector="sub-menu-repositories"]');

        // Step select menu "Repositories".
        GuideSteps.clickOnNextButton(3);
        GuideSteps.waitDialogWithTitleBeVisible('Create repository — 3/7', 4);
        GuideSteps.verifyPageNotInteractive();
        GuideSteps.verifyIsElementInteractable('[guide-selector="sub-menu-repositories"]');

        // Step select repository.
        GuideSteps.clickOnNextButton(4);
        GuideSteps.waitDialogWithTitleBeVisible('Create repository — 4/7', 5);
        GuideSteps.verifyPageNotInteractive();
        GuideSteps.verifyIsElementInteractable('[guide-selector="createRepository"]');

        // Step click on button "GraphDB Repository".
        GuideSteps.clickOnNextButton(5);
        GuideSteps.waitDialogWithTitleBeVisible('Create repository — 5/7', 6);
        GuideSteps.verifyPageNotInteractive();
        GuideSteps.verifyIsElementInteractable('[guide-selector="createGraphDBRepository"]');

        // Step enter "Repository ID".
        GuideSteps.clickOnNextButton(6);
        GuideSteps.waitDialogWithTitleBeVisible('Create repository — 6/7', 7);
        GuideSteps.verifyPageNotInteractive();
        GuideSteps.verifyIsElementInteractable('[guide-selector="graphDBRepositoryIdInput"]');

        // Step select "Create" repository button.
        GuideSteps.clickOnNextButton(7);
        GuideSteps.waitDialogWithTitleBeVisible('Create repository — 7/7', 8);
        GuideSteps.verifyPageNotInteractive();
        cy.get('[guide-selector="graphDBRepositoryIdInput"]').should('have.value', repositoryId);
        GuideSteps.verifyIsElementInteractable('[guide-selector="graphDBRepositoryCrateButton"]');

        GuideSteps.clickOnNextButton(8);
        GuideSteps.verifyPageNotInteractive();
    }

    function selectRepositoryByNextButton(repositoryId) {
        GuideSteps.waitDialogWithTitleBeVisible('Connect to repository — 1/2', 9);
        GuideSteps.verifyIsElementInteractable('[guide-selector="repositoriesGroupButton"]');

        // Step select "starwars" repository button.
        GuideSteps.clickOnNextButton(9);
        GuideSteps.verifyPageNotInteractive();
        GuideSteps.waitDialogWithTitleBeVisible('Connect to repository — 2/2', 10);
        GuideSteps.verifyIsElementInteractable('[guide-selector="repository-' + repositoryId + '-button"]');
    }

    function enableAutocomplete() {
        GuideSteps.waitDialogWithTitleBeVisible('Enable autocomplete — 1/5', 11);
        GuideSteps.verifyPageNotInteractive();

        // Step select menu setup.
        GuideSteps.clickOnNextButton(11);
        GuideSteps.waitDialogWithTitleBeVisible('Enable autocomplete — 2/5', 12);
        GuideSteps.verifyPageNotInteractive();
        GuideSteps.verifyIsElementInteractable('[guide-selector="menu-setup"]');

        // Step select autocomplete.
        GuideSteps.clickOnMenuSetup();
        GuideSteps.waitDialogWithTitleBeVisible('Enable autocomplete — 3/5', 13);
        GuideSteps.verifyPageNotInteractive();
        GuideSteps.verifyIsElementInteractable('[guide-selector="sub-menu-autocomplete"]');

        // Step enable autocomplete index.
        GuideSteps.clickOnSubMenuAutocompleteButton();
        GuideSteps.waitDialogWithTitleBeVisible('Enable autocomplete — 4/5', 14);
        GuideSteps.verifyPageNotInteractive();
        GuideSteps.verifyIsElementInteractable('[guide-selector="autocompleteCheckbox"]');

        // Step wait autocomplete indexing complete
        GuideSteps.clickOnEnableAutocompleteButton();
        GuideSteps.waitDialogWithTitleBeVisible('Enable autocomplete — 5/5', 15);
        GuideSteps.verifyPageNotInteractive();
        GuideSteps.verifyIsElementInteractable('[guide-selector="autocompleteStatus"]');
        cy.get('.tag.tag-success.ng-binding:visible').contains('Ready');

        GuideSteps.clickOnNextButton(15);
        GuideSteps.verifyPageNotInteractive();
    }

    function enableAutocompleteByNextButton() {
        GuideSteps.waitDialogWithTitleBeVisible('Enable autocomplete — 1/5', 11);

        // Step select menu setup.
        GuideSteps.clickOnNextButton(11);
        GuideSteps.waitDialogWithTitleBeVisible('Enable autocomplete — 2/5', 12);
        GuideSteps.verifyPageNotInteractive();
        GuideSteps.verifyIsElementInteractable('[guide-selector="menu-setup"]');

        // Step select autocomplete.
        GuideSteps.clickOnNextButton(12);
        GuideSteps.waitDialogWithTitleBeVisible('Enable autocomplete — 3/5', 13);
        GuideSteps.verifyPageNotInteractive();
        GuideSteps.verifyIsElementInteractable('[guide-selector="sub-menu-autocomplete"]');

        // Step enable autocomplete index.
        GuideSteps.clickOnNextButton(13);
        GuideSteps.waitDialogWithTitleBeVisible('Enable autocomplete — 4/5', 14);
        GuideSteps.verifyPageNotInteractive();
        GuideSteps.verifyIsElementInteractable('[guide-selector="autocompleteCheckbox"]');

        // Step wait autocomplete indexing complete
        GuideSteps.clickOnNextButton(14);
        GuideSteps.waitDialogWithTitleBeVisible('Enable autocomplete — 5/5', 15);
        GuideSteps.verifyPageNotInteractive();
        GuideSteps.verifyIsElementInteractable('[guide-selector="autocompleteStatus"]');
        cy.get('.tag.tag-success.ng-binding:visible').contains('Ready');
    }

    function importFile(fileToImport) {
        GuideSteps.waitDialogWithTitleBeVisible('Import file — 1/7', 16);
        GuideSteps.verifyPageNotInteractive();

        // Step select "Import" button.
        GuideSteps.clickOnNextButton(16);
        GuideSteps.waitDialogWithTitleBeVisible('Import file — 2/7', 17);
        GuideSteps.verifyPageNotInteractive();
        GuideSteps.verifyIsElementInteractable('[guide-selector="menu-import"]');

        // Step described download of file.
        GuideSteps.clickOnMenuImportButton();
        GuideSteps.waitDialogWithTitleBeVisible('Import file — 3/7', 18);
        GuideSteps.verifyPageNotInteractive();

        // Step click Upload RDF files button.
        GuideSteps.clickOnNextButton(18);
        GuideSteps.waitDialogWithTitleBeVisible('Import file — 4/7', 19);
        GuideSteps.verifyPageNotInteractive();
        GuideSteps.verifyIsElementInteractable('[guide-selector="uploadRdfFileButton"]');

        GuideSteps.uploadFile(fileToImport);
        GuideSteps.waitDialogWithTitleBeVisible('Import file — 5/7', 20);

        // Step click on import starwars.ttl file
        GuideSteps.verifyIsElementInteractable('[guide-selector="import-file-' + fileToImport + '"]');
        GuideSteps.clickOnImportRepositoryRdfFileButton(fileToImport);
        GuideSteps.waitDialogWithTitleBeVisible('Import file — 6/7', 21);
        GuideSteps.verifyPageNotInteractive();

        // Step click on Import button.
        GuideSteps.clickOnImportButton();
        GuideSteps.waitDialogWithTitleBeVisible('Import file — 7/7', 22);
        GuideSteps.verifyPageNotInteractive();
        cy.get('[guide-selector="import-status-info"] .import-status-message:visible').contains('Imported successfully');

        // Step visual graph intro
        GuideSteps.clickOnNextButton(22);
    }

    function importFileByNextButton(fileToImport) {
        GuideSteps.waitDialogWithTitleBeVisible('Import file — 1/7', 16);

        // Step select "Import" button.
        GuideSteps.clickOnNextButton(16);
        GuideSteps.waitDialogWithTitleBeVisible('Import file — 2/7', 17);
        GuideSteps.verifyPageNotInteractive();
        GuideSteps.verifyIsElementInteractable('[guide-selector="menu-import"]');

        // Step described download of file.
        GuideSteps.clickOnNextButton(17);
        GuideSteps.verifyPageNotInteractive();
        GuideSteps.waitDialogWithTitleBeVisible('Import file — 3/7', 18);

        // Step click Upload RDF files button.
        GuideSteps.clickOnNextButton(18);
        GuideSteps.waitDialogWithTitleBeVisible('Import file — 4/7', 19);
        GuideSteps.verifyPageNotInteractive();
        GuideSteps.verifyIsElementInteractable('[guide-selector="uploadRdfFileButton"]');

        GuideSteps.uploadFile(fileToImport);
        GuideSteps.waitDialogWithTitleBeVisible('Import file — 5/7', 20);

        // Step click on import starwars.ttl file
        GuideSteps.verifyIsElementInteractable('[guide-selector="import-file-' + fileToImport + '"]');
        GuideSteps.clickOnNextButton(20);
        GuideSteps.verifyPageNotInteractive();
        GuideSteps.waitDialogWithTitleBeVisible('Import file — 6/7', 21);

        // Step click on Import button.
        GuideSteps.clickOnNextButton(21);
        GuideSteps.waitDialogWithTitleBeVisible('Import file — 7/7', 22);
        GuideSteps.verifyPageNotInteractive();
        cy.get('[guide-selector="import-status-info"] .import-status-message:visible').contains('Imported successfully');
    }
});
