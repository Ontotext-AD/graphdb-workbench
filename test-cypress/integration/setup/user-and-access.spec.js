import {UserAndAccessSteps} from "../../steps/setup/user-and-access-steps";

describe('User and Access', () => {

    const PASSWORD = "password";
    const ROLE_USER = "#roleUser";
    const ROLE_REPO_MANAGER = "#roleRepoAdmin";
    const ROLE_CUSTOM_ADMIN = "#roleAdmin";
    const DEFAULT_ADMIN_PASSWORD = "root";
    const NO_PASS_ADMIN = 'adminWithNoPassword'

    context('', () => {
        beforeEach(() => {
            UserAndAccessSteps.visit();
            cy.window();
            // Users table should be visible
            UserAndAccessSteps.getUsersTable().should('be.visible');
        });

        after(() => {
            UserAndAccessSteps.visit();
            UserAndAccessSteps.getUsersTable().should('be.visible');
            UserAndAccessSteps.getUsersTableRow().then(() => {
                UserAndAccessSteps.getTableRow().each(($el) => {
                    UserAndAccessSteps.getUsersTable().should('be.visible');
                    const username = $el.find('.username').text();
                    if (username !== 'admin') {
                        UserAndAccessSteps.deleteUser(username);
                    }
                });
            });
        });

        it('Initial state', () => {
            // Create new user button should be visible
            UserAndAccessSteps.getCreateNewUserButton().should('be.visible');
            // Security should be disabled
            UserAndAccessSteps.getSecuritySwitchLabel().should('be.visible').and('contain', 'Security is OFF');
            UserAndAccessSteps.getSecurityCheckbox().should('not.be.checked');
            // Only admin user should be created by default
            UserAndAccessSteps.getTableRow().should('have.length', 1);
            UserAndAccessSteps.findUserInTable('admin');
            UserAndAccessSteps.getUserType().should('be.visible').and('contain', 'Administrator');
            // The admin should have unrestricted rights
            UserAndAccessSteps.getRepositoryRights().should('be.visible').and('contain', 'Unrestricted');
            // And can be edited
            UserAndAccessSteps.getEditUserButton().should('be.visible').and('not.be.disabled');
            // And cannot be deleted
            UserAndAccessSteps.getDeleteUserButton().should('not.exist');
            // Date created should be visible
            UserAndAccessSteps.getDateCreated().should('be.visible');
        });

        it('Create user', () => {
            const name = "user";
            //create a normal read/write user
            createUser(name, PASSWORD, ROLE_USER, {readWrite: true});
            testForUser(name, false);
        });

        it('Create user with GraphQL-only access', () => {
            const name = 'graphqlUser';
            createUser(name, PASSWORD, ROLE_USER, {read: true, graphql: true});
            testForUser(name, false);
        });

        it('Create repo-manager', () => {
            const name = "repo-manager";
            //create a repo-manager
            createUser(name, PASSWORD, ROLE_REPO_MANAGER);
            testForUser(name, false);
        });

        it('Create second admin', () => {
            const name = "second-admin";
            //create a custom admin
            createUser(name, PASSWORD, ROLE_CUSTOM_ADMIN);
            testForUser(name, true);
        });

        it('Create user with custom role', () => {
            const name = "user";
            // When I create a read/write user
            UserAndAccessSteps.clickCreateNewUserButton();
            UserAndAccessSteps.typeUsername(name);
            UserAndAccessSteps.typePassword(PASSWORD);
            UserAndAccessSteps.typeConfirmPasswordField(PASSWORD);
            UserAndAccessSteps.selectRoleRadioButton(ROLE_USER);
            // And add a custom role of 1 letter
            UserAndAccessSteps.addTextToCustomRoleField('A');
            // UserAndAccessSteps.getRepositoryRightsList().contains('Any data repository').nextUntil('.write').eq(1).within(() => {
            //     UserAndAccessSteps.clickWriteAccess();
            // });
            UserAndAccessSteps.clickWriteAccessForRepo('*');

            // Then the 'create' button should be disabled
            UserAndAccessSteps.getConfirmUserCreateButton().should('be.disabled');
            // And the field should show an error
            UserAndAccessSteps.getFieldError().should('contain.text', 'Must be at least 2 symbols long');
            // When I add more text to the custom role tag
            UserAndAccessSteps.addTextToCustomRoleField('A{enter}');
            // Then the 'create' button should be enabled
            UserAndAccessSteps.getConfirmUserCreateButton().should('be.enabled');
            // And the field error should not exist
            UserAndAccessSteps.getFieldError().should('not.be.visible');

            // When I type an invalid tag
            UserAndAccessSteps.addTextToCustomRoleField('B{enter}');
            // And the field shows an error
            UserAndAccessSteps.getFieldError().should('contain.text', 'Must be at least 2 symbols long');
            // When I delete the invalid text
            UserAndAccessSteps.addTextToCustomRoleField('{backspace}');
            // Then the error should not be visible
            UserAndAccessSteps.getFieldError().should('not.be.visible');
        });

        it('Adding a role with a CUSTOM_ prefix shows a warning message', () => {
            // When I create a user
            UserAndAccessSteps.clickCreateNewUserButton();
            // And I add a custom role tag with prefix CUSTOM_
            UserAndAccessSteps.addTextToCustomRoleField('CUSTOM_USER{Enter}');
            // There should be a warning text
            UserAndAccessSteps.getPrefixWarning(0).should('contain', 'Custom roles should be entered without the "CUSTOM_" prefix in Workbench');
        });

        it('Warn users when setting no password when creating new user admin', () => {
            UserAndAccessSteps.getUsersTable().should('be.visible');
            createUser(NO_PASS_ADMIN, PASSWORD, ROLE_CUSTOM_ADMIN, {noPassword: true});
            UserAndAccessSteps.getUsersTable().should('be.visible');
            UserAndAccessSteps.getSplashLoader().should('not.be.visible');
            UserAndAccessSteps.deleteUser(NO_PASS_ADMIN);
        });
    })

    context('GraphQL only', () => {
        let repositoryId1;
        let repositoryId2;
        let repositoryId3;

        beforeEach(() => {
            repositoryId1 = 'user-access-repo1' + Date.now();
            repositoryId2 = 'user-access-repo2' + Date.now();
            repositoryId3 = 'user-access-repo3' + Date.now();
            cy.createRepository({id: repositoryId1});
            cy.createRepository({id: repositoryId2});
            cy.createRepository({id: repositoryId3});
            cy.presetRepository(repositoryId1);
            UserAndAccessSteps.visit();
            // Users table should be visible
            UserAndAccessSteps.getUsersTable().should('be.visible');
        });

        afterEach(() => {
            cy.deleteRepository(repositoryId1);
            cy.deleteRepository(repositoryId2);
            cy.deleteRepository(repositoryId3);
        });

        it('Create user with GraphQL-only access', () => {
            const name = 'graphqlUser';
            createUser(name, PASSWORD, ROLE_USER, { read: true, graphql: true , repoName: repositoryId2});
            deleteUser(name);
        });

        it('Can create user with different auth combinations', () => {
            const name = 'graphqlUser1';
            // WHEN I create a user with read + GraphQL for repository #2
            createUser(name, PASSWORD, ROLE_USER, { read: true, graphql: true, repoName: repositoryId2 });
            // THEN the user should have read + GraphQL on that repo
            assertUserAuths(name, { repo: repositoryId2, read: true, graphql: true });
            // WHEN I open the edit page for that user
            UserAndAccessSteps.openEditUserPage(name);
            // THEN for repository #1, the GraphQL checkbox should be disabled initially
            UserAndAccessSteps.getGraphqlAccessForRepo(repositoryId1).should('be.disabled');
            // WHEN I enable "read" for repository #1
            editUserAuths({ repo: repositoryId1, read: true });
            // THEN GraphQL for repository #1 should become enabled
            UserAndAccessSteps.getGraphqlAccessForRepo(repositoryId1).should('be.enabled');
            // WHEN I enable GraphQL and read
            editUserAuths({ repo: repositoryId1, graphql: true });
            editUserAuths({ repo: repositoryId1, read: true });
            // THEN GraphQL should be checked and disabled
            UserAndAccessSteps.getGraphqlAccessForRepo(repositoryId1).should('be.checked').and('be.disabled');
            // THEN for repository #3, GraphQL should be disabled initially
            UserAndAccessSteps.getGraphqlAccessForRepo(repositoryId3).should('be.disabled');
            // WHEN I enable "write" for repository #3
            editUserAuths({ repo: repositoryId3, write: true });
            // THEN GraphQL for repository #3 should become enabled
            UserAndAccessSteps.getGraphqlAccessForRepo(repositoryId3).should('be.enabled');
            // And I expect "read" to be checked and disabled
            UserAndAccessSteps.getReadAccessForRepo(repositoryId3).should('be.checked').and('be.disabled');
            // I enable GraphQL for repository #3
            editUserAuths({ repo: repositoryId3, graphql: true });

            // WHEN I confirm the user edit
            UserAndAccessSteps.confirmUserEdit();
            // THEN verify the final rights:
            //  - repo #1 has no read/write/graphql
            //  - repo #2 has read + graphql
            //  - repo #3 has write + graphql (and read was auto-checked but disabled)
            assertUserAuths(name, { repo: repositoryId1, read: false, write: false, graphql: false });
            assertUserAuths(name, { repo: repositoryId2, read: true,  write: false, graphql: true });
            assertUserAuths(name, { repo: repositoryId3, read: false, write: true,  graphql: true });

            deleteUser(name);
        });
    });

    function createUser(username, password, role, opts = {}) {
        const {noPassword} = opts;
        UserAndAccessSteps.clickCreateNewUserButton();
        UserAndAccessSteps.typeUsername(username);
        UserAndAccessSteps.typePassword(password);
        UserAndAccessSteps.typeConfirmPasswordField(password);
        UserAndAccessSteps.selectRoleRadioButton(role);

        if (role === "#roleUser") {
            setRoles(opts);
            UserAndAccessSteps.confirmUserCreate();
        } else if (role === ROLE_CUSTOM_ADMIN && username === NO_PASS_ADMIN && noPassword) {
            UserAndAccessSteps.getNoPasswordCheckbox().check()
                .then(() => {
                    UserAndAccessSteps.getNoPasswordCheckbox()
                        .should('be.checked');
                });
            UserAndAccessSteps.getConfirmUserCreateButton().click()
                .then(() => {
                    UserAndAccessSteps.getDialogText().contains('If the password is unset and security is enabled, this administrator will not be ' +
                        'able to log into GraphDB through the workbench. Are you sure that you want to continue?');
                    UserAndAccessSteps.confirmInDialog();
                });
        } else {
            UserAndAccessSteps.confirmUserCreate();
        }
        UserAndAccessSteps.getSplashLoader().should('not.be.visible');
        UserAndAccessSteps.getUsersTable().should('contain', username);
    }

    function setRoles(opts = {}) {
        const {read = false, readWrite = false, graphql = false, repoName = '*'} = opts;
        if (read) {
            UserAndAccessSteps.clickReadAccessForRepo(repoName);
        }
        if (readWrite) {
            UserAndAccessSteps.clickWriteAccessForRepo(repoName);
        }
        if (graphql) {
            UserAndAccessSteps.clickGraphqlAccessForRepo(repoName);
        }
    }

    function testForUser(name, isAdmin) {
        //enable security
        UserAndAccessSteps.toggleSecurity();
        //login new user
        UserAndAccessSteps.loginWithUser(name, PASSWORD);
        //verify permissions
        UserAndAccessSteps.getUrl().should('include', '/users');
        if (isAdmin) {
            UserAndAccessSteps.getUsersTable().should('be.visible');
        } else {
            UserAndAccessSteps.getError().should('contain',
                'You have no permission to access this functionality with your current credentials.');
        }
        UserAndAccessSteps.logout();
        //login with the admin
        UserAndAccessSteps.loginWithUser("admin", DEFAULT_ADMIN_PASSWORD);
        UserAndAccessSteps.getSplashLoader().should('not.be.visible');
        UserAndAccessSteps.getUsersTable().should('be.visible');

        //delete new-user
        deleteUser(name)
        //disable security
        UserAndAccessSteps.toggleSecurity();
        UserAndAccessSteps.getSecuritySwitchLabel().should('be.visible').and('contain', 'Security is OFF');
    }

    function deleteUser(name) {
        UserAndAccessSteps.deleteUser(name);
        UserAndAccessSteps.getUsersTable().should('be.visible');
    }

    function assertUserAuths(username, {repo, read = false, write = false, graphql = false} = {}) {
        UserAndAccessSteps.findUserRowAlias(username, 'userRow');

        if(!read && !write) {
            return UserAndAccessSteps.getRepoLine('@userRow', repo).should('not.exist');
        }

        UserAndAccessSteps.findRepoLineAlias('@userRow', repo, 'repoLine');

        if (read) {
            UserAndAccessSteps.findReadIconAlias('@repoLine').should('be.visible');
        } else {
            UserAndAccessSteps.findReadIconAlias('@repoLine').should('not.exist');

        }

        if (write) {
            UserAndAccessSteps.findWriteIconAlias('@repoLine').should('be.visible');
        } else {
            UserAndAccessSteps.findWriteIconAlias('@repoLine').should('not.exist');
        }

        if (graphql) {
            UserAndAccessSteps.findGraphqlIconAlias('@repoLine').should('exist');
        } else {
            UserAndAccessSteps.findGraphqlIconAlias('@repoLine').should('not.exist');
        }
    }

    function editUserAuths({repo, read = false, write = false, graphql = false} = {}) {
        if (read === true) {
            UserAndAccessSteps.toggleReadAccessForRepo(repo);
        }

        if (write === true) {
            UserAndAccessSteps.toggleWriteAccessForRepo(repo);
        }

        if (graphql === true) {
            UserAndAccessSteps.toggleGraphqlAccessForRepo(repo);
        }
    }
});
