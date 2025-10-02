import {SparqlEditorSteps} from '../../../steps/sparql-editor-steps';
import {YasguiSteps} from '../../../steps/yasgui/yasgui-steps';
import {QueryStubs} from '../../../stubs/yasgui/query-stubs';
import {SavedQuery} from '../../../steps/yasgui/saved-query';
import {SavedQueriesDialog} from '../../../steps/yasgui/saved-queries-dialog';
import {LoginSteps} from '../../../steps/login-steps';

const USER_NAME = 'saved_query_user';
const USER_ADMINISTRATOR = 'admin';
const PASSWORD = 'root';

describe('Readonly saved query', () => {

    let repositoryId;

    beforeEach(() => {
        repositoryId = 'sparql-editor-' + Date.now();
        QueryStubs.stubQueryCountResponse();
        cy.createRepository({id: repositoryId});
        cy.presetRepository(repositoryId);
        QueryStubs.stubDefaultQueryResponse(repositoryId);
        cy.createUser({username: USER_NAME, password: PASSWORD});
        cy.switchOnSecurity();
    });

    afterEach(() => {
        cy.loginAsAdmin().then(() => {
            cy.switchOffSecurity(true);
            cy.deleteUser(USER_NAME, true);
            cy.deleteRepository(repositoryId);
        });
    });

    it('Should not allow modifying a saved query if it is readonly', () => {
        SparqlEditorSteps.visitSparqlEditorPage()
        // Given: There is a public saved query created by a user.
        LoginSteps.loginWithUser(USER_NAME, PASSWORD);
        YasguiSteps.getYasgui().should('be.visible');
        const savedQueryName = SavedQuery.generateQueryName();
        SavedQuery.create(savedQueryName);
        LoginSteps.logout();

        // When: I log in with another user
        LoginSteps.loginWithUser(USER_ADMINISTRATOR, PASSWORD);
        SparqlEditorSteps.visitSparqlEditorPage();
        // and open the popup with the saved query.
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
