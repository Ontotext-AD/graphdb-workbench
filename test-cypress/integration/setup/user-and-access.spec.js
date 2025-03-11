import {UserAndAccessSteps} from "../../steps/setup/user-and-access-steps";
import {RepositoriesStubs} from "../../stubs/repositories/repositories-stubs";
import {RepositorySelectorSteps} from "../../steps/repository-selector-steps";
import {ModalDialogSteps} from "../../steps/modal-dialog-steps";
import {ToasterSteps} from "../../steps/toaster-steps";
import HomeSteps from "../../steps/home-steps";
import {LoginSteps} from "../../steps/login-steps";


describe('User and Access', () => {

    const PASSWORD = "password";
    const ROLE_USER = "#roleUser";
    const ROLE_REPO_MANAGER = "#roleRepoAdmin";
    const ROLE_CUSTOM_ADMIN = "#roleAdmin";
    const DEFAULT_ADMIN_PASSWORD = "root";

    context('', () => {
        const user = "user";

        beforeEach(() => {
            UserAndAccessSteps.visit();
            cy.window();
            // Users table should be visible
            UserAndAccessSteps.getUsersTable().should('be.visible');
        });

        afterEach(() => {
            cy.loginAsAdmin().then(()=> {
                cy.deleteUser(user, true);
                cy.switchOffSecurity(true);
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
            //create a normal read/write user
            createUser(user, PASSWORD, ROLE_USER, {readWrite: true});
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
            clickWriteAccessForRepo('*');

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
            createUser(user, PASSWORD, ROLE_CUSTOM_ADMIN, {noPassword: true});
            UserAndAccessSteps.getUsersTable().should('be.visible');
            UserAndAccessSteps.getSplashLoader().should('not.be.visible');
        });
    })

    context('GraphQL only', () => {
        let repositoryId1;
        let repositoryId2;
        let repositoryId3;
        const graphqlUser = 'graphqlUser';

        beforeEach(() => {
            cy.viewport(1280, 1000);
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
        });

        afterEach(() => {
            cy.loginAsAdmin().then(() => {
                cy.deleteRepository(repositoryId1, true);
                cy.deleteRepository(repositoryId2, true);
                cy.deleteRepository(repositoryId3, true);
                cy.deleteUser(graphqlUser, true);
                cy.switchOffSecurity(true);
            });

        });

        it('Create user with GraphQL-only access', () => {
            cy.wait('@getRepositories');
            createUser(graphqlUser, PASSWORD, ROLE_USER, {read: true, graphql: true, repoName: repositoryId2});
        });

        it('Can create user with different auth combinations', () => {
            cy.wait('@getRepositories');
            // WHEN I create a user with read + GraphQL for repository #2
            createUser(graphqlUser, PASSWORD, ROLE_USER, {read: true, graphql: true, repoName: repositoryId2});
            // THEN the user should have read + GraphQL on that repo
            assertUserAuths(graphqlUser, {repo: repositoryId2, read: true, graphql: true});
            // WHEN I open the edit page for that user
            UserAndAccessSteps.openEditUserPage(graphqlUser);
            // THEN for repository #1, the GraphQL checkbox should be disabled initially
            UserAndAccessSteps.getGraphqlAccessForRepo(repositoryId1).should('be.disabled');
            // WHEN I enable "read" for repository #1
            editUserAuths({repo: repositoryId1, read: true});
            // THEN GraphQL for repository #1 should become enabled
            UserAndAccessSteps.getGraphqlAccessForRepo(repositoryId1).should('be.enabled');
            // WHEN I enable GraphQL and read
            editUserAuths({repo: repositoryId1, graphql: true});
            editUserAuths({repo: repositoryId1, read: true});
            // THEN GraphQL should be checked and disabled
            UserAndAccessSteps.getGraphqlAccessForRepo(repositoryId1).should('be.checked').and('be.disabled');
            // THEN for repository #3, GraphQL should be disabled initially
            UserAndAccessSteps.getGraphqlAccessForRepo(repositoryId3).should('be.disabled');
            // WHEN I enable "write" for repository #3
            editUserAuths({repo: repositoryId3, write: true});
            // THEN GraphQL for repository #3 should become enabled
            UserAndAccessSteps.getGraphqlAccessForRepo(repositoryId3).should('be.enabled');
            // And I expect "read" to be checked and disabled
            UserAndAccessSteps.getReadAccessForRepo(repositoryId3).should('be.checked').and('be.disabled');
            // I enable GraphQL for repository #3
            editUserAuths({repo: repositoryId3, graphql: true});

            // WHEN I confirm the user edit
            UserAndAccessSteps.confirmUserEdit();
            // THEN verify the final rights:
            //  - repo #1 has no read/write/graphql
            //  - repo #2 has read + graphql
            //  - repo #3 has write + graphql (and read was auto-checked but disabled)
            assertUserAuths(graphqlUser, {repo: repositoryId1, read: false, write: false, graphql: false});
            assertUserAuths(graphqlUser, {repo: repositoryId2, read: true, write: false, graphql: true});
            assertUserAuths(graphqlUser, {repo: repositoryId3, read: false, write: true, graphql: true});
        });

        it('Should have access to 5 pages when have graphql only rights', () => {
            cy.wait('@getRepositories');
            // WHEN I create a user with read + GraphQL for repository #2
            createUser(graphqlUser, PASSWORD, ROLE_USER, {readWrite: true, graphql: true, repoName: repositoryId1});
            //enable security
            UserAndAccessSteps.toggleSecurity();
            //login new user
            LoginSteps.loginWithUser(graphqlUser, PASSWORD);
            RepositorySelectorSteps.selectRepository(repositoryId1);

            MENU_ITEMS_WITHOUT_GRAPHQL.forEach(({path, expectedUrl, checks, expectedTitle}) => {
                navigateMenuPath(path, expectedUrl, expectedTitle);
                if (checks) {
                    runChecks(checks);
                }
            });
        });

        it('Should not have access endpoints management when have read graphql only rights', () => {
            cy.wait('@getRepositories');
            // WHEN I create a user with read + GraphQL for repository #2
            createUser(graphqlUser, PASSWORD, ROLE_USER, {read: true, graphql: true, repoName: repositoryId1});
            //enable security
            UserAndAccessSteps.toggleSecurity();
            //login new user
            LoginSteps.loginWithUser(graphqlUser, PASSWORD);
            RepositorySelectorSteps.selectRepository(repositoryId1);

            GRAPHQL_READ_MENU_ITEMS.forEach(({path, expectedUrl, checks, expectedTitle}) => {
                navigateMenuPath(path, expectedUrl, expectedTitle);
                if (checks) {
                    runChecks(checks);
                }
            });
        });

        it('Should have all access to endpoints management when have REPO_MANAGER role', () => {
            cy.wait('@getRepositories');
            createUser(graphqlUser, PASSWORD, ROLE_REPO_MANAGER);
            //enable security
            UserAndAccessSteps.toggleSecurity();
            HomeSteps.visit();
            //login new user
            LoginSteps.loginWithUser(graphqlUser, PASSWORD);
            GRAPHQL_REPO_MANAGER_MENU_ITEMS.forEach(({path, expectedUrl, checks, expectedTitle}) => {
                navigateMenuPath(path, expectedUrl, expectedTitle);
                if (checks) {
                    runChecks(checks);
                }
            });
        });
    });

    context('GraphQL only and Free Access', () => {
        let repositoryId1;
        let repositoryId2;
        let repositoryId3;
        const graphqlUser = 'graphqlUser';

        beforeEach(() => {
            cy.viewport(1280, 1000);
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
        });

        afterEach(() => {
            cy.loginAsAdmin().then(()=> {
                cy.deleteRepository(repositoryId1, true);
                cy.deleteRepository(repositoryId2, true);
                cy.deleteRepository(repositoryId3, true);
                cy.deleteUser(graphqlUser, true);
                cy.switchOffFreeAccess(true);
                cy.switchOffSecurity(true);
            });

        });

        it('Can have Free Access and GraphQL working together', () => {
            cy.wait('@getRepositories');
            //enable security
            UserAndAccessSteps.toggleSecurity();
            //login with the admin
            LoginSteps.loginWithUser("admin", DEFAULT_ADMIN_PASSWORD);
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
            FREE_ACCESS_MENU_ITEMS_WITHOUT_GRAPHQL.forEach(({path, expectedUrl,  checks, expectedTitle}) => {
                navigateMenuPath(path, expectedUrl, expectedTitle);
                if (checks) {
                    runChecks(checks);
                }
            });
        });
    });

    function clickGraphqlAccessForRepo(repoName) {
        if (repoName === '*') {
            UserAndAccessSteps.clickGraphqlAccessAny();
        } else {
           UserAndAccessSteps.clickGraphqlAccessRepo(repoName);
        }
    }

    function clickReadAccessForRepo(repoName) {
        if (repoName === '*') {
            UserAndAccessSteps.clickReadAccessAny();
        } else {
            UserAndAccessSteps.clickReadAccessRepo(repoName);
        }
    }

    function clickWriteAccessForRepo(repoName) {
        if (repoName === '*') {
            UserAndAccessSteps.clickWriteAccessAny();
        } else {
            UserAndAccessSteps.clickWriteAccessRepo(repoName);
        }
    }

    function createUser(username, password, role, opts = {}) {
        UserAndAccessSteps.clickCreateNewUserButton();
        UserAndAccessSteps.typeUsername(username);
        UserAndAccessSteps.typePassword(password);
        UserAndAccessSteps.typeConfirmPasswordField(password);
        UserAndAccessSteps.selectRoleRadioButton(role);
        UserAndAccessSteps.getRoleRadioButton(role).should('be.checked');

        if (role === "#roleUser") {
            setRoles(opts);
            UserAndAccessSteps.confirmUserCreate();
        } else if (role === ROLE_CUSTOM_ADMIN && opts.noPassword) {
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
            clickReadAccessForRepo(repoName);
        }
        if (readWrite) {
            clickWriteAccessForRepo(repoName);
        }
        if (graphql) {
            clickGraphqlAccessForRepo(repoName);
        }
    }

    function testForUser(name, isAdmin) {
        //enable security
        UserAndAccessSteps.toggleSecurity();
        //login new user
        LoginSteps.loginWithUser(name, PASSWORD);
        //verify permissions
        UserAndAccessSteps.getUrl().should('include', '/users');
        if (isAdmin) {
            UserAndAccessSteps.getUsersTable().should('be.visible');
        } else {
            UserAndAccessSteps.getError().should('contain',
                'You have no permission to access this functionality with your current credentials.');
        }
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

    function navigateMenuPath(pathArray, expectedUrl, expectedTitle) {
        pathArray.forEach((label, index) => {
            if (index === 0) {
                UserAndAccessSteps.clickMenuItem(label);
            } else {
                UserAndAccessSteps.clickSubmenuItem(label);
                const title = expectedTitle ? expectedTitle : label;
                cy.get('h1').should('contain', title);
            }
        });

        if (expectedUrl) {
            cy.url().should('include', expectedUrl);
        }
    }

    function runChecks(checks = {}) {
        Object.entries(checks).forEach(([selector, assertions]) => {
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
        'div[role="main]': [
            'not.exist'
        ],
        '.no-authority-panel .alert-warning': [
            'be.visible',
            ['contains.text', 'Some functionalities are not available because'],
            ['contains.text', 'you do not have the required repository permissions.']
        ]
    }

    const hasAuthChecks = {
        'div[role="main"]': [
            'exist',
            'be.visible'
        ],
        '.no-authority-panel .alert-warning': [
            'not.exist'
        ]
    }

    const MENU_ITEMS_WITHOUT_GRAPHQL = [
        // 1) Import
        {
            path: ['Import'],
            expectedUrl: '/import',
            checks: noAuthChecks
        },

        // 2) Explore
        {
            path: ['Explore', 'Graphs overview'],
            expectedUrl: '/graphs',
            checks: noAuthChecks
        },
        {
            path: ['Explore', 'Class hierarchy'],
            expectedUrl: '/hierarchy',
            checks: noAuthChecks
        },
        {
            path: ['Explore', 'Class relationships'],
            expectedUrl: '/relationships',
            checks: noAuthChecks
        },
        {
            path: ['Explore', 'Visual graph'],
            expectedUrl: '/graphs-visualizations',
            checks: noAuthChecks
        },
        {
            path: ['Explore', 'Similarity'],
            expectedTitle: 'Similarity indexes',
            expectedUrl: '/similarity',
            checks: noAuthChecks
        },

        // 3) SPARQL
        {
            path: ['SPARQL'],
            expectedTitle: 'SPARQL Query & Update',
            expectedUrl: '/sparql',
            checks: noAuthChecks
        },

        // 4) GraphQL

        // 5) Monitor
        {
            path: ['Monitor', 'Queries and Updates'],
            expectedUrl: '/monitor/queries',
            expectedTitle: 'Query and Update monitoring',
            checks: noAuthChecks
        },

        // 6) Setup
        {
            path: ['Setup', 'My Settings'],
            expectedUrl: '/settings',
            expectedTitle: 'Settings',
            checks: hasAuthChecks
        },
        {
            path: ['Setup', 'Connectors'],
            expectedUrl: '/connectors',
            expectedTitle: 'Connector management',
            checks: noAuthChecks
        },
        {
            path: ['Setup', 'Cluster'],
            expectedUrl: '/cluster',
            expectedTitle: 'Cluster management',
            checks: hasAuthChecks
        },
        {
            path: ['Setup', 'Plugins'],
            expectedUrl: '/plugins',
            checks: noAuthChecks
        },
        {
            path: ['Setup', 'Namespaces'],
            expectedUrl: '/namespaces',
            checks: noAuthChecks
        },
        {
            path: ['Setup', 'Autocomplete'],
            expectedUrl: '/autocomplete',
            expectedTitle: 'Autocomplete index',
            checks: noAuthChecks
        },
        {
            path: ['Setup', 'RDF Rank'],
            expectedUrl: '/rdfrank',
            checks: noAuthChecks
        },
        {
            path: ['Setup', 'JDBC'],
            expectedUrl: '/jdbc',
            expectedTitle: 'JDBC configuration',
            checks: noAuthChecks
        },
        {
            path: ['Setup', 'SPARQL Templates'],
            expectedUrl: '/sparql-templates',
            checks: noAuthChecks
        },

        // 7) Lab
        {
            path: ['Lab', 'Talk to Your Graph'],
            expectedUrl: '/ttyg',
            checks: noAuthChecks
        },

        // 8) Help
        {
            path: ['Help', 'REST API'],
            expectedUrl: '/webapi',
            expectedTitle: 'REST API documentation',
            checks: hasAuthChecks
        }
    ];

    const GRAPHQL_READ_MENU_ITEMS = [
        {
            path: ['GraphQL', 'GraphQL Playground'],
            expectedUrl: '/graphql/playground',
            checks: hasAuthChecks
        }
    ];
    const GRAPHQL_REPO_MANAGER_MENU_ITEMS = [
        {
            path: ['GraphQL', 'Endpoint Management'],
            expectedUrl: '/graphql/endpoints',
            checks: hasAuthChecks
        },
        {
            path: ['GraphQL', 'GraphQL Playground'],
            expectedUrl: '/graphql/playground',
            checks: hasAuthChecks
        },
        {
            path: ['Monitor', 'Backup and Restore'],
            expectedUrl: '/monitor/backup-and-restore',
            checks: hasAuthChecks
        },
        {
            path: ['Help', 'Interactive guides'],
            expectedUrl: '/guides',
            checks: hasAuthChecks
        }
    ];

    const FREE_ACCESS_MENU_ITEMS_WITHOUT_GRAPHQL = [
        // 1) Import
        {
            path: ['Import'],
            expectedUrl: '/import',
            checks: noAuthChecks
        },

        // 2) Explore
        {
            path: ['Explore', 'Graphs overview'],
            expectedUrl: '/graphs',
            checks: noAuthChecks
        },
        {
            path: ['Explore', 'Class hierarchy'],
            expectedUrl: '/hierarchy',
            checks: noAuthChecks
        },
        {
            path: ['Explore', 'Class relationships'],
            expectedUrl: '/relationships',
            checks: noAuthChecks
        },
        {
            path: ['Explore', 'Visual graph'],
            expectedUrl: '/graphs-visualizations',
            checks: noAuthChecks
        },
        {
            path: ['Explore', 'Similarity'],
            expectedTitle: 'Similarity indexes',
            expectedUrl: '/similarity',
            checks: noAuthChecks
        },

        // 3) SPARQL
        {
            path: ['SPARQL'],
            expectedTitle: 'SPARQL Query & Update',
            expectedUrl: '/sparql',
            checks: noAuthChecks
        },


        // 6) Setup
        {
            path: ['Setup', 'Connectors'],
            expectedUrl: '/connectors',
            expectedTitle: 'Connector management',
            checks: noAuthChecks
        },
        {
            path: ['Setup', 'Plugins'],
            expectedUrl: '/plugins',
            checks: noAuthChecks
        },
        {
            path: ['Setup', 'Namespaces'],
            expectedUrl: '/namespaces',
            checks: noAuthChecks
        },
        {
            path: ['Setup', 'Autocomplete'],
            expectedUrl: '/autocomplete',
            expectedTitle: 'Autocomplete index',
            checks: noAuthChecks
        },
        {
            path: ['Setup', 'RDF Rank'],
            expectedUrl: '/rdfrank',
            checks: noAuthChecks
        },
        {
            path: ['Setup', 'JDBC'],
            expectedUrl: '/jdbc',
            expectedTitle: 'JDBC configuration',
            checks: noAuthChecks
        },
        {
            path: ['Setup', 'SPARQL Templates'],
            expectedUrl: '/sparql-templates',
            checks: noAuthChecks
        },

        // 7) Help
        {
            path: ['Help', 'REST API'],
            expectedUrl: '/webapi',
            expectedTitle: 'REST API documentation',
            checks: hasAuthChecks
        }
    ];
});
