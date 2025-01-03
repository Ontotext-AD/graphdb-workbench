import HomeSteps from "../../steps/home-steps";
import {RepositorySteps} from "../../steps/repository-steps";
import {ToasterSteps} from "../../steps/toaster-steps";
import {GlobalOperationsStatusesStub} from "../../stubs/global-operations-statuses-stub";
import {ModalDialogSteps} from "../../steps/modal-dialog-steps";
import {ImportUserDataSteps} from "../../steps/import/import-user-data-steps";
import {ImportSettingsDialogSteps} from "../../steps/import/import-settings-dialog-steps";
import {ClusterStubs} from "../../stubs/cluster/cluster-stubs";
import {RepositoriesStubs} from "../../stubs/repositories/repositories-stubs";

describe.skip('Repositories', () => {

    let repositoryId;
    const SHACL_SHAPE_DATA = "prefix ex: <http://example.com/ns#>\n" +
        "prefix sh: <http://www.w3.org/ns/shacl#>\n" +
        "prefix xsd: <http://www.w3.org/2001/XMLSchema#>\n" +
        "<http://rdf4j.org/schema/rdf4j#SHACLShapeGraph>\n" +
        "{\n" +
        "ex:PersonShape\n" +
        "    a sh:NodeShape  ;\n" +
        "    sh:targetClass ex:Person ;\n" +
        "    sh:property [\n" +
        "        sh:path ex:age ;\n" +
        "        sh:datatype xsd:integer ;\n" +
        "] .\n" +
        "}";

    const SHACL_CORRECT_DATA = "prefix ex: <http://example.com/ns#>\n" +
        "prefix sh: <http://www.w3.org/ns/shacl#>\n" +
        "prefix xsd: <http://www.w3.org/2001/XMLSchema#>\n" +
        "\n" +
        "ex:Alice\n" +
        "  rdf:type ex:Person ;\n" +
        "  ex:age 12 ;\n" +
        ".";

    const SHACL_INCORRECT_DATA = "prefix ex: <http://example.com/ns#>\n" +
        "prefix sh: <http://www.w3.org/ns/shacl#>\n" +
        "prefix xsd: <http://www.w3.org/2001/XMLSchema#>\n" +
        "\n" +
        "ex:Alice\n" +
        "  rdf:type ex:Person ;\n" +
        "  ex:age 12.1 ;\n" +
        ".";

    const GDB_REPOSITORY_TYPE = 'gdb';

    beforeEach(() => {
        repositoryId = 'repo-' + Date.now();
        RepositorySteps.visit();
    });

    afterEach(() => {
        cy.deleteRepository(repositoryId);
    });


    it('create repository page should list available repository types options', () => {
        const expectedRepoTypes = ['GraphDB Repository', 'Ontop Virtual SPARQL', 'FedX Virtual SPARQL'];
        RepositorySteps.createRepository();
        cy.url().should('include', '/repository/create');

        cy.get('.create-buttons')
            .find('.repo-type')
            .should('have.length', 3)
            .then((repoTypes) => {
                repoTypes.each(($index, $repoType) => {
                    expect($repoType.innerText).to.equal(expectedRepoTypes[$index]);
                });
            });
    });

    it('should allow creation of repositories with default settings', () => {
        // There should be a default repository location
        RepositorySteps.getLocationsList();

        RepositorySteps.createRepository();
        cy.url().should('include', '/repository/create');

        RepositorySteps.chooseRepositoryType(GDB_REPOSITORY_TYPE);
        cy.url().should('include', '/repository/create/');

        // Create a repository by supplying only an identifier
        RepositorySteps.getRepositoryCreateForm();
        RepositorySteps.getRepositoryIdField()
            .should('have.value', '')
            .type(repositoryId)
            .should('have.value', repositoryId);

        RepositorySteps.getEntityIndexSize()
            .should('be.visible')
            .and('have.value', 10000000);

        RepositorySteps.saveRepository();

        // Verify we are back at the setup page after saving
        cy.url().should((url) => {
            expect(url.endsWith('/repository')).to.equal(true);
        });

        // Check the repo is present in the list of repos and we are not yet connected to it
        RepositorySteps.getRepositoryFromList(repositoryId)
            .should('be.visible')
            .find('.icon-connection-off')
            .should('be.visible');

        // Verify it's configuration can be downloaded
        RepositorySteps.getRepositoryFromList(repositoryId)
            .find('.repository-actions .download-repository-config-btn')
            .should('be.visible')
            .and('not.be.disabled');

        // Connect to the repository via the menu
        RepositorySteps.getRepositoriesDropdown().click().within(() => {
            // It should have not selected the new repo

            // Note: The better test here should verify for .no-selected-repository presence but in Travis it seems there is a selected
            // repository although Cypress clears cookies before each test OR the dropdown is not yet fully loaded which is strange
            // because the test has been running for several seconds before this check
            cy.get('#btnReposGroup').should('not.contain', repositoryId);

            // The dropdown should contain the newly created repository
            cy.get('#btnReposGroup').should('have.attr', 'aria-expanded', 'true');
            // Wait about the menu to become visible due to a strange behavior of elements having size 0x0px thus treated as invisible.
            // Alternative is to have the click forced, which might lead to false positive result.
            cy.get('.dropdown-menu-right').should('be.visible').wait(500);
            cy.get('.dropdown-menu-right .dropdown-item')
                .contains(repositoryId)
                .closest('a')
                .scrollIntoView()
                .click();

            // Should visualize the selected repo
            cy.get('.no-selected-repository').should('not.exist');
            cy.get('.active-repository')
                .should('be.visible')
                .and('contain', repositoryId);
        });

        // The repo should be connected after selecting it from the menu
        RepositorySteps.getRepositoryConnectionOnBtn(repositoryId).should('be.visible');

        // And it should not be present in the dropdown items
        RepositorySteps.getRepositoriesDropdown()
            .click()
            .then(() => {
                cy.get('.dropdown-menu-right')
                    .should('not.contain', repositoryId);
            });
    });

    it('should disallow creation of repositories without mandatory settings', () => {
        RepositorySteps.createRepository();
        RepositorySteps.chooseRepositoryType(GDB_REPOSITORY_TYPE);
        cy.url().should('include', '/repository/create/');

        RepositorySteps.saveRepository();

        RepositorySteps.getRepositoryCreateForm();
        RepositorySteps.getRepositoryIdField().should('have.attr', 'placeholder', 'This field is required');

        ToasterSteps.verifyError('Repository ID cannot be empty');
    });

    it('should allow creation of repositories with custom settings', () => {
        const repoTitle = 'Repo title for ' + repositoryId;

        RepositorySteps.createRepository();
        RepositorySteps.chooseRepositoryType(GDB_REPOSITORY_TYPE);
        cy.url().should('include', '/repository/create/');

        RepositorySteps.getRepositoryIdField().type(repositoryId);
        RepositorySteps.getRepositoryTitleField()
            .should('have.value', '')
            .type(repoTitle)
            .should('have.value', repoTitle);

        // Should be disabled before changing the rule set
        RepositorySteps.getRepositoryDisableSameAsCheckbox()
            .should('be.checked');

        // RDFS-Plus (Optimized) -> OWL-Horst (Optimized)
        RepositorySteps.getRepositoryRulesetMenu()
            .should('have.value', '3')
            .select('4')
            .should('have.value', '4');

        // Should be automatically enabled when the rule set is changed to one of the OWL rule set
        RepositorySteps.getRepositoryDisableSameAsCheckbox()
            .should('not.be.checked');

        RepositorySteps.getRepositoryContextIndexCheckbox()
            .should('not.be.checked')
            .check()
            .should('be.checked');

        RepositorySteps.saveRepository();

        // Go to edit and check if everything is properly saved
        RepositorySteps.editRepository(repositoryId);

        cy.url().should('include', '/repository/edit/' + repositoryId);

        RepositorySteps.getRepositoryCreateForm();
        RepositorySteps.getRepositoryIdField().should('have.value', repositoryId);
        RepositorySteps.getRepositoryTitleField().should('have.value', repoTitle);
        // OWL-Horst (Optimized) has become 4
        RepositorySteps.getRepositoryRulesetMenu().should('have.value', '4');
        RepositorySteps.getRepositoryDisableSameAsCheckbox().should('not.be.checked');
        RepositorySteps.getRepositoryContextIndexCheckbox().should('be.checked');

        // TODO uncomment and refactor when FTS configuration is with clear ON or OFF status
        // getRepositoryFtsCheckbox().should('be.checked');
    });

    it('should create repository with selected ruleset file', () => {
        interceptRulesetFileUpload();
        // Given I create a repository
        RepositorySteps.createRepository();
        RepositorySteps.chooseRepositoryType(GDB_REPOSITORY_TYPE);
        RepositorySteps.typeRepositoryId(repositoryId);
        // When I select an invalid ruleset file
        RepositorySteps.getRepositoryRulesetMenu().select('OWL-Horst (Optimized)').then(() => {
            RepositorySteps.selectRulesetFile();
            RepositorySteps.uploadRulesetFile('fixtures/repositories/invalid_builtin_Rules.pie');
            // Then I see an error
            ToasterSteps.verifyError('Error compiling ruleset: ');
            // And I wait for it to disappear
            ToasterSteps.getToast().should('not.exist');
        });

        // When I select a valid ruleset file
        RepositorySteps.getRepositoryRulesetMenu().select('OWL-Horst (Optimized)').then(() => {
            RepositorySteps.selectRulesetFile();
            RepositorySteps.uploadRulesetFile('fixtures/repositories/builtin_Rules.pie');
            // Then there should be no error
            ToasterSteps.getToast().should('not.exist');
            // And I should be able to save the repository
            RepositorySteps.saveRepository();
        });
    });

    it('should allow to switch between repositories', () => {
        const secondRepoId = 'second-repo-' + Date.now();
        RepositorySteps.createRepository();
        RepositorySteps.chooseRepositoryType(GDB_REPOSITORY_TYPE);
        cy.url().should('include', '/repository/create/');

        RepositorySteps.typeRepositoryId(repositoryId);
        RepositorySteps.saveRepository();

        RepositorySteps.createRepository();
        RepositorySteps.chooseRepositoryType(GDB_REPOSITORY_TYPE);
        cy.url().should('include', '/repository/create/');

        RepositorySteps.typeRepositoryId(secondRepoId);
        RepositorySteps.saveRepository();
        cy.wait('@getRepositories');

        // Wait for redirection to previous '/repository'
        cy.waitUntil(() =>
                cy.url().then((url) => url === (Cypress.config('baseUrl') + '/repository')));

        // Connect to the first repo via the connection icon
        // Note: Not using within() because the whole row will be re-rendered & detached
        RepositorySteps.getRepositoryConnectionOffBtn(repositoryId)
            .should('be.visible')
            .and('not.be.disabled')
            // Forcefully clicking it due to https://github.com/cypress-io/cypress/issues/695
            .click({force: true})
            .should('not.exist');

        // See it is connected and the second is not
        RepositorySteps.getRepositoryConnectionOnBtn(repositoryId).should('be.visible');
        RepositorySteps.getRepositoryConnectionOffBtn(secondRepoId).should('be.visible');
        RepositorySteps.getRepositoriesDropdown()
            .find('.active-repository')
            .should('contain', repositoryId);

        // Choose the second from the dropdown
        RepositorySteps.selectRepoFromDropdown(secondRepoId);

        // See it is connected and the first is disconnected
        RepositorySteps.getRepositoryConnectionOffBtn(repositoryId).should('be.visible');
        RepositorySteps.getRepositoryConnectionOnBtn(secondRepoId).should('be.visible');
        RepositorySteps.getRepositoriesDropdown()
            .find('.active-repository')
            .should('contain', secondRepoId);
        // The first should return back to the dropdown items
        RepositorySteps.getRepositoriesDropdown()
            .click()
            .find('.dropdown-menu-right .dropdown-item')
            .should('contain', repositoryId);
        // Hide the menu
        RepositorySteps.getRepositoriesDropdown().click();

        // Make the first one default, clear the cookies and reload the page
        // Note: the first one should be cleared in afterEach() preventing other tests to select it by default
        RepositorySteps.selectRepoFromDropdown(repositoryId);

        RepositorySteps.getRepositoryFromList(repositoryId)
            .find('.pin-repository-btn')
            .should('not.have.class', 'active')
            .click({force:true})
            .should('have.class', 'active');
        // The currently selected repository is kept in local storage
        cy.visit('/repository');
        cy.window();

        // Should automatically select the default repository
        RepositorySteps.getRepositoriesDropdown()
            .find('.active-repository')
            .should('contain', repositoryId)
            .then(() => {
                // TODO: Could push the repo in an array and afterEach can delete all of them
                // Moved delete second repository in then block to avoid concurrency
                cy.deleteRepository(secondRepoId);
            });
    });

    it('should allow to edit existing repository', () => {
        const newTitle = 'Title edit';

        RepositorySteps.createRepository();
        RepositorySteps.chooseRepositoryType(GDB_REPOSITORY_TYPE);
        cy.url().should('include', '/repository/create/');

        RepositorySteps.typeRepositoryId(repositoryId);
        RepositorySteps.typeRepositoryTitle('Title');
        RepositorySteps.saveRepository();
        RepositorySteps.editRepository(repositoryId);

        // Some fields should be disabled
        RepositorySteps.getRepositoryRulesetMenu().should('be.disabled');
        RepositorySteps.getRepositoryDisableSameAsCheckbox().should('be.disabled');
        RepositorySteps.getEntityIndexSize().should('be.disabled');

        RepositorySteps.typeRepositoryTitle(newTitle);
        RepositorySteps.getRepositoryContextIndexCheckbox().check();

        // TODO uncomment and refactor when FTS configuration is with clear ON or OFF status
        // getRepositoryFtsCheckbox().check();

        RepositorySteps.getSaveRepositoryButton()
            .click()
            .then(() => {
                RepositorySteps.confirmModal();
                RepositorySteps.waitLoader();
            });
        cy.wait('@getLocations');
        // See the title is rendered in the repositories list
        RepositorySteps.getRepositoryFromList(repositoryId).should('contain', newTitle);

        // Go to edit again to verify changes
        RepositorySteps.editRepository(repositoryId);

        RepositorySteps.getRepositoryTitleField().should('have.value', newTitle);
        RepositorySteps.getRepositoryContextIndexCheckbox().should('be.checked');

        // TODO uncomment and refactor when FTS configuration is with clear ON or OFF status
        // getRepositoryFtsCheckbox().should('be.checked');
    });

    it('should allow to delete existing repository', () => {
        RepositorySteps.createRepository();
        RepositorySteps.chooseRepositoryType(GDB_REPOSITORY_TYPE);
        cy.url().should('include', '/repository/create/');

        RepositorySteps.typeRepositoryId(repositoryId);
        RepositorySteps.saveRepository();
        RepositorySteps.selectRepoFromDropdown(repositoryId);

        RepositorySteps.getRepositoryFromList(repositoryId)
            .find('.repository-actions .delete-repository-btn')
            // Forcefully clicking it due to https://github.com/cypress-io/cypress/issues/695
            .should('be.visible')
            .and('not.be.disabled')
            .click({force: true});

        RepositorySteps.confirmModal();

        // Check the repo has been deselected and is not present in the repo dropdown menu
        RepositorySteps.getRepositoriesDropdown().click().within(() => {
            cy.get('#btnReposGroup').should('not.contain', repositoryId);
        });
    });

    it('should restart an existing repository', () => {

        RepositorySteps.createRepository();
        RepositorySteps.chooseRepositoryType(GDB_REPOSITORY_TYPE);

        cy.url().should('include', '/repository/create');

        // Create a repository by supplying only an identifier
        RepositorySteps.getRepositoryCreateForm();
        RepositorySteps.getRepositoryIdField()
            .should('have.value', '')
            .type(repositoryId)
            .should('have.value', repositoryId);
        RepositorySteps.saveRepository();

        // Verify we are back at the setup page after saving
        cy.url().should((url) => {
            expect(url.endsWith('/repository')).to.equal(true);
        });

        //Make sure that repository is in status INACTIVE
        RepositorySteps.assertRepositoryStatus(repositoryId, "INACTIVE");

        RepositorySteps.getRepositoriesDropdown().click().within(() => {

            // Wait about the menu to become visible due to a strange behavior of elements having size 0x0px thus treated as invisible.
            // Alternative is to have the click forced, which might lead to false positive result.
            cy.get('.dropdown-menu-right').should('be.visible').wait(500);
            cy.get('.dropdown-menu-right .dropdown-item')
                .contains(repositoryId)
                .closest('a')
                .click();
            // Should visualize the selected repo
            cy.get('.no-selected-repository').should('not.exist');
            cy.get('.active-repository')
                .should('be.visible')
                .and('contain', repositoryId);
        });

        HomeSteps.visitAndWaitLoader();
        cy.visit('/repository');

        RepositorySteps.assertRepositoryStatus(repositoryId, "RUNNING");

        //Restart the repository
        RepositorySteps.restartRepository(repositoryId);
        RepositorySteps.confirmModal();
        //Check toast for RESTARTING status and repo row for RUNNING status
        ToasterSteps.verifySuccess('Restarting repository ' + repositoryId);

        RepositorySteps.assertRepositoryStatus(repositoryId, "RESTARTING");

        ToasterSteps.getToast().should('not.exist');

        RepositorySteps.assertRepositoryStatus(repositoryId, "RUNNING");
    });

    it('should create SHACL repo and test shapes validation', () => {
        //Prepare repository by enabling SHACL
        RepositorySteps.createRepository();
        RepositorySteps.chooseRepositoryType(GDB_REPOSITORY_TYPE);
        cy.url().should('include', '/repository/create/');
        RepositorySteps.typeRepositoryId(repositoryId);
        RepositorySteps.getSHACLRepositoryCheckbox().check();
        RepositorySteps.saveRepository();
        RepositorySteps.selectRepoFromDropdown(repositoryId);

        // Import a shape in the SHACL graph
        ImportUserDataSteps.visitUserImport(repositoryId);
        ImportUserDataSteps
            .openImportTextSnippetDialog()
            .fillRDFTextSnippet(SHACL_SHAPE_DATA)
            .selectRDFFormat("TriG")
            .clickImportTextSnippetButton();
        ImportSettingsDialogSteps.import();
        ImportUserDataSteps.checkImportedResource(0, 'Text snippet');
        // Import data that conforms with the shape - import is successfully
        // The newly imported file is first in the list
        ImportUserDataSteps
            .openImportTextSnippetDialog()
            .fillRDFTextSnippet(SHACL_CORRECT_DATA)
            .selectRDFFormat("Turtle")
            .clickImportTextSnippetButton();
        ImportSettingsDialogSteps.import();
        ImportUserDataSteps.checkImportedResource(0, 'Text snippet');
        // Import data that does not conform with the shape - GraphDBShaclSailValidationException
        // The newly imported file is first in the list
        ImportUserDataSteps
            .openImportTextSnippetDialog()
            .fillRDFTextSnippet(SHACL_INCORRECT_DATA)
            .selectRDFFormat("Turtle")
            .clickImportTextSnippetButton();
        ImportSettingsDialogSteps.import();
        ImportUserDataSteps.checkImportedResource(0, 'Text snippet', 'org.eclipse.rdf4j.sail.shacl.GraphDBShaclSailValidationException: Failed SHACL validation');
    });

    it('should allow editing of repository name if repository is in cluster', () => {
        // When I create a repository,
        cy.createRepository({id: repositoryId});
        // set the repository be in a cluster.
        GlobalOperationsStatusesStub.stubGlobalOperationsStatusesResponse(repositoryId);
        // and go to the edit repository page.
        RepositorySteps.visitEditPage(repositoryId);

        // When I try to edit the repository id.
        RepositorySteps.editRepositoryId();

        // Then I expect to be allowed to edit.
        ModalDialogSteps.getDialog().should('be.visible');
        RepositorySteps.getRepositoryIdEditElement().should('have.css', 'cursor').and('match', /pointer/);
    });

    it('should allow editing of repository name if repository is not in cluster', () => {
        // When I create a repository,
        cy.createRepository({id: repositoryId});
        // and go to edit the repository page.
        RepositorySteps.visitEditPage(repositoryId);

        // When I try to edit the repository id.
        RepositorySteps.editRepositoryId();

        // Then I expect to see a confirmation dialog.
        ModalDialogSteps.verifyDialogBody('Changing the repository ID is a dangerous operation since it renames the repository folder and enforces repository shutdown.');
    });

    it('should NOT allow restart of LOCAL repository from EDIT PAGE, if node is in cluster', () => {
        // Given I create a repository
        cy.createRepository({id: repositoryId});
        // When I set the node in a cluster
        GlobalOperationsStatusesStub.stubGlobalOperationsStatusesResponse(repositoryId);
        // Then go to the local repository's edit page
        RepositorySteps.visitEditPage(repositoryId);
        // I expect the repository restart checkbox button to be disabled
        RepositorySteps.getEditViewRestartButton().should('be.visible');
        RepositorySteps.getEditViewRestartButton().should('be.disabled');
    });

    it('should NOT allow restart of LOCAL repositories from REPOSITORIES PAGE, if node is in cluster', () => {
        // Given I create a repository
        cy.createRepository({id: repositoryId});
        // When I set the node in a cluster
        GlobalOperationsStatusesStub.stubGlobalOperationsStatusesResponse(repositoryId);
        ClusterStubs.stubClusterNodeStatus();
        // Then go to the repositories page
        RepositorySteps.visit();
        // I expect the local repository's restart button to be disabled
        RepositorySteps.getRepositoryRestartButton(repositoryId).should('be.visible');
        RepositorySteps.getRepositoryRestartButton(repositoryId).should('be.disabled');
    });

    it('should ALLOW restart of REMOTE repositories from REPOSITORIES PAGE, if node is in cluster', () => {
        // Given I have a remote location
        RepositoriesStubs.stubRepositories(0, '/repositories/get-remote-and-local-repositories.json');
        RepositoriesStubs.stubLocations();
        // When I set the node in a cluster
        ClusterStubs.stubClusterNodeStatus();
        // Then go to the repositories page
        RepositorySteps.visit();
        // Then I expect the remote repository's restart button to be enabled
        RepositorySteps.getRestartRemoteRepoButton(0).should('be.enabled');
    });

    function interceptRulesetFileUpload() {
       cy.intercept(
            {
                method: 'POST',
                url: 'rest/repositories/ruleset/upload'
            },
            (req) => {
                const bodyString = req.body.toString();

                if (bodyString.includes('filename="invalid_builtin_Rules.pie"')) {
                    req.reply({
                        statusCode: 200,
                        body: {
                            success: false,
                            errorMessage: 'Error compiling ruleset: invalid_builtin_Rulestmp1724942106843.pie',
                            fileLocation: ''
                        }
                    });
                } else if (bodyString.includes('filename="builtin_Rules.pie"')) {
                    req.reply({
                        statusCode: 200,
                        body: {
                            success: true,
                            errorMessage: '',
                            fileLocation: 'builtin_Rulestmp1724944380374.pie'
                        }
                    });
                } else {
                    throw new Error('Test failed: Request did not match stubbed headers.');
                }
            }
        ).as('uploadRuleset');
    }
});
