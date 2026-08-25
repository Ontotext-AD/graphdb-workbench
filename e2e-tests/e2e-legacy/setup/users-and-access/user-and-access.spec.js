import {UserAndAccessSteps} from '../../../steps/setup/user-and-access-steps';
import {RepositoriesStubs} from '../../../stubs/repositories/repositories-stubs';
import {RepositorySelectorSteps} from '../../../steps/repository-selector-steps';
import {ModalDialogSteps} from '../../../steps/modal-dialog-steps';
import {ToasterSteps} from '../../../steps/toaster-steps';
import HomeSteps from '../../../steps/home-steps';
import {LoginSteps} from '../../../steps/login-steps';
import {MainMenuSteps} from '../../../steps/main-menu-steps';
import {SecurityStubs} from '../../../stubs/security-stubs.js';
import {RepositorySteps} from '../../../steps/repository-steps.js';

describe('User and Access', () => {

    const PASSWORD = 'password';
    const ROLE_USER = '#roleUser';
    const ROLE_REPO_MANAGER = '#roleRepoAdmin';
    const ROLE_CUSTOM_ADMIN = '#roleAdmin';
    const DEFAULT_ADMIN_PASSWORD = 'root';

    context('User and access management', () => {
        const user = 'user';
        let repoName;

        before(() => {
            repoName = 'user-access-repo1-' + Date.now();
            cy.createRepository({id: repoName});
        });

        after(() => {
            cy.loginAsAdmin().then(() => {
                cy.switchOffSecurity(true);
                cy.switchOffFreeAccess(false);
            });
            cy.deleteRepository(repoName, true);
        });

        beforeEach(() => {
            SecurityStubs.spyOnUserGet();
            UserAndAccessSteps.visit();
            // Users table should be visible
            UserAndAccessSteps.getUsersTable().should('be.visible');
            cy.switchOffSecurity(true);
        });

        afterEach(() => {
            cy.loginAsAdmin().then(() => {
                cy.deleteUser(user, true);
                cy.switchOffSecurity(true);
                cy.switchOffFreeAccess(false);
            });
        });

        context('Initial state', () => {
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
        });

        context('User creation', () => {
            it('Create user', () => {
                //create a normal read/write user
                createUser(user, PASSWORD, ROLE_USER, {readWrite: true});
                testForUser(user, false);
            });

            it('Create maintainer user', () => {
                createUser(user, PASSWORD, ROLE_USER, {maintain: true, repoName});
                testForUser(user, false);
            });

            it('Create repo-manager', () => {
                //create a repo-manager
                createUser(user, PASSWORD, ROLE_REPO_MANAGER);
                testForUser(user, false);
            });

            it('Create second admin', () => {
                //create a custom admin
                createUser(user, PASSWORD, ROLE_CUSTOM_ADMIN);
                testForUser(user, true);
            });

            it('Create user with custom role', () => {
                // When I create a read/write user
                UserAndAccessSteps.clickCreateNewUserButton();
                UserAndAccessSteps.typeUsername(user);
                UserAndAccessSteps.typePassword(PASSWORD);
                UserAndAccessSteps.typeConfirmPasswordField(PASSWORD);
                UserAndAccessSteps.selectRoleRadioButton(ROLE_USER);
                // And add a custom role of 1 letter
                UserAndAccessSteps.addTextToCustomRoleField('A');
                UserAndAccessSteps.toggleWriteAccessAny();

                // Then the 'create' button should be disabled
                UserAndAccessSteps.getConfirmUserCreateButton().should('be.disabled');
                // And the field should show an error
                UserAndAccessSteps.getCustomRoleFieldError().should('contain.text', 'Must be at least 2 symbols long');
                // When I add more text to the custom role tag
                UserAndAccessSteps.addTextToCustomRoleField('A{enter}');
                // Then the 'create' button should be enabled
                UserAndAccessSteps.getConfirmUserCreateButton().should('be.enabled');
                // And the field error should not exist
                UserAndAccessSteps.getCustomRoleFieldError().should('not.be.visible');

                // When I type an invalid tag
                UserAndAccessSteps.addTextToCustomRoleField('B{enter}');
                // And the field shows an error
                UserAndAccessSteps.getCustomRoleFieldError().should('contain.text', 'Must be at least 2 symbols long');
                // When I delete the invalid text
                UserAndAccessSteps.addTextToCustomRoleField('{backspace}');
                // Then the error should not be visible
                UserAndAccessSteps.getCustomRoleFieldError().should('not.be.visible');

                // When I create the user with a valid custom role
                SecurityStubs.spyOnUserCreate();
                UserAndAccessSteps.confirmUserCreate();
                // Then the user should be created with that custom role
                cy.wait('@create-user').its('request.body').then((body) => {
                    expect(body).to.deep.eq({
                        'password': 'password',
                        'grantedAuthorities': [
                            'ROLE_USER',
                            'CUSTOM_AA',
                            'WRITE_REPO_*',
                            'READ_REPO_*',
                        ],
                        'appSettings': {
                            'DEFAULT_VIS_GRAPH_SCHEMA': true,
                            'DEFAULT_INFERENCE': true,
                            'DEFAULT_SAMEAS': true,
                            'IGNORE_SHARED_QUERIES': false,
                            'EXECUTE_COUNT': true,
                        },
                    });
                });

                cy.url().should('include', '/users');
                UserAndAccessSteps.findUserInTable(user).should('be.visible');
                UserAndAccessSteps.getUserCustomRoles('@user')
                    .should('have.length', 1)
                    .eq(0).and('have.text', 'AA');
                // And when I open the edit page for that user, the custom role should be visible in the field without the prefix
                UserAndAccessSteps.openEditUserPage(user);
                cy.wait('@get-user');
                UserAndAccessSteps.getCustomRoleField().find('.tag-item span')
                    .should('have.length', 1)
                    .eq(0).and('have.text', 'AA');
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
                createUser(user, PASSWORD, ROLE_CUSTOM_ADMIN, {noPassword: true});
                UserAndAccessSteps.getUsersTable().should('be.visible');
                UserAndAccessSteps.getSplashLoader().should('not.be.visible');
            });

            // Skipped until image with GDB implementation is available
            it.skip('should create user with maintain repo permission for specific repo', () => {
                SecurityStubs.spyOnUserCreate();
                UserAndAccessSteps.getUsersCatalogContainer().should('be.visible');
                createUser(user, PASSWORD, ROLE_USER, {maintain: true, repoName: repoName});
                // Then the user should be created with that custom role
                cy.wait('@create-user').its('request.body').then((body) => {
                    expect(body).to.deep.eq({
                        'password': 'password',
                        'grantedAuthorities': [
                            'ROLE_USER',
                            `MAINTAIN_REPO_${repoName}`,
                            `WRITE_REPO_${repoName}`,
                            `READ_REPO_${repoName}`,
                        ],
                        'appSettings': {
                            'DEFAULT_VIS_GRAPH_SCHEMA': true,
                            'DEFAULT_INFERENCE': true,
                            'DEFAULT_SAMEAS': true,
                            'IGNORE_SHARED_QUERIES': false,
                            'EXECUTE_COUNT': true,
                        },
                    });
                });
                UserAndAccessSteps.getUsersCatalogContainer().should('be.visible');
                assertUserAuthsInCatalog(user, {repo: repoName, read: false, maintain: true, graphql: false});

                UserAndAccessSteps.openEditUserPage(user);
                cy.wait('@get-user');
                UserAndAccessSteps.getRepositoryRightsList().should('be.visible');
                verifyCheckedUserAuth(repoName, {read: true, write: true, maintain: true, graphql: false});
                verifyDisabledUserAuth(repoName, {read: true, write: true, maintain: false, graphql: true});
            });
        });

        context('Free access', () => {
            it('should toggle free access after Admin has logged in', () => {
                // Given I have available repositories to allow Free Access for
                RepositoriesStubs.stubRepositories();
                RepositoriesStubs.stubFreeAccess();
                // When I enable security
                UserAndAccessSteps.toggleSecurity();
                // When I log in as an Admin
                LoginSteps.loginWithUser('admin', DEFAULT_ADMIN_PASSWORD);
                // Then the page should load
                UserAndAccessSteps.getSplashLoader().should('not.be.visible');
                UserAndAccessSteps.getUsersTable().should('be.visible');
                // The Free Access toggle should be OFF
                UserAndAccessSteps.getFreeAccessSwitchInput().should('not.be.checked');
                // When I toggle Free Access ON
                UserAndAccessSteps.toggleFreeAccess();
                // And I allow free access to a repository
                ModalDialogSteps.getDialog().should('be.visible');
                // Then I click OK in the modal
                ModalDialogSteps.clickOKButton();
                // Then the toggle button should be ON
                UserAndAccessSteps.getFreeAccessSwitchInput().should('be.checked');
                // And I should see a success message
                ToasterSteps.verifySuccess('Free access has been enabled.');
                ToasterSteps.getToast().should('not.exist');
                UserAndAccessSteps.getUsersTable().should('be.visible');
                // When I toggle Free Access OFF
                UserAndAccessSteps.toggleFreeAccess();
                // Then I should see a success message
                ToasterSteps.getToast().should('exist');
                ToasterSteps.getToasterMessage().should('contain', 'Free access has been disabled.');
            });
        });

        context('Login / return URL redirects', () => {
            it('should not add the active repository to the login page URL', () => {
                cy.presetRepository(repoName);
                UserAndAccessSteps.visit();
                cy.url().should('include', `repositoryId=${repoName}`);

                UserAndAccessSteps.toggleSecurity();

                cy.url()
                    .should('include', '/login')
                    .and('not.include', 'repositoryId=');
            });

            it('should redirect to previous page after logout and then login', () => {
                UserAndAccessSteps.toggleSecurity();
                LoginSteps.loginWithUser('admin', DEFAULT_ADMIN_PASSWORD);
                MainMenuSteps.clickOnSparqlMenu();
                cy.get('h1').should('be.visible').should('contain', 'SPARQL Query & Update');
                cy.url().should('include', '/sparql');

                LoginSteps.logout();
                cy.url().should('include', '/login');
                LoginSteps.loginWithUser('admin', DEFAULT_ADMIN_PASSWORD);
                cy.url().should('include', '/sparql');
            });

            it('should redirect to correct return url when user is authenticated and on login page', () => {
                UserAndAccessSteps.visit();
                UserAndAccessSteps.toggleSecurity();
                LoginSteps.loginWithUser('admin', DEFAULT_ADMIN_PASSWORD);
                UserAndAccessSteps.getUsersTable().should('be.visible');

                cy.visit('/login?r=%252Fsparql');
                cy.reload();
                UserAndAccessSteps.getUrl().should('include', '/sparql');
            });
        });
    });

    context('Verify access states', () => {
        let repoName;

        before(() => {
            repoName = 'user-access-repo1-' + Date.now();
            cy.createRepository({id: repoName});
            cy.switchOffSecurity(true);
            SecurityStubs.spyOnUserGet();
        });

        beforeEach(() => {
            UserAndAccessSteps.visit();
            // Users table should be visible
            UserAndAccessSteps.getUsersTable().should('be.visible');
        });

        after(() => {
            cy.loginAsAdmin().then(() => {
                cy.deleteRepository(repoName, true);
                cy.switchOffFreeAccess(true);
                cy.switchOffSecurity(true);
            });
        });

        it('initial state', () => {
            UserAndAccessSteps.clickCreateNewUserButton();
            verifyCheckedUserAuth('*', {read: false, write: false, maintain: false, graphql: false});
            verifyDisabledUserAuth('*', {read: false, write: false, maintain: true, graphql: true});
            verifyCheckedUserAuth(repoName, {read: false, write: false, maintain: false, graphql: false});
            verifyDisabledUserAuth(repoName, {read: false, write: false, maintain: false, graphql: true});
            // The GraphQL checkbox is disabled for the lack of read/write rights, not because of the role
            UserAndAccessSteps.getGraphqlAnyRoleTooltip().should('not.exist');
        });

        context('for non user roles', () => {
            it('admin', () => {
                UserAndAccessSteps.clickCreateNewUserButton();
                UserAndAccessSteps.selectRoleRadioButton(ROLE_CUSTOM_ADMIN);
                verifyCheckedUserAuth('*', {read: true, write: true, maintain: true, graphql: false});
                verifyDisabledUserAuth('*', {read: true, write: true, maintain: true, graphql: true});

                UserAndAccessSteps.getRepositoryRightsRows().should('not.exist');
            });

            it('repository manager', () => {
                UserAndAccessSteps.clickCreateNewUserButton();
                UserAndAccessSteps.selectRoleRadioButton(ROLE_REPO_MANAGER);

                verifyCheckedUserAuth('*', {read: true, write: true, maintain: true, graphql: false});
                verifyDisabledUserAuth('*', {read: true, write: true, maintain: true, graphql: true});

                UserAndAccessSteps.getRepositoryRightsRows().should('not.exist');
            });
        });

        context('for specific repo', () => {
            it('read', () => {
                UserAndAccessSteps.clickCreateNewUserButton();
                setRoles({read: true, repoName});
                verifyCheckedUserAuth(repoName, {read: true, write: false, maintain: false, graphql: false});
                verifyDisabledUserAuth(repoName, {read: false, write: false, maintain: false, graphql: false});
            });

            it('write', () => {
                UserAndAccessSteps.clickCreateNewUserButton();
                setRoles({readWrite: true, repoName});
                verifyCheckedUserAuth(repoName, {read: true, write: true, maintain: false, graphql: false});
                verifyDisabledUserAuth(repoName, {read: true, write: false, maintain: false, graphql: false});
            });

            it('maintain', () => {
                UserAndAccessSteps.clickCreateNewUserButton();
                setRoles({maintain: true, repoName});
                verifyCheckedUserAuth(repoName, {read: true, write: true, maintain: true, graphql: false});
                verifyDisabledUserAuth(repoName, {read: true, write: true, maintain: false, graphql: true});
            });

            it('graphql with read', () => {
                UserAndAccessSteps.clickCreateNewUserButton();
                setRoles({read: true, graphql: true, repoName});
                verifyCheckedUserAuth(repoName, {read: true, write: false, maintain: false, graphql: true});
                verifyDisabledUserAuth(repoName, {read: false, write: false, maintain: false, graphql: false});
            });

            it('graphql with write', () => {
                UserAndAccessSteps.clickCreateNewUserButton();
                setRoles({readWrite: true, graphql: true, repoName});
                verifyCheckedUserAuth(repoName, {read: true, write: true, maintain: false, graphql: true});
                verifyDisabledUserAuth(repoName, {read: true, write: false, maintain: false, graphql: false});
            });
        });

        context('for any repo', () => {
            let anyRepo = '*';

            it('read', () => {
                UserAndAccessSteps.clickCreateNewUserButton();
                setRoles({read: true, anyRepo});
                verifyCheckedUserAuth(anyRepo, {read: true, write: false, maintain: false, graphql: false});
                verifyDisabledUserAuth(anyRepo, {read: false, write: false, maintain: true, graphql: false});

                verifyCheckedUserAuth(repoName, {read: true, write: false, maintain: false, graphql: false});
                verifyDisabledUserAuth(repoName, {read: true, write: false, maintain: false, graphql: false});
            });

            it('write', () => {
                UserAndAccessSteps.clickCreateNewUserButton();
                setRoles({readWrite: true, anyRepo});
                verifyCheckedUserAuth(anyRepo, {read: true, write: true, maintain: false, graphql: false});
                verifyDisabledUserAuth(anyRepo, {read: true, write: false, maintain: true, graphql: false});

                verifyCheckedUserAuth(repoName, {read: true, write: true, maintain: false, graphql: false});
                verifyDisabledUserAuth(repoName, {read: true, write: true, maintain: false, graphql: false});
            });

            it('graphql with read', () => {
                UserAndAccessSteps.clickCreateNewUserButton();
                setRoles({read: true, graphql: true, anyRepo});
                verifyCheckedUserAuth(anyRepo, {read: true, write: false, maintain: false, graphql: true});
                verifyDisabledUserAuth(anyRepo, {read: false, write: false, maintain: true, graphql: false});

                verifyCheckedUserAuth(repoName, {read: true, write: false, maintain: false, graphql: true});
                verifyDisabledUserAuth(repoName, {read: true, write: false, maintain: false, graphql: true});
            });

            it('graphql with write', () => {
                UserAndAccessSteps.clickCreateNewUserButton();
                setRoles({readWrite: true, graphql: true, anyRepo});
                verifyCheckedUserAuth(anyRepo, {read: true, write: true, maintain: false, graphql: true});
                verifyDisabledUserAuth(anyRepo, {read: true, write: false, maintain: true, graphql: false});

                verifyCheckedUserAuth(repoName, {read: true, write: true, maintain: false, graphql: true});
                verifyDisabledUserAuth(repoName, {read: true, write: true, maintain: false, graphql: true});
            });
        });
    });

    context('GraphQL access', () => {
        let repositoryId1;
        let repositoryId2;
        let repositoryId3;
        const graphqlUser = 'graphqlUser';

        beforeEach(() => {
            RepositoriesStubs.spyGetRepositories();
            repositoryId1 = 'user-access-repo1-' + Date.now();
            repositoryId2 = 'user-access-repo2-' + Date.now();
            repositoryId3 = 'user-access-repo3-' + Date.now();
            cy.createRepository({id: repositoryId1});
            cy.createRepository({id: repositoryId2});
            cy.createRepository({id: repositoryId3});
            cy.presetRepository(repositoryId1);
            UserAndAccessSteps.visit();
            // Users table should be visible
            UserAndAccessSteps.getUsersTable().should('be.visible');
            SecurityStubs.spyOnUserGet();
        });

        afterEach(() => {
            cy.loginAsAdmin().then(() => {
                cy.deleteRepository(repositoryId1, true);
                cy.deleteRepository(repositoryId2, true);
                cy.deleteRepository(repositoryId3, true);
                cy.deleteUser(graphqlUser, true);
                cy.switchOffFreeAccess(true);
                cy.switchOffSecurity(true);
            });

        });

        context('GraphQL checkbox behavior', () => {
            it('Create user with GraphQL-only access', () => {
                cy.wait('@getRepositories');
                createUser(graphqlUser, PASSWORD, ROLE_USER, {read: true, graphql: true, repoName: repositoryId2});
            });

            it('Should not allow GraphQL access for Ontop and FedX repositories', () => {
                // GIVEN Ontop and FedX repositories alongside a GraphDB one
                RepositoriesStubs.stubRepositories(0, '/repositories/get-repositories-with-unsupported-graphql-types.json');
                UserAndAccessSteps.visit();
                UserAndAccessSteps.clickCreateNewUserButton();
                // WHEN the user is granted read access to all of them
                UserAndAccessSteps.toggleReadAccessAny();

                // THEN GraphQL should be available only for the GraphDB repository
                UserAndAccessSteps.validateGraphqlAccessForRepo('graphdb-repo', {disabled: false});
                UserAndAccessSteps.getGraphqlRepositoryTypeTooltipForRepo('graphdb-repo').should('not.exist');

                // AND it should be permanently disabled for the Ontop and the FedX ones
                ['ontop-repo', 'fedx-repo'].forEach((repository) => {
                    UserAndAccessSteps.validateGraphqlAccessForRepo(repository, {checked: false, disabled: true});
                    UserAndAccessSteps.hoverGraphQlRightsCheckbox(repository)
                    UserAndAccessSteps.getAngularTooltip().should('have.text', 'Not available for this repository type');
                    UserAndAccessSteps.blurGraphQlRightsCheckbox(repository)
                });
            });

            // Fails for unknown reason only in CI
            it('Can create user with different auth combinations', () => {
                cy.wait('@getRepositories');
                cy.wait('@getRepositories');
                UserAndAccessSteps.getUsersCatalogContainer().should('be.visible');
                // WHEN I create a user with read + GraphQL for repository #2
                createUser(graphqlUser, PASSWORD, ROLE_USER, {read: true, graphql: true, repoName: repositoryId2});
                // THEN the user should have read + GraphQL on that repo
                assertUserAuthsInCatalog(graphqlUser, {repo: repositoryId2, read: true, graphql: true});
                // WHEN I open the edit page for that user
                UserAndAccessSteps.openEditUserPage(graphqlUser);
                cy.wait('@get-user');
                // THEN for repository #1, the GraphQL checkbox should be disabled initially
                UserAndAccessSteps.validateGraphqlAccessForRepo(repositoryId1, {disabled: true});
                // WHEN I enable "read" for repository #1
                setUserAuths({repo: repositoryId1, read: true});
                // THEN GraphQL for repository #1 should become enabled
                UserAndAccessSteps.validateGraphqlAccessForRepo(repositoryId1, {disabled: false});
                // WHEN I enable GraphQL with read
                setUserAuths({repo: repositoryId1, graphql: true});
                // THEN GraphQL should be checked and enabled
                UserAndAccessSteps.validateGraphqlAccessForRepo(repositoryId1, {checked: true, disabled: false});
                // THEN for repository #3, GraphQL should be disabled initially
                UserAndAccessSteps.validateGraphqlAccessForRepo(repositoryId3, {disabled: true});
                // WHEN I enable "write" for repository #3
                setUserAuths({repo: repositoryId3, write: true});
                // THEN GraphQL for repository #3 should become enabled
                UserAndAccessSteps.validateGraphqlAccessForRepo(repositoryId3, {disabled: false});
                // And I expect "read" to be checked and disabled
                UserAndAccessSteps.validateReadAccessForRepo(repositoryId3, {checked: true, disabled: true});
                // I enable GraphQL for repository #3
                setUserAuths({repo: repositoryId3, graphql: true});
                // THEN GraphQL should be checked and enabled
                UserAndAccessSteps.validateGraphqlAccessForRepo(repositoryId1, {checked: true, disabled: false});
                // When I remove "read" for repository #2
                UserAndAccessSteps.toggleReadAccessForRepo(repositoryId2);
                // THEN I expect "graphql" to be unchecked and disabled for repository #2
                UserAndAccessSteps.validateGraphqlAccessForRepo(repositoryId2, {checked: false, disabled: true});

                // WHEN I confirm the user edit
                UserAndAccessSteps.confirmUserEdit();
                // THEN verify the final rights:
                //  - repo #1 has no read/write/graphql
                //  - repo #2 has read + graphql
                //  - repo #3 has write + graphql (and read was auto-checked but disabled)
                assertUserAuthsInCatalog(graphqlUser, {repo: repositoryId1, read: true, write: false, graphql: true});
                assertUserAuthsInCatalog(graphqlUser, {repo: repositoryId2, read: false, write: false, graphql: false});
                assertUserAuthsInCatalog(graphqlUser, {repo: repositoryId3, read: false, write: true, graphql: true});
            });
        });

        context('Menu navigation based on permissions', () => {
            it('Should have access to 5 pages when have graphql only rights', () => {
                cy.wait('@getRepositories');
                cy.wait('@getRepositories');
                // WHEN I create a user with read + GraphQL for repository #2
                createUser(graphqlUser, PASSWORD, ROLE_USER, {readWrite: true, graphql: true, repoName: repositoryId1});
                //enable security
                UserAndAccessSteps.toggleSecurity();
                //login new user
                LoginSteps.loginWithUser(graphqlUser, PASSWORD);
                cy.wait('@getRepositories');
                cy.wait('@getRepositories');

                MENU_ITEMS_WITHOUT_GRAPHQL.forEach(({path, expectedUrl, checks, expectedTitle}) => {
                    navigateMenuPath(path, expectedUrl, expectedTitle);

                    if (checks) {
                        runChecks(checks);
                    }
                    navigateMenuPath(['Import'], '/import', 'Import');
                });
            });

            it('Should not have access endpoints management when have read graphql only rights', () => {
                cy.wait('@getRepositories');
                cy.wait('@getRepositories');
                // WHEN I create a user with read + GraphQL for repository #2
                createUser(graphqlUser, PASSWORD, ROLE_USER, {read: true, graphql: true, repoName: repositoryId1});
                //enable security
                UserAndAccessSteps.toggleSecurity();
                //login new user
                LoginSteps.loginWithUser(graphqlUser, PASSWORD);
                cy.wait('@getRepositories');
                cy.wait('@getRepositories');
                // RepositorySelectorSteps.selectRepository(repositoryId1);

                GRAPHQL_READ_MENU_ITEMS.forEach(({path, expectedUrl, checks, expectedTitle}) => {
                    navigateMenuPath(path, expectedUrl, expectedTitle);
                    if (checks) {
                        runChecks(checks);
                    }
                    navigateMenuPath(['Import'], '/import', 'Import');
                });
            });

            it('Should have all access to endpoints management when have REPO_MANAGER role', () => {
                cy.wait('@getRepositories');
                cy.wait('@getRepositories');
                createUser(graphqlUser, PASSWORD, ROLE_REPO_MANAGER);
                //enable security
                UserAndAccessSteps.toggleSecurity();
                HomeSteps.visitAndWaitLoader();
                //login new user
                LoginSteps.loginWithUser(graphqlUser, PASSWORD);
                cy.wait('@getRepositories');
                cy.wait('@getRepositories');
                GRAPHQL_REPO_MANAGER_MENU_ITEMS.forEach(({path, expectedUrl, checks, expectedTitle}) => {
                    navigateMenuPath(path, expectedUrl, expectedTitle);
                    if (checks) {
                        runChecks(checks);
                    }
                    navigateMenuPath(['Import'], '/import', 'Import');
                });
            });

            it('Can have Free Access and GraphQL working together', () => {
                cy.wait('@getRepositories');
                cy.wait('@getRepositories');
                //enable security
                UserAndAccessSteps.toggleSecurity();
                //login with the admin
                LoginSteps.loginWithUser('admin', DEFAULT_ADMIN_PASSWORD);
                cy.wait('@getRepositories');
                cy.wait('@getRepositories');
                // The Free Access toggle should be OFF
                UserAndAccessSteps.getFreeAccessSwitchInput().should('not.be.checked');
                // When I toggle Free Access ON
                UserAndAccessSteps.toggleFreeAccess();
                // Then I set repo auths
                UserAndAccessSteps.clickFreeReadAccessRepo(repositoryId1);
                UserAndAccessSteps.clickFreeWriteAccessRepo(repositoryId2);
                UserAndAccessSteps.clickFreeWriteAccessRepo(repositoryId3);
                UserAndAccessSteps.clickFreeGraphqlAccessRepo(repositoryId3);
                // Then I click OK in the modal
                ModalDialogSteps.clickOKButton();
                // Then the toggle button should be ON
                UserAndAccessSteps.getFreeAccessSwitchInput().should('be.checked');
                // And I should see a success message
                ToasterSteps.verifySuccess('Free access has been enabled.');
                UserAndAccessSteps.getUsersTable().should('be.visible');

                // Then I logout
                LoginSteps.logout();
                HomeSteps.visit();
                //  I change the repository to this with GraphQL only rights
                RepositorySelectorSteps.selectRepository(repositoryId3);
                // Then I should have GraphQL only rights
                FREE_ACCESS_MENU_ITEMS_WITHOUT_GRAPHQL.forEach(({path, expectedUrl, checks, expectedTitle}) => {
                    navigateMenuPath(path, expectedUrl, expectedTitle);
                    if (checks) {
                        runChecks(checks);
                    }
                    navigateMenuPath(['Import'], '/import', 'Import');
                });
            });
        });
    });

    context('User with maintain permission', () => {
        let withoutPermissionRepositoryId;
        let readRepositoryId;
        let writeRepositoryId;
        let graphQLOnlyRepositoryId;
        let maintainedRepositoryId;
        const maintainerUser = 'maintainerUser';

        beforeEach(() => {
            RepositoriesStubs.spyGetRepositories();
            readRepositoryId = 'readRepositoryId-' + Date.now();
            writeRepositoryId = 'writeRepositoryId-' + Date.now();
            graphQLOnlyRepositoryId = 'graphQLOnlyRepositoryId-' + Date.now();
            maintainedRepositoryId = 'maintainedRepositoryId-' + Date.now();
            withoutPermissionRepositoryId = 'withoutPermissionRepositoryId-' + Date.now();
            cy.createRepository({id: readRepositoryId});
            cy.createRepository({id: writeRepositoryId});
            cy.createRepository({id: graphQLOnlyRepositoryId});
            cy.createRepository({id: maintainedRepositoryId});
            cy.createRepository({id: withoutPermissionRepositoryId});
            UserAndAccessSteps.visit();
            // Users table should be visible
            UserAndAccessSteps.getUsersTable().should('be.visible');
            SecurityStubs.spyOnUserGet();
        });

        afterEach(() => {
            cy.loginAsAdmin().then(() => {
                cy.deleteRepository(readRepositoryId, true);
                cy.deleteRepository(writeRepositoryId, true);
                cy.deleteRepository(graphQLOnlyRepositoryId, true);
                cy.deleteRepository(maintainedRepositoryId, true);
                cy.deleteRepository(withoutPermissionRepositoryId, true);
                cy.deleteUser(maintainerUser, true);
                cy.switchOffFreeAccess(true);
                cy.switchOffSecurity(true);
            });
        });

        it('should list all repositories for which a user with maintain permission has at least read permission', () => {
            // Given there are five repositories.
            // And there is a user with permissions for four of them:
            // 1. Maintain permission for one repository.
            createUser(maintainerUser, PASSWORD, ROLE_USER, {maintain: true, repoName: maintainedRepositoryId});
            // 2. Read permission for one repository.
            UserAndAccessSteps.openEditUserPage(maintainerUser);
            cy.wait('@get-user');
            setUserAuths({repo: readRepositoryId, read: true});
            // 3. Write permission for one repository.
            setUserAuths({repo: writeRepositoryId, write: true});
            // 4. GraphQL-only permission for one repository.
            setUserAuths({repo: graphQLOnlyRepositoryId, write: true, graphql: true});
            UserAndAccessSteps.confirmUserEdit();

            // When I log in as a user with repository maintain permission.
            UserAndAccessSteps.toggleSecurity();
            LoginSteps.loginWithUser(maintainerUser, PASSWORD);
            // And navigate to the repository list view.
            RepositorySteps.visit(false);

            // Then I should see all repositories for which the user has at least read permission.
            RepositorySteps.getRepositories().should('have.length', 4);

            // And I should see the actions allowed for the repository the user can maintain.
            RepositorySteps.getCopyRepositoryButton(maintainedRepositoryId).should('be.visible');
            RepositorySteps.getEditRepositoryButton(maintainedRepositoryId).should('be.visible');
            RepositorySteps.getDownloadRepositoryConfigurationButton(maintainedRepositoryId).should('be.visible');
            RepositorySteps.getRestartRepositoryButton(maintainedRepositoryId).should('be.visible');

            // And the delete button should not be available because users with maintain permission
            // are not allowed to delete repositories.
            RepositorySteps.getDeleteRepositoryButton(maintainedRepositoryId).should('not.exist');

            // And the "Set as default repository" button should not be available because users
            // with maintain permission are not allowed to set the default repository.
            RepositorySteps.getSetDefaultRepositoryButton(maintainedRepositoryId).should('not.exist');

            // And should see the copy action for all repositories.
            RepositorySteps.getCopyRepositoryButton(writeRepositoryId).should('be.visible');
            RepositorySteps.getCopyRepositoryButton(readRepositoryId).should('be.visible');
            RepositorySteps.getCopyRepositoryButton(graphQLOnlyRepositoryId).should('be.visible');

            // And no repository management actions should be available for the other repositories.
            RepositorySteps.getEditRepositoryButton(readRepositoryId).should('not.exist');
            RepositorySteps.getDownloadRepositoryConfigurationButton(readRepositoryId).should('not.exist');
            RepositorySteps.getRestartRepositoryButton(readRepositoryId).should('not.exist');
            RepositorySteps.getDeleteRepositoryButton(readRepositoryId).should('not.exist');
            RepositorySteps.getSetDefaultRepositoryButton(readRepositoryId).should('not.exist');

            RepositorySteps.getEditRepositoryButton(writeRepositoryId).should('not.exist');
            RepositorySteps.getDownloadRepositoryConfigurationButton(writeRepositoryId).should('not.exist');
            RepositorySteps.getRestartRepositoryButton(writeRepositoryId).should('not.exist');
            RepositorySteps.getDeleteRepositoryButton(writeRepositoryId).should('not.exist');
            RepositorySteps.getSetDefaultRepositoryButton(writeRepositoryId).should('not.exist');

            RepositorySteps.getEditRepositoryButton(graphQLOnlyRepositoryId).should('not.exist');
            RepositorySteps.getDownloadRepositoryConfigurationButton(graphQLOnlyRepositoryId).should('not.exist');
            RepositorySteps.getRestartRepositoryButton(graphQLOnlyRepositoryId).should('not.exist');
            RepositorySteps.getDeleteRepositoryButton(graphQLOnlyRepositoryId).should('not.exist');
            RepositorySteps.getSetDefaultRepositoryButton(graphQLOnlyRepositoryId).should('not.exist');

            // And the "Create", "Create from file", and "Attach remote repository" page buttons
            // should not be available to a user with maintain permission.
            RepositorySteps.getPageButtons().should('not.exist');

            // When I select a repository for which I have GraphQL-only permission.
            RepositorySelectorSteps.selectRepository(graphQLOnlyRepositoryId);

            // Then I should still see all repositories for which the user has at least read permission.
            RepositorySteps.getRepositories().should('have.length', 4);
        });

        it('should not allow a user with maintain permission to rename a repository', () => {
            // Given there is a user with maintain permission for a repository.
            createUser(maintainerUser, PASSWORD, ROLE_USER, {maintain: true, repoName: maintainedRepositoryId});
            UserAndAccessSteps.toggleSecurity();
            LoginSteps.loginWithUser(maintainerUser, PASSWORD);
            RepositorySteps.visit(false);

            // When the user opens the edit page of the repository they can maintain.
            RepositorySteps.getEditRepositoryButton(maintainedRepositoryId).should('be.visible');
            RepositorySteps.editRepository(maintainedRepositoryId);

            // Then the repository id should be rendered as read only.
            RepositorySteps.getGDBIdInput()
                .should('have.value', maintainedRepositoryId)
                .and('be.disabled');

            // And the action which unlocks the repository id field should not be available, because renaming
            // a repository is allowed only for administrators and repository managers.
            RepositorySteps.getRepositoryIdEditElement().should('not.exist');

            // But the rest of the repository configuration should still be editable.
            RepositorySteps.typeRepositoryTitle('Renaming is not allowed');
            RepositorySteps.getSaveRepositoryButton().click();
            ModalDialogSteps.clickOKButton();

            // And the repository should keep its original id after the configuration is saved.
            RepositorySteps.getRepositoryFromList(maintainedRepositoryId).should('be.visible');
            RepositorySteps.getEditRepositoryButton(maintainedRepositoryId).should('be.visible');
        });
    });

    function createUser(username, password, role, opts = {}) {
        UserAndAccessSteps.clickCreateNewUserButton();
        cy.url().should('include', '/user/create');
        UserAndAccessSteps.getUsernameField().should('be.visible').and('be.enabled').and('not.be.disabled');
        UserAndAccessSteps.typeUsername(username);
        UserAndAccessSteps.typePassword(password);
        UserAndAccessSteps.typeConfirmPasswordField(password);
        UserAndAccessSteps.selectRoleRadioButton(role);
        UserAndAccessSteps.getRoleRadioButton(role).should('be.checked');

        if (role === '#roleUser') {
            setRoles(opts);
        }

        if (role === ROLE_CUSTOM_ADMIN && opts.noPassword) {
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
        const {read = false, readWrite = false, graphql = false, maintain = false, repoName = '*'} = opts;
        setUserAuths({repo: repoName, read, write: readWrite, graphql, maintain});
    }

    function testForUser(name, isAdmin) {
        //enable security
        UserAndAccessSteps.toggleSecurity();
        LoginSteps.visitLoginPageWithReturnUrl('/users');
        //login new user
        LoginSteps.loginWithUser(name, PASSWORD);
        //verify permissions
        UserAndAccessSteps.getUrl().should('include', '/users');
        if (isAdmin) {
            UserAndAccessSteps.getUsersTable().should('be.visible');
        } else {
            UserAndAccessSteps.getPermissionError().should('contain',
                'You have no permission to access this functionality with your current credentials.');
        }
    }

    function assertUserAuthsInCatalog(username, {repo, read = false, write = false, maintain = false, graphql = false} = {}) {
        UserAndAccessSteps.findUserRowAlias(username, 'userRow');

        if (!read && !write && !maintain) {
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

        if (maintain) {
            UserAndAccessSteps.findMaintainIconAlias('@repoLine').should('be.visible');
        } else {
            UserAndAccessSteps.findMaintainIconAlias('@repoLine').should('not.exist');
        }

        if (graphql) {
            UserAndAccessSteps.findGraphqlIconAlias('@repoLine').should('exist');
        } else {
            UserAndAccessSteps.findGraphqlIconAlias('@repoLine').should('not.exist');
        }
    }

    function setUserAuths({repo, read = false, write = false, graphql = false, maintain = false} = {}) {
        if (read === true) {
            UserAndAccessSteps.toggleReadAccessForRepo(repo);
            UserAndAccessSteps.validateReadAccessForRepo(repo, {checked: read});
        }

        if (write === true) {
            UserAndAccessSteps.toggleWriteAccessForRepo(repo);
            UserAndAccessSteps.validateWriteAccessForRepo(repo, {checked: write});
        }

        if (graphql === true) {
            UserAndAccessSteps.toggleGraphqlAccessForRepo(repo);
            UserAndAccessSteps.validateGraphqlAccessForRepo(repo, {checked: graphql});
        }

        if (maintain === true) {
            UserAndAccessSteps.toggleMaintainRepoForRepo(repo);
            UserAndAccessSteps.validateMaintainAccessForRepo(repo, {checked: maintain});
        }
    }

    function verifyCheckedUserAuth(repo, {read = false, write = false, graphql = false, maintain = false} = {}) {
        UserAndAccessSteps.validateReadAccessForRepo(repo, {checked: read});
        UserAndAccessSteps.validateWriteAccessForRepo(repo, {checked: write});
        UserAndAccessSteps.validateGraphqlAccessForRepo(repo, {checked: graphql});
        UserAndAccessSteps.validateMaintainAccessForRepo(repo, {checked: maintain});
    }

    function verifyDisabledUserAuth(repo, {read = false, write = false, graphql = false, maintain = false} = {}) {
        UserAndAccessSteps.validateReadAccessForRepo(repo, {disabled: read});
        UserAndAccessSteps.validateWriteAccessForRepo(repo, {disabled: write});
        UserAndAccessSteps.validateGraphqlAccessForRepo(repo, {disabled: graphql});
        UserAndAccessSteps.validateMaintainAccessForRepo(repo, {disabled: maintain});
    }

    function navigateMenuPath(pathArray, expectedUrl, expectedTitle) {
        pathArray.forEach((label, index) => {
            if (index === 0) {
                MainMenuSteps.clickOnMenu(label);
                if (pathArray.length > 1) {
                    MainMenuSteps.getSubmenuFor(label).scrollIntoView().should('be.visible');
                }
            } else {
                MainMenuSteps.clickOnSubMenu(label);
            }
            if (index === pathArray.length - 1) {
                // wait for the page label on the last navigation step to be visible before moving on
                const title = expectedTitle ? expectedTitle : label;
                cy.get('h1').should('be.visible').should('contain', title);
            }
        });

        if (expectedUrl) {
            cy.url().should('include', expectedUrl);
        }
    }

    function runChecks(checks = {}) {
        Object.entries(checks).forEach(([selector, assertions]) => {
            // eslint-disable-next-line cypress/no-assigning-return-values
            let chain = cy.get(selector);

            // assertions is an array, e.g. ["exist", ["contain.text", "Hello"], "be.visible"]
            assertions.forEach((assertion, index) => {
                if (index === 0) {
                    // First assertion = .should(...)
                    if (Array.isArray(assertion)) {
                        // e.g. ["contain.text", "Hello"]
                        chain = chain.should(...assertion);
                    } else {
                        // e.g. "exist"
                        chain = chain.should(assertion);
                    }
                } else {
                    // Subsequent assertions = .and(...)
                    if (Array.isArray(assertion)) {
                        chain = chain.and(...assertion);
                    } else {
                        chain = chain.and(assertion);
                    }
                }
            });
        });
    }

    const noAuthChecks = {
        '.no-authority-panel .alert-warning': [
            'be.visible',
            ['contains.text', 'Some functionalities are not available because'],
            ['contains.text', 'you do not have the required repository permissions.'],
        ],
    };

    const hasAuthChecks = {
        '.no-authority-panel .alert-warning': [
            'not.exist',
        ],
    };

    const MENU_ITEMS_WITHOUT_GRAPHQL = [
        // Import
        {
            path: ['Import'],
            expectedUrl: '/import',
            checks: noAuthChecks,
        },

        // Explore
        {
            path: ['Explore', 'Graphs overview'],
            expectedUrl: '/graphs',
            checks: noAuthChecks,
        },
        {
            path: ['Explore', 'Class hierarchy'],
            expectedUrl: '/hierarchy',
            checks: noAuthChecks,
        },
        {
            path: ['Explore', 'Class relationships'],
            expectedUrl: '/relationships',
            checks: noAuthChecks,
        },
        {
            path: ['Explore', 'Visual graph'],
            expectedUrl: '/graphs-visualizations',
            checks: noAuthChecks,
        },
        {
            path: ['Explore', 'Similarity'],
            expectedTitle: 'Similarity indexes',
            expectedUrl: '/similarity',
            checks: noAuthChecks,
        },

        // SPARQL
        {
            path: ['SPARQL'],
            expectedTitle: 'SPARQL Query & Update',
            expectedUrl: '/sparql',
            checks: noAuthChecks,
        },

        // TTYG
        {
            path: ['Talk to Your Graph'],
            expectedUrl: '/ttyg',
            checks: noAuthChecks,
        },

        // GraphQL

        // Monitor
        {
            path: ['Monitor', 'Queries and Updates'],
            expectedUrl: '/monitor/queries',
            expectedTitle: 'Query and Update monitoring',
            checks: noAuthChecks,
        },

        // Setup
        {
            path: ['Setup', 'My Settings'],
            expectedUrl: '/settings',
            expectedTitle: 'Settings',
            checks: hasAuthChecks,
        },
        {
            path: ['Setup', 'Connectors'],
            expectedUrl: '/connectors',
            expectedTitle: 'Connector management',
            checks: noAuthChecks,
        },
        {
            path: ['Setup', 'Cluster'],
            expectedUrl: '/cluster',
            expectedTitle: 'Cluster management',
            checks: hasAuthChecks,
        },
        {
            path: ['Setup', 'Plugins'],
            expectedUrl: '/plugins',
            checks: noAuthChecks,
        },
        {
            path: ['Setup', 'Namespaces'],
            expectedUrl: '/namespaces',
            checks: noAuthChecks,
        },
        {
            path: ['Setup', 'Autocomplete'],
            expectedUrl: '/autocomplete',
            expectedTitle: 'Autocomplete index',
            checks: noAuthChecks,
        },
        {
            path: ['Setup', 'RDF Rank'],
            expectedUrl: '/rdfrank',
            checks: noAuthChecks,
        },
        {
            path: ['Setup', 'JDBC'],
            expectedUrl: '/jdbc',
            expectedTitle: 'JDBC configuration',
            checks: noAuthChecks,
        },
        {
            path: ['Setup', 'SPARQL Templates'],
            expectedUrl: '/sparql-templates',
            checks: noAuthChecks,
        },

        // Help
        {
            path: ['Help', 'REST API'],
            expectedUrl: '/webapi',
            expectedTitle: 'REST API documentation',
            checks: hasAuthChecks,
        },
    ];

    const GRAPHQL_READ_MENU_ITEMS = [
        {
            path: ['GraphQL', 'GraphQL Playground'],
            expectedUrl: '/graphql/playground',
            checks: hasAuthChecks,
        },
    ];
    const GRAPHQL_REPO_MANAGER_MENU_ITEMS = [
        {
            path: ['GraphQL', 'Endpoint Management'],
            expectedUrl: '/graphql/endpoints',
            checks: hasAuthChecks,
        },
        {
            path: ['GraphQL', 'GraphQL Playground'],
            expectedUrl: '/graphql/playground',
            checks: hasAuthChecks,
        },
        {
            path: ['Monitor', 'Backup and Restore'],
            expectedUrl: '/monitor/backup-and-restore',
            checks: hasAuthChecks,
        },
        {
            path: ['Help', 'Interactive guides'],
            expectedUrl: '/guides',
            checks: hasAuthChecks,
        },
    ];

    const FREE_ACCESS_MENU_ITEMS_WITHOUT_GRAPHQL = [
        // Import
        {
            path: ['Import'],
            expectedUrl: '/import',
            checks: noAuthChecks,
        },

        // Explore
        {
            path: ['Explore', 'Graphs overview'],
            expectedUrl: '/graphs',
            checks: noAuthChecks,
        },
        {
            path: ['Explore', 'Class hierarchy'],
            expectedUrl: '/hierarchy',
            checks: noAuthChecks,
        },
        {
            path: ['Explore', 'Class relationships'],
            expectedUrl: '/relationships',
            checks: noAuthChecks,
        },
        {
            path: ['Explore', 'Visual graph'],
            expectedUrl: '/graphs-visualizations',
            checks: noAuthChecks,
        },
        {
            path: ['Explore', 'Similarity'],
            expectedTitle: 'Similarity indexes',
            expectedUrl: '/similarity',
            checks: noAuthChecks,
        },

        // SPARQL
        {
            path: ['SPARQL'],
            expectedTitle: 'SPARQL Query & Update',
            expectedUrl: '/sparql',
            checks: noAuthChecks,
        },

        // Setup
        {
            path: ['Setup', 'Connectors'],
            expectedUrl: '/connectors',
            expectedTitle: 'Connector management',
            checks: noAuthChecks,
        },
        {
            path: ['Setup', 'Plugins'],
            expectedUrl: '/plugins',
            checks: noAuthChecks,
        },
        {
            path: ['Setup', 'Namespaces'],
            expectedUrl: '/namespaces',
            checks: noAuthChecks,
        },
        {
            path: ['Setup', 'Autocomplete'],
            expectedUrl: '/autocomplete',
            expectedTitle: 'Autocomplete index',
            checks: noAuthChecks,
        },
        {
            path: ['Setup', 'RDF Rank'],
            expectedUrl: '/rdfrank',
            checks: noAuthChecks,
        },
        {
            path: ['Setup', 'JDBC'],
            expectedUrl: '/jdbc',
            expectedTitle: 'JDBC configuration',
            checks: noAuthChecks,
        },
        {
            path: ['Setup', 'SPARQL Templates'],
            expectedUrl: '/sparql-templates',
            checks: noAuthChecks,
        },
    ];
});
