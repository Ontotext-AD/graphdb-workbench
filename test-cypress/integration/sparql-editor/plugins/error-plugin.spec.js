import SparqlSteps from "../../../steps/sparql-steps";
import {QueryStubs} from "../../../stubs/query-stubs";
import {YasqeSteps} from "../../../steps/yasgui/yasqe-steps";
import {ErrorPluginSteps} from "../../../steps/yasgui/plugin/error-plugin-steps";
import {YasrSteps} from "../../../steps/yasgui/yasr-steps";

const SHORT_ERROR_BODY = 'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore';
const LONG_ERROR_BODY = 'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.';
const LESS_MESSAGE = LONG_ERROR_BODY.substring(0, 160);

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

    it('should show error without show full message button when error message is les than 160 characters.', () => {
        // When I visit a page with "ontotext-yasgui-web-component" in it,
        // and execute wrong query that returns short error message (less thant 160).
        QueryStubs.stubQueryErrorResponse(repositoryId, 500, SHORT_ERROR_BODY);
        YasqeSteps.executeErrorQuery();

        // Then I expect to see a message that
        // describes error status and error text,
        ErrorPluginSteps.getErrorPluginErrorStatus().contains('500: Internal Server Error');
        // and time when the query is executed,
        ErrorPluginSteps.getErrorPluginErrorTimeMessage().contains(/Query took \d{1}\.\d{1}s, moments ago\./);
        // and error message sent by server,
        ErrorPluginSteps.getErrorPluginBody().invoke('text').should('eq', SHORT_ERROR_BODY);
        // and toolbar with plugins to not be visible,
        YasrSteps.getResultHeader().should('not.be.visible');
        // and message info to not be visible,
        YasrSteps.getResponseInfo().should('not.be.visible');
        // and show full/less error message not be visible
        ErrorPluginSteps.getShowFullErrorMessage().should('not.exist');
        ErrorPluginSteps.getShowLessErrorMessage().should('not.exist');
    });

    it('should show error with show full message button when error message is more than than 160 characters.', () => {
        // When I visit a page with "ontotext-yasgui-web-component" in it,
        // and execute wrong query.
        QueryStubs.stubQueryErrorResponse(repositoryId, 500, LONG_ERROR_BODY);
        YasqeSteps.executeErrorQuery();

        // Then I expect to see a message that
        // describes error status and error text,
        ErrorPluginSteps.getErrorPluginErrorStatus().contains('500: Internal Server Error');
        // and time when the query is executed,
        ErrorPluginSteps.getErrorPluginErrorTimeMessage().contains(/Query took \d{1}\.\d{1}s, moments ago\./);
        // and error message sent by server,
        ErrorPluginSteps.getErrorPluginBody().invoke('text').should('eq', LESS_MESSAGE);
        // and toolbar with plugins to not be visible,
        YasrSteps.getResultHeader().should('not.be.visible');
        // and message info to not be visible,
        YasrSteps.getResponseInfo().should('not.be.visible');
        ErrorPluginSteps.getShowFullErrorMessage().should('be.visible');
        ErrorPluginSteps.getShowLessErrorMessage().should('not.exist');

        // When click on show full message
        ErrorPluginSteps.getShowFullErrorMessage().click();

        // Then I expect to see full message
        ErrorPluginSteps.getErrorPluginBody().invoke('text').should('eq', LONG_ERROR_BODY);
        ErrorPluginSteps.getShowFullErrorMessage().should('not.exist');
        ErrorPluginSteps.getShowLessErrorMessage().should('be.visible');

        // When click on show less message
        ErrorPluginSteps.getShowLessErrorMessage().click();

        // Then I expect to see first 160 characters of the error message
        ErrorPluginSteps.getErrorPluginBody().invoke('text').should('eq', LESS_MESSAGE);
        ErrorPluginSteps.getShowFullErrorMessage().should('be.visible');
        ErrorPluginSteps.getShowLessErrorMessage().should('not.exist');
    });
});
