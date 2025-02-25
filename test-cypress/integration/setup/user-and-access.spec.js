import {UserAndAccessSteps} from "../../steps/setup/user-and-access-steps";
import {RepositoriesStubs} from "../../stubs/repositories/repositories-stubs";
import {RepositorySelectorSteps} from "../../steps/repository-selector-steps";

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
            cy.viewport(1280, 1000);
            RepositoriesStubs.spyGetRepositories();
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
            cy.wait('@getRepositories');
            const name = 'graphqlUser';
            createUser(name, PASSWORD, ROLE_USER, { read: true, graphql: true , repoName: repositoryId2});
            deleteUser(name);
        });

        it('Can create user with different auth combinations', () => {
            cy.wait('@getRepositories');
            const name = 'graphqlUser';
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

        it('Should have access to 5 pages when have graphql only rights', () => {
            cy.wait('@getRepositories');
            const name = 'graphqlUser';
            // WHEN I create a user with read + GraphQL for repository #2
            createUser(name, PASSWORD, ROLE_USER, {readWrite: true, graphql: true, repoName: repositoryId1});
            //enable security
            UserAndAccessSteps.toggleSecurity();
            //login new user
            UserAndAccessSteps.loginWithUser(name, PASSWORD);
            RepositorySelectorSteps.selectRepository(repositoryId1);

            MENU_ITEMS.forEach(({path, expectedUrl,  checks, expectedTitle}) => {
                UserAndAccessSteps.navigateMenuPath(path, expectedUrl, expectedTitle);
                if (checks) {
                    UserAndAccessSteps.runChecks(checks);
                }
            });
            UserAndAccessSteps.logout();
            //login with the admin
            UserAndAccessSteps.loginWithUser("admin", DEFAULT_ADMIN_PASSWORD);
            cy.wait('@getRepositories');
            UserAndAccessSteps.visit();
            //delete new-user
            deleteUser(name)
            //disable security
            UserAndAccessSteps.toggleSecurity();
            UserAndAccessSteps.getSecuritySwitchLabel().should('be.visible').and('contain', 'Security is OFF');
        });

        it('Should not have access endpoints management when have read graphql only rights', () => {
            cy.wait('@getRepositories');
            const name = 'graphqlUser';
            // WHEN I create a user with read + GraphQL for repository #2
            createUser(name, PASSWORD, ROLE_USER, {read: true, graphql: true, repoName: repositoryId1});
            //enable security
            UserAndAccessSteps.toggleSecurity();
            //login new user
            UserAndAccessSteps.loginWithUser(name, PASSWORD);
            RepositorySelectorSteps.selectRepository(repositoryId1);

            GRAPHQL_MENU_ITEMS.forEach(({path, expectedUrl,  checks, expectedTitle}) => {
                UserAndAccessSteps.navigateMenuPath(path, expectedUrl, expectedTitle);
                if (checks) {
                    UserAndAccessSteps.runChecks(checks);
                }
            });
            UserAndAccessSteps.logout();
            //login with the admin
            UserAndAccessSteps.loginWithUser("admin", DEFAULT_ADMIN_PASSWORD);
            cy.wait('@getRepositories');
            UserAndAccessSteps.visit();
            //delete new-user
            deleteUser(name)
            //disable security
            UserAndAccessSteps.toggleSecurity();
            UserAndAccessSteps.getSecuritySwitchLabel().should('be.visible').and('contain', 'Security is OFF');
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

    const MENU_ITEMS = [
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

        // 5) Monitor
        {
            path: ['Monitor', 'Queries and Updates'],
            expectedUrl: '/monitor/queries',
            expectedTitle: 'Query and Update monitoring',
            checks: noAuthChecks
        },
        {
            path: ['Monitor', 'Backup and Restore'],
            expectedUrl: '/monitor/backup-and-restore',
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
            path: ['Help', 'Interactive guides'],
            expectedUrl: '/guides',
            checks: noAuthChecks
        },
        {
            path: ['Help', 'REST API'],
            expectedUrl: '/webapi',
            expectedTitle: 'REST API documentation',
            checks: hasAuthChecks
        }
    ];

    const GRAPHQL_MENU_ITEMS = [
        {
            path: ['GraphQL', 'Endpoint Management'],
            expectedUrl: '/graphql/endpoints',
            checks: noAuthChecks
        },
        {
            path: ['GraphQL', 'GraphQL Playground'],
            expectedUrl: '/graphql/playground',
            checks: hasAuthChecks
        }
    ];


});
