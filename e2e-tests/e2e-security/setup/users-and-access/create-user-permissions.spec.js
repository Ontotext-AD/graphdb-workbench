import {MainMenuSteps} from '../../../steps/main-menu-steps';
import {UserAndAccessSteps} from '../../../steps/setup/user-and-access-steps';
import {LoginSteps} from '../../../steps/login-steps';
import {ToasterSteps} from '../../../steps/toaster-steps';
import {YasqeSteps} from '../../../steps/yasgui/yasqe-steps';
import {YasrSteps} from '../../../steps/yasgui/yasr-steps';

describe('User Management – Creation, Validation, Permissions & Deletion', () => {
    let repositoryId;
    const testPassword = 'P@ssw0rd123!';
    const testUsername = `testuser-${Date.now()}`;

    beforeEach(() => {
        cy.loginAsAdmin();
        cy.switchOffSecurity(true);
        // Create and initialize a fresh repository for isolation
        repositoryId = `repo-${Date.now()}`;
        cy.createRepository({ id: repositoryId });
        cy.presetRepository(repositoryId);
        cy.initializeRepository(repositoryId);

        // Navigate to Users & Access
        UserAndAccessSteps.visit();
    });

    afterEach(() => {
        // Clean up repository
        cy.deleteRepository(repositoryId);
        cy.deleteUser('user');
    });

    describe('Create a new user – validation', () => {
        beforeEach(() => {
            UserAndAccessSteps.clickCreateNewUserButton();
            cy.deleteUser('user');
        });

        it('should show error when username is empty', () => {
            UserAndAccessSteps.typePassword(testPassword);
            UserAndAccessSteps.typeConfirmPasswordField(testPassword);
            UserAndAccessSteps.clickReadAccessRepo(repositoryId);
            UserAndAccessSteps.clickWriteAccessRepo(repositoryId);
            UserAndAccessSteps.confirmUserCreate();
            UserAndAccessSteps.getUserFieldError('username').should('be.visible').and('contain.text', 'Enter username!');
        });

        it('should show error when passwords are empty', () => {
            UserAndAccessSteps.typeUsername(testUsername);
            UserAndAccessSteps.confirmUserCreate();
            UserAndAccessSteps.getUserFieldError('password').should('be.visible').and('contain.text', 'Enter password!');
            UserAndAccessSteps.getUserFieldError('confirmPassword').should('be.visible').and('contain.text', 'Confirm password!');
        });

        it('should show error when passwords do not match', () => {
            UserAndAccessSteps.typeUsername(testUsername);
            UserAndAccessSteps.typePassword(testPassword);
            UserAndAccessSteps.typeConfirmPasswordField('Different123!');
            UserAndAccessSteps.clickReadAccessRepo(repositoryId);
            UserAndAccessSteps.clickWriteAccessRepo(repositoryId);
            UserAndAccessSteps.confirmUserCreate();
            UserAndAccessSteps.getUserFieldError('confirmPassword').should('be.visible').and('contain.text', 'Confirm password!');
        });

        it('should show error when username duplicates existing one', () => {
            UserAndAccessSteps.typeUsername('user');
            UserAndAccessSteps.typePassword(testPassword);
            UserAndAccessSteps.typeConfirmPasswordField(testPassword);
            UserAndAccessSteps.clickReadAccessRepo(repositoryId);
            UserAndAccessSteps.clickWriteAccessRepo(repositoryId);
            UserAndAccessSteps.confirmUserCreate();

            cy.url().should('include', '/users');
            UserAndAccessSteps.clickCreateNewUserButton();
            UserAndAccessSteps.typeUsername('user');
            UserAndAccessSteps.typePassword(testPassword);
            UserAndAccessSteps.typeConfirmPasswordField(testPassword);
            UserAndAccessSteps.clickWriteAccessRepo(repositoryId);
            UserAndAccessSteps.confirmUserCreate();

            // Using the toaster from the shared components which has different class names

            ToasterSteps.verifyError('An account with the given username already exists.');
            cy.deleteUser('user');
        });

        it('should show error when no repository read access is given', () => {
            UserAndAccessSteps.typeUsername(testUsername);
            UserAndAccessSteps.typePassword(testPassword);
            UserAndAccessSteps.typeConfirmPasswordField(testPassword);
            UserAndAccessSteps.confirmUserCreate();
            UserAndAccessSteps.getRepositoryRightsError().should('be.visible').and('contain.text', 'Users should have rights to at least one repository!');
        });

        it('should show error when custom role is too short', () => {
            UserAndAccessSteps.typeUsername(testUsername);
            UserAndAccessSteps.typePassword(testPassword);
            UserAndAccessSteps.typeConfirmPasswordField(testPassword);
            UserAndAccessSteps.addTextToCustomRoleField('a');
            UserAndAccessSteps.clickReadAccessRepo(repositoryId);
            UserAndAccessSteps.clickWriteAccessRepo(repositoryId);
            UserAndAccessSteps.getCustomRoleFieldError().should('be.visible').and('contain.text', 'Must be at least 2 symbols long');
        });
    });

    describe('Create a new user – read/write access', () => {
        const rwUsername = `rwuser-${Date.now()}`;

        afterEach(() =>{
            cy.loginAsAdmin();
            cy.switchOffSecurity(true);
            cy.deleteUser(rwUsername);
        })

        it('should create, login, and verify permissions', () => {
            UserAndAccessSteps.clickCreateNewUserButton();
            UserAndAccessSteps.typeUsername(rwUsername);
            UserAndAccessSteps.typePassword(testPassword);
            UserAndAccessSteps.typeConfirmPasswordField(testPassword);
            UserAndAccessSteps.clickReadAccessRepo(repositoryId);
            UserAndAccessSteps.clickWriteAccessRepo(repositoryId);
            UserAndAccessSteps.getWriteAccessForRepo(repositoryId).should('be.checked');
            UserAndAccessSteps.confirmUserCreate();
            UserAndAccessSteps.toggleSecurity();

            LoginSteps.visitLoginPage();

            LoginSteps.loginWithUser(rwUsername, testPassword);
            MainMenuSteps.clickOnSparqlMenu();

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

            LoginSteps.logout();
        });
    });

    describe('Create a new user – read only access', () => {
        const roUsername = `rouser-${Date.now()}`;

        afterEach(() =>{
            cy.loginAsAdmin();
            cy.switchOffSecurity(true);
            cy.deleteUser(roUsername);
        })

        it('should create, login, and verify read-only', () => {
            UserAndAccessSteps.clickCreateNewUserButton();
            UserAndAccessSteps.typeUsername(roUsername);
            UserAndAccessSteps.typePassword(testPassword);
            UserAndAccessSteps.typeConfirmPasswordField(testPassword);
            UserAndAccessSteps.clickReadAccessRepo(repositoryId);
            UserAndAccessSteps.getReadAccessForRepo(repositoryId).should('be.checked');
            UserAndAccessSteps.getWriteAccessForRepo(repositoryId).should('not.be.checked');
            UserAndAccessSteps.confirmUserCreate();
            UserAndAccessSteps.toggleSecurity();

            LoginSteps.visitLoginPage();

            LoginSteps.loginWithUser(roUsername, testPassword);
            MainMenuSteps.clickOnSparqlMenu();

            YasqeSteps.clearEditor();
            const prefix = 'PREFIX ex: <http://example.org/>\n';
            const query = 'INSERT DATA {\n' +
                'ex:greeting ex:text "Hello, world!" .\n' +
                '}';
            cy.pasteIntoCodeMirror('.CodeMirror', prefix + query);
            // Verify no write access
            YasqeSteps.executeErrorQuery();

            YasqeSteps.clearEditor();
            const readQuery = 'select * where {\n' +
                '?s ?p ?o .\n' +
                '} limit 100';
            cy.pasteIntoCodeMirror('.CodeMirror', readQuery);
            // Verify read accessorQuery();
            YasqeSteps.executeQuery();

            LoginSteps.logout();
        });
    });
});
