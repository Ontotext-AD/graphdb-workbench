import {VisualGraphSteps} from '../../../steps/visual-graph-steps';
import {MainMenuSteps} from '../../../steps/main-menu-steps.js';
import {LicenseStubs} from '../../../stubs/license-stubs';
import {ApplicationSteps} from '../../../steps/application-steps';
import HomeSteps from '../../../steps/home-steps.js';
import {BaseSteps} from "../../../steps/base-steps.js";

const FILE_TO_IMPORT = 'wine.rdf';
const VALID_RESOURCE = 'USRegion';
const DEFAULT_LINKS_LIMIT = 100;

describe('Visual graph linksLimit URL parameter', () => {

    let repositoryId;

    beforeEach(() => {
        cy.clearLocalStorage('ls.graphs-viz');
        repositoryId = 'graphRepo-' + Date.now();
        cy.createRepository({id: repositoryId});
        cy.presetRepository(repositoryId);
        cy.importServerFile(repositoryId, FILE_TO_IMPORT);
        cy.enableAutocomplete(repositoryId);

        LicenseStubs.spyGetLicense();
    });

    afterEach(() => {
        cy.clearLocalStorage('ls.graphs-viz');
        cy.deleteRepository(repositoryId);
    });

    it('Should include linksLimit as a URL parameter and respect its value', () => {
        // Given I am on the home page, and I don't have a linkLimit in the URL
        HomeSteps.visit();
        BaseSteps.getUrl().should('not.include', 'linksLimit');

        // When, I visit the visual graph via the main menu and open a resource
        MainMenuSteps.clickOnVisualGraph();
        VisualGraphSteps.verifyPageLoaded();
        VisualGraphSteps.searchForResourceAndOpen(VALID_RESOURCE, VALID_RESOURCE);

        // Then, I expect to see the visual graph with the default linksLimit
        BaseSteps.getUrl().should('include', `linksLimit=${DEFAULT_LINKS_LIMIT}`);


        // When, I update the link limit from the input field
        VisualGraphSteps.updateLinksLimitField(5);

        // Then I expect the URL to include the updated linksLimit in the URL
        BaseSteps.getUrl().should('include', 'linksLimit=5');
        // And, I expect to see the visual graph with the updated linksLimit
        VisualGraphSteps.getNodes().should('have.length', 6); // 5 links plus the main node

        // When, I change the linksLimit URL param directly to 10 and navigate to the updated URL
        BaseSteps.getUrl().then((url) => {
            const newUrl = new URL(url);
            newUrl.searchParams.set('linksLimit', '10');
            BaseSteps.visit(newUrl.toString().replace(Cypress.config('baseUrl'), ''));
        });
        // Then, I expect to see the visual graph with the updated linksLimit
        VisualGraphSteps.getNodes().should('have.length', 11) // 10 links plus the main node;
        // And, I expect the menu to be updated with the new linksLimit
        VisualGraphSteps.getLinksNumberField().should('have.value', '10');
    });

    it('Should show an error toast and ignore linksLimit when the URL param value is invalid', () => {
        // Given, I visit the visual graph with an invalid linksLimit URL param (outside the 1-1000 range)
        BaseSteps.visit(`/graphs-visualizations?uri=http:%2F%2Fwww.w3.org%2FTR%2F2003%2FPR-owl-guide-20031209%2Fwine%23${VALID_RESOURCE}&linksLimit=9999`);

        // Then, I expect to see an error notification about the invalid links limit
        ApplicationSteps.getErrorNotifications()
            .should('be.visible')
            .and('contain', 'Invalid links limit');
        // And I expect to see the visual graph with the default linksLimit
        BaseSteps.getUrl().should('include', 'linksLimit=100');
        VisualGraphSteps.getLinksNumberField().should('have.value', String(DEFAULT_LINKS_LIMIT));

        // When, I try to set the limit to an invalid value via the form
        VisualGraphSteps.updateLinksLimitField(1001);

        // Then, I should see a warning message that the link limit is invalid
        VisualGraphSteps.getInvalidLinksMessage().should('be.visible').and('contain', 'Enter a number up to 1000');
    });
});


