import SparqlSteps from "../../steps/sparql-steps";

const LONG_ERROR_MESSAGE = "Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.";
const MAX_VISIBLE_ERROR_CHARACTERS = 160;
const SHORTEN_PART_OFF_ERROR_MESSAGE = LONG_ERROR_MESSAGE.substring(0, MAX_VISIBLE_ERROR_CHARACTERS);
const SHORT_ERROR_MESSAGE = LONG_ERROR_MESSAGE.substring(0, MAX_VISIBLE_ERROR_CHARACTERS - 1);
describe('Error handling', () => {
    let repositoryId;

    beforeEach(() => {
        repositoryId = 'sparql-error-handling' + Date.now();
        cy.createRepository({id: repositoryId});
        cy.presetRepository(repositoryId);
        SparqlSteps.visit();
    });

    afterEach(() => {
        cy.deleteRepository(repositoryId);
    });

    it('should show all error message if message length is short', () => {
        stubErrorResponse(400, SHORT_ERROR_MESSAGE);
        // When I open sparql editor page
        // Then I should see no query has been executed
        SparqlSteps.getNoQueryRunInfo().should('be.visible');
        // When I execute a query
        SparqlSteps.executeQuery();

        // Then I expect to see all message,
        SparqlSteps.getResultInfo().contains(SHORT_ERROR_MESSAGE);
        // and don't see the button "Show full exception message",
        SparqlSteps.getShowFullExceptionMessage().should('not.exist');
        // and don't see the button "Show less exception message",
        SparqlSteps.getShowLessExceptionMessage().should('not.exist');

    });

    it('should show shorten error message if message length is long', () => {
        stubErrorResponse(400, LONG_ERROR_MESSAGE);
        // When I open sparql editor page
        // Then I should see no query has been executed
        SparqlSteps.getNoQueryRunInfo().should('be.visible');
        // When I execute a query
        SparqlSteps.executeQuery();

        // Then I expect to see shorten error message,
        SparqlSteps.getResultInfo().contains(SHORTEN_PART_OFF_ERROR_MESSAGE);
        // and the button "Show full exception message" to be displayed,
        SparqlSteps.getShowFullExceptionMessage().should('be.visible');
        // and don't see the button "Show less exception message",
        SparqlSteps.getShowLessExceptionMessage().should('not.exist');

        // When I click on "Show full error message" button.
        SparqlSteps.clickOnShowFullExceptionMessage();

        // Then I expect to see full error message
        SparqlSteps.getResultInfo().contains(LONG_ERROR_MESSAGE);
        // and the button "Show full exception message" to not exist,
        SparqlSteps.getShowFullExceptionMessage().should('not.exist');
        // and see the button "Show less exception message",
        SparqlSteps.getShowLessExceptionMessage().should('be.visible');

        // When I click on "Show less error message" button.
        SparqlSteps.clickOnShowLessExceptionMessage();

        // Then I expect to see short error message
        SparqlSteps.getResultInfo().contains(SHORTEN_PART_OFF_ERROR_MESSAGE);
        // and the button "Show full exception message" to be displayed,
        SparqlSteps.getShowFullExceptionMessage().should('be.exist');
        // and don't see the button "Show less exception message",
        SparqlSteps.getShowLessExceptionMessage().should('not.exist');
    });

    const stubErrorResponse = (statusCode, errorMessage) => {
        cy.intercept('POST', '/repositories/' + repositoryId, {
            statusCode,
            body: errorMessage
        }).as('queryResultStub');
    };
});
