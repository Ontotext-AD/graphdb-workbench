import {SparqlEditorSteps} from "../../../steps/sparql-editor-steps";
import {YasguiSteps} from "../../../steps/yasgui/yasgui-steps";
import {QueryStubs} from "../../../stubs/yasgui/query-stubs";
import {UserAndAccessSteps} from "../../../steps/setup/user-and-access-steps";
import {SavedQuery} from "../../../steps/yasgui/saved-query";
import {SavedQueriesDialog} from "../../../steps/yasgui/saved-queries-dialog";

const USER_NAME = 'saved_query_user';
const USER_ADMINISTRATOR = 'admin';
const PASSWORD = 'root';

/**
 * Skipped because this type of implementation is not ideal. If the test fails and the `afterEach` hook
 * fails to toggle security, all remaining tests will fail because security remains enabled.
 *
 * Tests like this should be refactored to use stubs or other alternative implementations.
 */
describe.skip('Readonly saved query', () => {

    let repositoryId;

    beforeEach(() => {
        repositoryId = 'sparql-editor-' + Date.now();
        QueryStubs.stubQueryCountResponse();
        cy.createRepository({id: repositoryId});
        cy.presetRepository(repositoryId);
        QueryStubs.stubDefaultQueryResponse(repositoryId);
        cy.createUser({username: USER_NAME, password: PASSWORD});
        UserAndAccessSteps.visit();
        UserAndAccessSteps.toggleSecurity();
    });

    afterEach(() => {
        UserAndAccessSteps.logout();
        cy.deleteRepository(repositoryId);
        UserAndAccessSteps.visit();
        UserAndAccessSteps.loginWithUser(USER_ADMINISTRATOR, PASSWORD);
        UserAndAccessSteps.toggleSecurity();
        cy.deleteUser(USER_NAME);
    });

    it('Should not allow modifying a saved query if it is readonly', () => {
        // Given: There is a public saved query created by a user.
        UserAndAccessSteps.loginWithUser(USER_NAME, PASSWORD);
        SparqlEditorSteps.visitSparqlEditorPage();
        YasguiSteps.getYasgui().should('be.visible');
        const savedQueryName = SavedQuery.generateQueryName();
        SavedQuery.create(savedQueryName);
        UserAndAccessSteps.logout();

        // When: I log in with another user
        UserAndAccessSteps.loginWithUser(USER_ADMINISTRATOR, PASSWORD);
        // and open the popup with the saved query.
        SparqlEditorSteps.visitSparqlEditorPage();
        YasguiSteps.showSavedQueries();

        // Then: I expect:
        // 1. The delete button should not be visible because a saved query can only be deleted by the user who created it.
        SavedQueriesDialog.getDeleteQueryButtonByName(savedQueryName).should('not.exist');
        // 2. The edit button should not be visible because a saved query can only be edited by the user who created it.
        SavedQueriesDialog.getEditQueryButtonByName(savedQueryName).should('not.exist');
        // 3. The share button should be visible because a public saved query should be visible to all users.
        SavedQueriesDialog.getShareQueryButtonByName(savedQueryName).should('exist');
    });
});
