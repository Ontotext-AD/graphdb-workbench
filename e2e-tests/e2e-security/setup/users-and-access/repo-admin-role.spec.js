import {UserAndAccessSteps} from "../../../steps/setup/user-and-access-steps";
import {LoginSteps} from "../../../steps/login-steps";
import {YasqeSteps} from "../../../steps/yasgui/yasqe-steps";
import {YasrSteps} from "../../../steps/yasgui/yasr-steps";
import {MainMenuSteps} from "../../../steps/main-menu-steps";
import HomeSteps from "../../../steps/home-steps";
import {ActiveRepositoryWidgetSteps} from "../../../steps/widgets/active-repository-widget-steps";

describe('Repository Admin – Permissions and Access Control', () => {
    const repoAdminUsername = `repoadmin-${Date.now()}`;
    const password = 'Admin123!';
    let repositoryId;

    beforeEach(() => {
        repositoryId = `repo-${Date.now()}`;
        cy.createRepository({ id: repositoryId });
        cy.presetRepository(repositoryId);
        cy.initializeRepository(repositoryId);

        UserAndAccessSteps.visit();
        UserAndAccessSteps.clickCreateNewUserButton();
        UserAndAccessSteps.typeUsername(repoAdminUsername);
        UserAndAccessSteps.typePassword(password);
        UserAndAccessSteps.typeConfirmPasswordField(password);
        UserAndAccessSteps.selectRoleRadioButton('#roleRepoAdmin');

        UserAndAccessSteps.getReadAccessForRepo('*').should('be.checked').and('be.disabled');
        UserAndAccessSteps.getWriteAccessForRepo('*').should('be.checked').and('be.disabled');

        UserAndAccessSteps.confirmUserCreate();
        UserAndAccessSteps.toggleSecurity();
    });

    afterEach(() => {
        cy.loginAsAdmin();
        cy.switchOffSecurity(true);
        cy.deleteUser(repoAdminUsername);
        cy.deleteRepository(repositoryId);
    });

    it('Repository admin has correct access and restrictions', () => {
        LoginSteps.visitLoginPage();
        LoginSteps.loginWithUser(repoAdminUsername, password);

        // SPARQL – read access
        MainMenuSteps.clickOnSparqlMenu();

        YasqeSteps.getEditor().should('be.visible');
        YasqeSteps.executeQuery();

        // SPARQL – write access
        YasqeSteps.clearEditor();
        const prefix = 'PREFIX ex: <http://example.org/>\n';
        const query = 'INSERT DATA {\n' +
            'ex:greeting ex:text "Hello, world!" .\n' +
            '}';
        cy.pasteIntoCodeMirror('.CodeMirror', prefix + query);
        YasqeSteps.executeQueryWithoutWaiteResult();
        // Verify read access
        YasrSteps.getResponseInfo()
            .should('not.have.class', 'hidden')
            .should('not.have.class', 'empty')
            .should('be.visible')
            .should('contain.text', 'Added 1 statements.');

        // Create repo button on homepage should be visible
        HomeSteps.visit();
        ActiveRepositoryWidgetSteps.getImportLink().scrollIntoView().should('be.visible').and('not.be.disabled');
    });
});
