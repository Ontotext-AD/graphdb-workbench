import HomeSteps from '../../steps/home-steps';
import {LicenseStubs} from "../../stubs/license-stubs";

const FILE_TO_IMPORT = 'wine.rdf';

describe('Home screen validation', () => {

    const FOAT_SNIPPET = '@base <http://example.org/> .\n' +
        '@prefix foaf: <http://xmlns.com/foaf/0.1/> .\n' +
        '<#green-goblin>\n' +
        'a foaf:Person ;    # in the context of the Marvel universe\n' +
        'foaf:name "Green Goblin" .\n';
    const GOBLIN_URI = 'http://example.org/#green-goblin';

    beforeEach(() => {
        cy.viewport(1280, 1000);
    });

    context('RDF resource search', () => {
        it('Search button should not be present when no repo is selected', () => {
            HomeSteps.visitAndWaitLoader();
            cy.get('.search-rdf-btn').should('not.exist');
            cy.get('.search-rdf-input').should('not.exist');
        });

        it('Search should be made from home page search when repo is set and on home page', () => {
            const repositoryId = '23repo' + Date.now();
            cy.createRepository({id: repositoryId});
            cy.initializeRepository(repositoryId);
            cy.enableAutocomplete(repositoryId);
            cy.presetRepository(repositoryId);

            // When I visit home page with selected repository
            HomeSteps.visitAndWaitLoader();
            // Search rdf button should be visible
            cy.get('.search-rdf-btn').should('be.visible');
            // When I click the button
            HomeSteps.doNotOpenRdfSearchBoxButFocusResourceSearch();
            // I should be able to type some text in the input on home page
            cy.get('#search-resource-input-home > #search-resource-box > input').type('hasPos');
            // And the autocomplete dropdown should become visible
            cy.get('#search-resource-input-home > #auto-complete-results-wrapper').should('be.visible');
            // // When I click the close button
            cy.get('#search-resource-input-home > #search-resource-box > .clear-icon').click();
            // // The input should be cleared
            cy.get('#search-resource-input-home > #search-resource-box > input').should('have.value', '');

            cy.deleteRepository(repositoryId);
        });

        it('Search should be present when repo is set', () => {
            const repositoryId = '23repo' + Date.now();
            cy.createRepository({id: repositoryId});
            cy.initializeRepository(repositoryId);
            cy.enableAutocomplete(repositoryId);
            cy.presetRepository(repositoryId);

            // When I visit not home page with selected repository
            cy.visit('/graphs');
            cy.get('.ot-splash').should('not.be.visible');
            cy.get('.ot-loader-new-content').should('not.exist');
            // Search rdf button should be visible
            cy.get('.search-rdf-btn').should('be.visible');
            // When I click the button
            HomeSteps.openRdfSearchBox();
            // I should be able to type some text in the input
            cy.get('.search-rdf-input search-resource-input .view-res-input').type('hasPos');
            // And the autocomplete dropdown should become visible
            cy.get('.search-rdf-input #auto-complete-results-wrapper').should('be.visible');
            // When I click the close button
            cy.get('.close-rdf-search-btn').click();
            // The input should not be cleared
            cy.get('.search-rdf-input search-resource-input .view-res-input').should('have.value', 'hasPos');
            // And the search bar should hide and not be visible
            cy.get('.search-rdf-input').should('not.be.visible');
            // And the suggestions list should not be visible
            cy.get('.search-rdf-input #auto-complete-results-wrapper').should('not.be.visible');
            // And the search button should be visible
            cy.get('.search-rdf-btn').should('be.visible');
            // When I open again the search box
            HomeSteps.openRdfSearchBox();
            // The input should have value 'hasPos'
            cy.get('.search-rdf-input search-resource-input .view-res-input').should('have.value', 'hasPos');
            // And dropdown should be visible
            cy.get('.search-rdf-input #auto-complete-results-wrapper').should('be.visible');
            // When I press 'escape'
            cy.get('.search-rdf-input search-resource-input .view-res-input').type('{esc}');
            // Search box should not be visible
            cy.get('.search-rdf-input').should('not.be.visible');

            cy.deleteRepository(repositoryId);
        });

        it('Search should be persisted on page reload', () => {
            const repositoryId = '23repo' + Date.now();
            cy.createRepository({id: repositoryId});
            cy.initializeRepository(repositoryId);
            cy.enableAutocomplete(repositoryId);
            cy.presetRepository(repositoryId);

            cy.visit('/graphs', {
                onBeforeLoad(win) {
                    cy.stub(win, 'open').as('window.open');
                }
            });
            cy.get('.ot-splash').should('not.be.visible');
            cy.get('.ot-loader-new-content').should('not.exist');
            // Search rdf button should be visible
            cy.get('.search-rdf-btn').should('be.visible');
            // When I click the button
            HomeSteps.openRdfSearchBox();
            // I should be able to type some text in the input
            cy.get('.search-rdf-input search-resource-input .view-res-input')
                .type('hasPos').then(() => {
                // When I select option from suggestions
                cy.get(".search-rdf-input #auto-complete-results-wrapper p")
                    .contains('hasPos')
                    .click()
                    .then(() => {
                        // Search result should be opened in new window
                        cy.get('@window.open').should('be.calledWith', 'resource?uri=http%3A%2F%2Fwww.w3.org%2Fns%2Forg%23hasPost');
                    });
            });

            // When I revisit the home page
            cy.visit('/graphs');
            // When I open again the search box
            HomeSteps.openRdfSearchBox();
            // The input should have value 'hasPos' from previous search
            cy.get('.search-rdf-input search-resource-input .view-res-input').should('have.value', 'hasPos');
            // And dropdown should be visible
            cy.get('.search-rdf-input #auto-complete-results-wrapper').should('be.visible');
            // When I press 'escape'
            cy.get('.search-rdf-input search-resource-input .view-res-input')
                .type('{esc}')
                .then(() => {
                    // Search box should not be visible
                    cy.get('.search-rdf-input').should('not.be.visible');
                });

            cy.deleteRepository(repositoryId);
        });

        it('Should test RDF resource search box', () => {
            //Prepare repository, autocomplete and import data.
            const repositoryId = 'repository-' + Date.now();
            cy.createRepository({id: repositoryId});
            cy.initializeRepository(repositoryId);
            cy.presetRepository(repositoryId);
            cy.importServerFile(repositoryId, FILE_TO_IMPORT);
            cy.enableAutocomplete(repositoryId);
            HomeSteps.visitAndWaitLoader();

            //Verify that the main resource search box is focused
            getRDFResourceSearchBox().click();
            cy.focused().should('have.attr', 'placeholder', 'Search RDF resources...');

            //Navigate away from the Homepage, to be able to test the new resource search box
            cy.visit('/graphs', {
                onBeforeLoad(win) {
                    cy.stub(win, 'open').as('window.open');
                }
            });

            cy.get('.ot-splash').should('not.be.visible');
            cy.get('.ot-loader-new-content').should('not.exist');

            getRDFResourceSearchBox().click();
            //Verify that the new resource search box is focused
            cy.focused().should('have.attr', 'placeholder', 'Search RDF resources...');

            //Verify autocomplete suggestions count
            cy.focused().then(() => {
                cy.get('#search-resource-box input')
                    .should('be.visible')
                    .type('Dry');
                cy.get('#auto-complete-results-wrapper')
                    .should('be.visible')
                    .children()
                    .should('have.length', 7);
            });

            //Test table and visual buttons.
            cy.get("#auto_0").should('be.visible').click();
            // Search result should be opened in new window
            cy.get('@window.open').should('be.calledWith', 'resource?uri=http%3A%2F%2Fwww.w3.org%2FTR%2F2003%2FPR-owl-guide-20031209%2Fwine%23Dry');

            getVisualButton().click();
            cy.get("#auto_0").should('be.visible').click();
            cy.get('@window.open').should('be.calledWith', 'graphs-visualizations?uri=http%3A%2F%2Fwww.w3.org%2FTR%2F2003%2FPR-owl-guide-20031209%2Fwine%23Dry');
            cy.deleteRepository(repositoryId);
        });
    });

    context('GA', () => {
        it('Should set GA tracking code in header when free license', () => {
            LicenseStubs.stubFreeLicense();
            LicenseStubs.stubGoogleCalls();
            HomeSteps.visit();
            cy.document()
                .get('head script')
                .should("have.attr", "src")
                .should('include', 'https://www.googletagmanager.com/gtm.js?id=GTM-WBP6C6Z4');
        });

        it('Should set GA tracking code in header when evaluation enterprise license', () => {
            LicenseStubs.stubEvaluationLicense();
            LicenseStubs.stubGoogleCalls();
            HomeSteps.visit();
            cy.document()
                .get('head script')
                .should("have.attr", "src")
                .should('include', 'https://www.googletagmanager.com/gtm.js?id=GTM-WBP6C6Z4');
        });

        it('Should NOT set GA tracking code in header when enterprise license', () => {
            LicenseStubs.stubEnterpriseLicense();
            LicenseStubs.stubGoogleCalls();
            HomeSteps.visit();
            cy.document()
                .get('head script')
                .should("not.have.attr", "src");
        });
    });

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

            const repositoryId = HomeSteps.createRepo();
            // Initializing the repository to speed up retrieving repository info
            cy.initializeRepository(repositoryId);

            HomeSteps.selectRepo(repositoryId);
            HomeSteps.verifyRepositoryIsSelected(repositoryId);
            HomeSteps.hasRepositoryInfo(repositoryId);

            cy.deleteRepository(repositoryId);
        });

        it('Test saved SPARQL queries links on home page and confirm dialog appearance', () => {
            const repositoryId = HomeSteps.createRepo();
            HomeSteps.selectRepo(repositoryId);

            HomeSteps.verifyQueryLink('Add statements', true);
            HomeSteps.verifyQueryLink('Clear graph', true);
            HomeSteps.verifyQueryLink('Remove statements', true);
            HomeSteps.verifyQueryLink('SPARQL Select template', false);

            cy.deleteRepository(repositoryId);
        });
    });

    context('"View resource" autocomplete', () => {
        it('Test homepage autocomplete when it is enabled', () => {
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

    context('Set preferred language', () => {
        beforeEach(() => HomeSteps.visitAndWaitLoader());
        it('language button should be visible and actionable', () => {
            cy.get('#languageGroupDrop')
                .should('be.visible')
                .click()
                .then(() => {
                    cy.get('.dropdown-menu .dropdown-item')
                        .should('have.length.at.least', 1);
                });
        });
    });

    function getRDFResourceSearchBox() {
        return cy.get('rdf-resource-search').should('be.visible');
    }

    function getVisualButton() {
        return cy.get('.display-type-visual-btn').should('be.visible');
    }
});
