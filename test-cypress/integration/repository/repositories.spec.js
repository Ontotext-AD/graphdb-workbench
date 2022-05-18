import HomeSteps from "../../steps/home-steps";
import ImportSteps from "../../steps/import-steps";

describe('Repositories', () => {

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
    const REPO_LIST_ID = '#wb-repositories-repositoryInGetRepositories';

    beforeEach(() => {
        repositoryId = 'repo-' + Date.now();

        cy.visit('/repository');
        cy.window();

        waitUntilRepositoriesPageIsLoaded();
    });

    afterEach(() => {
        cy.deleteRepository(repositoryId);
    });

    function waitUntilRepositoriesPageIsLoaded() {
        // Workbench loading screen should not be visible
        cy.get('.ot-splash').should('not.be.visible');

        getRepositoriesDropdown().should('not.be.disabled');
        getCreateRepositoryButton().should('be.visible').and('not.be.disabled');
    }

    it('create repository page should list available repository types options', () => {
        let expectedRepoTypes = ['GraphDB Repository', 'Ontop Virtual SPARQL', 'FedX Virtual SPARQL'];
        createRepository();
        cy.url().should('include', '/repository/create');

        cy.get('.create-buttons')
            .find('.h3.repo-type')
            .should('have.length', 3)
            .then((repoTypes) => {
                repoTypes.each(($index, $repoType) => {
                    expect($repoType.innerText).to.equal(expectedRepoTypes[$index]);
                });
            });
    });

    it('should allow creation of repositories with default settings', () => {
        // There should be a default repository location
        getLocationsList();

        createRepository();
        cy.url().should('include', '/repository/create');

        chooseRepositoryType(GDB_REPOSITORY_TYPE);
        cy.url().should('include', '/repository/create/');

        // Create a repository by supplying only an identifier
        getRepositoryCreateForm().should('be.visible');
        getRepositoryIdField()
            .should('have.value', '')
            .type(repositoryId)
            .should('have.value', repositoryId);

        saveRepository();

        // Verify we are back at the setup page after saving
        cy.url().should((url) => {
            expect(url.endsWith('/repository')).to.equal(true);
        });

        // Check the repo is present in the list of repos and we are not yet connected to it
        getRepositoryFromList(repositoryId)
            .should('be.visible')
            .find('.icon-connection-off')
            .should('be.visible');

        // Verify it's configuration can be downloaded
        getRepositoryFromList(repositoryId)
            .find('.repository-actions .download-repository-config-btn')
            .should('be.visible')
            .and('not.be.disabled');

        // Connect to the repository via the menu
        getRepositoriesDropdown().click().within(() => {
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
        getRepositoryConnectionOnBtn(repositoryId).should('be.visible');

        // And it should not be present in the dropdown items
        getRepositoriesDropdown()
            .click()
            .then(() => {
                cy.get('.dropdown-menu-right')
                    .should('not.contain', repositoryId);
            });
    });

    it('should disallow creation of repositories without mandatory settings', () => {
        createRepository();
        chooseRepositoryType(GDB_REPOSITORY_TYPE);
        cy.url().should('include', '/repository/create/');

        saveRepository();

        getRepositoryCreateForm().should('be.visible');
        getRepositoryIdField().should('have.attr', 'placeholder', 'This field is required');

        getToast()
            .find('.toast-error')
            .should('be.visible')
            .and('contain', 'Repository ID cannot be empty');
    });

    it('should allow creation of repositories with custom settings', () => {
        const repoTitle = 'Repo title for ' + repositoryId;

        createRepository();
        chooseRepositoryType(GDB_REPOSITORY_TYPE);
        cy.url().should('include', '/repository/create/');

        getRepositoryIdField().type(repositoryId);
        getRepositoryTitleField()
            .should('have.value', '')
            .type(repoTitle)
            .should('have.value', repoTitle);

        // Should be disabled before changing the rule set
        getRepositoryDisableSameAsCheckbox()
            .should('be.checked');

        // RDFS-Plus (Optimized) -> OWL-Horst (Optimized)
        getRepositoryRulesetMenu()
            .should('have.value', '3')
            .select('4')
            .should('have.value', '4');

        // Should be automatically enabled when the rule set is changed to one of the OWL rule set
        getRepositoryDisableSameAsCheckbox()
            .should('not.be.checked');

        getRepositoryContextIndexCheckbox()
            .should('not.be.checked')
            .check()
            .should('be.checked');

        saveRepository();

        // Go to edit and check if everything is properly saved
        editRepository(repositoryId);

        cy.url().should('include', '/repository/edit/' + repositoryId);

        getRepositoryCreateForm().should('be.visible');
        getRepositoryIdField().should('have.value', repositoryId);
        getRepositoryTitleField().should('have.value', repoTitle);
        // OWL-Horst (Optimized) has become 4
        getRepositoryRulesetMenu().should('have.value', '4');
        getRepositoryDisableSameAsCheckbox().should('not.be.checked');
        getRepositoryContextIndexCheckbox().should('be.checked');
    });

    it('should allow to switch between repositories', () => {
        const secondRepoId = 'second-repo-' + Date.now();
        createRepository();
        chooseRepositoryType(GDB_REPOSITORY_TYPE);
        cy.url().should('include', '/repository/create/');

        typeRepositoryId(repositoryId);
        saveRepository();

        createRepository();
        chooseRepositoryType(GDB_REPOSITORY_TYPE);
        cy.url().should('include', '/repository/create/');

        typeRepositoryId(secondRepoId);
        saveRepository();

        // Connect to the first repo via the connection icon
        // Note: Not using within() because the whole row will be re-rendered & detached
        getRepositoryConnectionOffBtn(repositoryId)
            .should('be.visible')
            .and('not.be.disabled')
            // Forcefully clicking it due to https://github.com/cypress-io/cypress/issues/695
            .click({force: true})
            .should('not.exist');

        // See it is connected and the second is not
        getRepositoryConnectionOnBtn(repositoryId).should('be.visible');
        getRepositoryConnectionOffBtn(secondRepoId).should('be.visible');
        getRepositoriesDropdown()
            .find('.active-repository')
            .should('contain', repositoryId);

        // Choose the second from the dropdown
        selectRepoFromDropdown(secondRepoId);

        // See it is connected and the first is disconnected
        getRepositoryConnectionOffBtn(repositoryId).should('be.visible');
        getRepositoryConnectionOnBtn(secondRepoId).should('be.visible');
        getRepositoriesDropdown()
            .find('.active-repository')
            .should('contain', secondRepoId);
        // The first should return back to the dropdown items
        getRepositoriesDropdown()
            .click()
            .find('.dropdown-menu-right .dropdown-item')
            .should('contain', repositoryId);
        // Hide the menu
        getRepositoriesDropdown().click();

        // Make the first one default, clear the cookies and reload the page
        // Note: the first one should be cleared in afterEach() preventing other tests to select it by default
        selectRepoFromDropdown(repositoryId);

        getRepositoryFromList(repositoryId)
            .find('.pin-repository-btn')
            .should('not.have.class', 'active')
            .click({force:true})
            .should('have.class', 'active');
        // The currently selected repository is kept in local storage
        cy.visit('/repository');
        cy.window();
        // Should automatically select the default repository
        getRepositoriesDropdown()
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

        createRepository();
        chooseRepositoryType(GDB_REPOSITORY_TYPE);
        cy.url().should('include', '/repository/create/');

        typeRepositoryId(repositoryId);
        typeRepositoryTitle('Title');
        saveRepository();

        editRepository(repositoryId);

        // Some fields should be disabled
        getRepositoryRulesetMenu().should('be.disabled');
        getRepositoryDisableSameAsCheckbox().should('be.disabled');

        typeRepositoryTitle(newTitle);
        getRepositoryContextIndexCheckbox().check();

        getSaveRepositoryButton()
            .click()
            .then(() => {
                confirmModal();
                waitLoader();
            });

        // See the title is rendered in the repositories list
        getRepositoryFromList(repositoryId).should('contain', newTitle);

        // Go to edit again to verify changes
        editRepository(repositoryId);

        getRepositoryTitleField().should('have.value', newTitle);
        getRepositoryContextIndexCheckbox().should('be.checked');
    });

    it('should allow to delete existing repository', () => {
        createRepository();
        chooseRepositoryType(GDB_REPOSITORY_TYPE);
        cy.url().should('include', '/repository/create/');

        typeRepositoryId(repositoryId);
        saveRepository();

        selectRepoFromDropdown(repositoryId);

        getRepositoryFromList(repositoryId)
            .find('.repository-actions .delete-repository-btn')
            // Forcefully clicking it due to https://github.com/cypress-io/cypress/issues/695
            .should('be.visible')
            .and('not.be.disabled')
            .click({force: true});

        confirmModal();

        getRepositoriesList().should('not.exist');

        // Check the repo has been deselected and is not present in the repo dropdown menu
        getRepositoriesDropdown().click().within(() => {
            cy.get('#btnReposGroup').should('not.contain', repositoryId);
        });
    });

    //Check that 'Ontop' type repository is available and that the configuration fields are present and active.
    it('should check if Ontop repository type is available', () => {
        getCreateRepositoryButton().click();
        getRepositoryTypeButton('ontop').should('be.visible');
        chooseRepositoryType('ontop');
        cy.url().should('include', '/repository/create/ontop');

        getOBDAFileField().should('be.visible');
        getOntologyFileField().should('be.visible');
        getPropertiesFileField().should('be.visible');
        getConstraintFileField().should('be.visible');
        getOBDAUploadButton().scrollIntoView().should('be.visible').and('not.be.disabled');
        getOntologyUploadButton().scrollIntoView().should('be.visible').and('not.be.disabled');
        getPropertiesUploadButton().scrollIntoView().should('be.visible').and('not.be.disabled');
        getConstraintUploadButton().scrollIntoView().should('be.visible').and('not.be.disabled');
    });

    // Remove skip, when https://gitlab.ontotext.com/graphdb-team/graphdb/-/merge_requests/1584 is merged
    //Create Ontop repository and test ontop functionality
    it.skip('should create an Ontop repository', () => {
        let obdaFileUpload = '';
        let ontologyFileUpload = '';
        let propertiesFileUpload = '';
        const url = 'http://localhost:9000/rest/repositories/file/upload';
        const fileType = '';
        const virtualRepoName = 'virtual-repo-' + Date.now();

        // upload obda file
        cy.fixture('ontop/university-complete.obda', 'binary').then((file) => {
            Cypress.Blob.binaryStringToBlob(file, fileType).then((blob) => {
                const formData = new FormData();
                formData.set('file', blob, 'university-complete.obda');

                cy.form_request(url, formData).then(response => {
                    return obdaFileUpload = response.response.body.fileLocation;
                });
            });
        }).then(() => {
            // upload ontology file
            cy.fixture('ontop/university-complete.ttl', 'binary').then((file) => {
                Cypress.Blob.binaryStringToBlob(file, fileType).then((blob) => {
                    const formData = new FormData();
                    formData.set('file', blob, 'university-complete.ttl');

                    cy.form_request(url, formData).then(response => {
                        return ontologyFileUpload = response.response.body.fileLocation;
                    });
                });
            }).then(() => {
                // upload property file
                cy.fixture('ontop/university-complete.properties', 'binary').then((file) => {
                    Cypress.Blob.binaryStringToBlob(file, fileType).then((blob) => {
                        const formData = new FormData();
                        formData.set('file', blob, 'university-complete.properties');

                        cy.form_request(url, formData).then(response => {
                            return propertiesFileUpload = response.response.body.fileLocation;
                        });
                    });
                });
            }).then(() => {
                const body = {
                    id: virtualRepoName,
                    title: '',
                    type: 'ontop',
                    params: {
                        propertiesFile: {
                            label: 'JDBC properties file',
                            name: 'propertiesFile',
                            value: propertiesFileUpload
                        },
                        isShacl: {
                            label: 'Supports SHACL validation',
                            name: 'isShacle',
                            value: false
                        },
                        owlFile: {
                            label: 'Ontology file',
                            name: 'owlFile',
                            value: ontologyFileUpload
                        },
                        constraintFile: {
                            label: 'Constraint file',
                            name: 'constraintFile',
                            value: ''
                        },
                        id: {
                            label: 'Repository ID',
                            name: 'id',
                            value: 'ontop-repo'
                        },
                        title: {
                            label: "Repository title",
                            name: "title",
                            value: "Ontop virtual store"
                        },
                        obdaFile: {
                            label: "OBDA or R2RML file",
                            name: "obdaFile",
                            value: obdaFileUpload
                        }
                    }
                };

                cy.request({
                    method: 'POST',
                    url: 'http://localhost:9000/rest/repositories',
                    body,
                    headers: {'Content-Type': 'application/json;charset=UTF-8'}
                }).then(response => {
                    console.log(response);
                });
            });
        });

        cy.reload(); //refresh page as the virtual repo is not visible in the UI when created with the request

        //Check workbench restricted sections when connected to an Ontop repository
        selectRepoFromDropdown(virtualRepoName);
        cy.visit("/import");
        getOntopFunctionalityDisabledMessage();
        cy.visit("/monitor/queries");
        getOntopFunctionalityDisabledMessage();
        cy.visit("/connectors");
        getOntopFunctionalityDisabledMessage();
        cy.visit("/autocomplete");
        getOntopFunctionalityDisabledMessage();
        cy.visit("/rdfrank");
        getOntopFunctionalityDisabledMessage();
        cy.visit("/jdbc");
        getOntopFunctionalityDisabledMessage();

        //TODO - uncomment following when org.h2.Driver is added to the class path of the instance
        //
        // //Check that Inference and SameAs are disabled also that explain plan is not supported.
        // cy.visit("/sparql");
        // cy.get('.ot-splash').should('not.exist'); //wait until SPARQL page is loaded completely
        //
        // //check that Inference and SameAs buttons are disabled.
        // cy.get('#inference').should('be', 'visible').and('be', 'disabled');
        // cy.get('#sameAs').should('be', 'visible').and('be', 'disabled');
        cy.deleteRepository(virtualRepoName);
    });

    it('should verify different virtual repository RDBMS provider elements', () => {
        // There should be a default repository location
        getLocationsList();

        createRepository();
        cy.url().should('include', '/repository/create');

        chooseRepositoryType("ontop");
        cy.url().should('include', '/repository/create/ontop');

        // Create a repository by supplying only an identifier
        getRepositoryCreateForm().should('be.visible');
        getRepositoryIdField()
            .should('have.value', '')
            .type(repositoryId)
            .should('have.value', repositoryId);

        //Select Generic JDBC Driver driver type and verify elements and download url (if available)
        selectDatabaseDriver('Generic JDBC Driver');
        getDatabaseDriver().should('contain', 'Generic JDBC Driver');

        testOntopConfigurationElementsVisibility('Database driver', '#driverType');
        testOntopConfigurationElementsVisibility('JDBC properties file*', '#propertiesFile');
        testOntopConfigurationElementsVisibility('OBDA or R2RML file*', '#obdaFile');
        testOntopConfigurationElementsVisibility('Constraint file', '#constraintFile');
        testOntopConfigurationElementsVisibility('Ontology file', '#owlFile');

        //Select MySQL driver type and verify elements and download url (if available)
        selectDatabaseDriver('MySQL');
        getDatabaseDriver().should('contain', 'MySQL');

        testOntopConfigurationElementsVisibility('Hostname*', '#hostName');
        testOntopConfigurationElementsVisibility('Port', '#port');
        testOntopConfigurationElementsVisibility('Database name*', '#databaseName');
        testOntopConfigurationElementsVisibility('Username*', '#userName');
        testOntopConfigurationElementsVisibility('Password', '#password');
        testOntopConfigurationElementsVisibility('Driver class', '#driverClass');
        testOntopConfigurationElementsVisibility('URL', '#url');
        testOntopConfigurationElementsVisibility('OBDA or R2RML file*', '#obdaFile');
        testOntopConfigurationElementsVisibility('Constraint file', '#constraintFile');
        testOntopConfigurationElementsVisibility('Ontology file', '#owlFile');
        //verify driver download url
        compareDriverDownloadUrl('https://dev.mysql.com/downloads/connector/j/');

        //Select postgreSQL driver type and verify elements and download url (if available)
        selectDatabaseDriver('PostgreSQL');
        getDatabaseDriver().should('contain', 'PostgreSQL');

        testOntopConfigurationElementsVisibility('Hostname*', '#hostName');
        testOntopConfigurationElementsVisibility('Port', '#port');
        testOntopConfigurationElementsVisibility('Database name*', '#databaseName');
        testOntopConfigurationElementsVisibility('Username*', '#userName');
        testOntopConfigurationElementsVisibility('Password', '#password');
        testOntopConfigurationElementsVisibility('Driver class', '#driverClass');
        testOntopConfigurationElementsVisibility('URL', '#url');
        testOntopConfigurationElementsVisibility('OBDA or R2RML file*', '#obdaFile');
        testOntopConfigurationElementsVisibility('Constraint file', '#constraintFile');
        testOntopConfigurationElementsVisibility('Ontology file', '#owlFile');
        //verify driver download url
        compareDriverDownloadUrl('https://jdbc.postgresql.org/download.html');

        //Select Oracle driver type and verify elements and download url (if available)
        selectDatabaseDriver('Oracle');
        getDatabaseDriver().should('contain', 'Oracle');

        testOntopConfigurationElementsVisibility('Hostname*', '#hostName');
        testOntopConfigurationElementsVisibility('Port', '#port');
        testOntopConfigurationElementsVisibility('Database name*', '#databaseName');
        testOntopConfigurationElementsVisibility('Username*', '#userName');
        testOntopConfigurationElementsVisibility('Password', '#password');
        testOntopConfigurationElementsVisibility('Driver class', '#driverClass');
        testOntopConfigurationElementsVisibility('URL', '#url');
        testOntopConfigurationElementsVisibility('OBDA or R2RML file*', '#obdaFile');
        testOntopConfigurationElementsVisibility('Constraint file', '#constraintFile');
        testOntopConfigurationElementsVisibility('Ontology file', '#owlFile');
        //verify driver download url
        compareDriverDownloadUrl('https://www.cdata.com/drivers/oracledb/jdbc/');

        //Select MS SQL Server driver type and verify elements and download url (if available)
        selectDatabaseDriver('MS SQL Server');
        getDatabaseDriver().should('contain', 'MS SQL Server');

        testOntopConfigurationElementsVisibility('Hostname*', '#hostName');
        testOntopConfigurationElementsVisibility('Port', '#port');
        testOntopConfigurationElementsVisibility('Database name*', '#databaseName');
        testOntopConfigurationElementsVisibility('Username*', '#userName');
        testOntopConfigurationElementsVisibility('Password', '#password');
        testOntopConfigurationElementsVisibility('Driver class', '#driverClass');
        testOntopConfigurationElementsVisibility('URL', '#url');
        testOntopConfigurationElementsVisibility('OBDA or R2RML file*', '#obdaFile');
        testOntopConfigurationElementsVisibility('Constraint file', '#constraintFile');
        testOntopConfigurationElementsVisibility('Ontology file', '#owlFile');
        //verify driver download url
        compareDriverDownloadUrl('https://docs.microsoft.com/en-us/sql/connect/jdbc/download-microsoft-jdbc-driver-for-sql-server');

        //Select DB2 driver type and verify elements and download url (if available)
        selectDatabaseDriver('DB2');
        getDatabaseDriver().should('contain', 'DB2');

        testOntopConfigurationElementsVisibility('Hostname*', '#hostName');
        testOntopConfigurationElementsVisibility('Port', '#port');
        testOntopConfigurationElementsVisibility('Database name*', '#databaseName');
        testOntopConfigurationElementsVisibility('Username*', '#userName');
        testOntopConfigurationElementsVisibility('Password', '#password');
        testOntopConfigurationElementsVisibility('Driver class', '#driverClass');
        testOntopConfigurationElementsVisibility('URL', '#url');
        testOntopConfigurationElementsVisibility('OBDA or R2RML file*', '#obdaFile');
        testOntopConfigurationElementsVisibility('Constraint file', '#constraintFile');
        testOntopConfigurationElementsVisibility('Ontology file', '#owlFile');
        //verify driver download url
        compareDriverDownloadUrl('https://www.ibm.com/support/pages/db2-jdbc-driver-versions-and-downloads');
    });

    it('should restart an existing repository', () => {

        createRepository();
        chooseRepositoryType(GDB_REPOSITORY_TYPE);

        cy.url().should('include', '/repository/create');

        // Create a repository by supplying only an identifier
        getRepositoryCreateForm().should('be.visible');
        getRepositoryIdField()
            .should('have.value', '')
            .type(repositoryId)
            .should('have.value', repositoryId);
        saveRepository();

        // Verify we are back at the setup page after saving
        cy.url().should((url) => {
            expect(url.endsWith('/repository')).to.equal(true);
        });

        //Make sure that repository is in status INACTIVE
        assertRepositoryStatus(repositoryId, "INACTIVE");

        getRepositoriesDropdown().click().within(() => {

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

        // Verify that the repositories are loaded
        // and only afterwards continue with the check
        cy.get('#wb-repositories-repositoryInGetRepositories .repository')
            .should('have.length.greaterThan', 0)
            .then(() => {
                assertRepositoryStatus(repositoryId, "RUNNING");
            })

        //Restart the repository
        restartRepository(repositoryId);
        confirmModal();
        //Check toast for RESTARTING status and repo row for RUNNING status
        getToast()
            .find('.toast-success')
            .should('be.visible')
            .and('contain', "Restarting repository " + repositoryId);

        assertRepositoryStatus(repositoryId, "RESTARTING");

        getToast().should('not.exist');

        assertRepositoryStatus(repositoryId, "RUNNING");
    });

    it('should create SHACL repo and test shapes validation', () => {
        //Prepare repository by enabling SHACL
        createRepository();
        chooseRepositoryType(GDB_REPOSITORY_TYPE);
        cy.url().should('include', '/repository/create/');
        typeRepositoryId(repositoryId);
        getSHACLRepositoryCheckbox().check();
        saveRepository();
        selectRepoFromDropdown(repositoryId);

        //Import a shape in the SHACL graph
        ImportSteps.visitUserImport(repositoryId);
        ImportSteps
            .openImportTextSnippetDialog()
            .fillRDFTextSnippet(SHACL_SHAPE_DATA)
            .selectRDFFormat("TriG")
            .clickImportTextSnippetButton()
            .importFromSettingsDialog()
            .verifyImportStatus('Text snippet', 'Imported successfully');
        //Import data that conforms with the shape - import is successfull
        ImportSteps
            .openImportTextSnippetDialog()
            .fillRDFTextSnippet(SHACL_CORRECT_DATA)
            .selectRDFFormat("Turtle")
            .clickImportTextSnippetButton()
            .importFromSettingsDialog()
            .verifyImportStatus('Text snippet', 'Imported successfully');
        //Import data that does not conform with the shape - GraphDBShaclSailValidationException
        ImportSteps
            .openImportTextSnippetDialog()
            .fillRDFTextSnippet(SHACL_INCORRECT_DATA)
            .selectRDFFormat("Turtle")
            .clickImportTextSnippetButton()
            .importFromSettingsDialog()
            .verifyImportStatus('Text snippet', 'org.eclipse.rdf4j.sail.shacl.GraphDBShaclSailValidationException: Failed SHACL validation');
    });

    function assertRepositoryStatus(repositoryId, status) {
        cy.waitUntil(() =>
            getRepositoryFromList(repositoryId)
                .should('be.visible')
                .find('.repository-status .text-secondary')
                .then($el => $el)
                .then($el => $el && $el.text() === status));
    }

    function getRepositoriesList() {
        return cy.get(REPO_LIST_ID);
    }

    function getLocationsList() {
        return cy.get('#wb-locations-locationInGetLocations')
            .find('tr.location')
            .should('have.length', 1)
            .and('contain', 'Repositories from: ')
            .and('contain', 'Local');
    }

    function getRepositoryFromList(repository) {
        return getRepositoriesList()
            .find('.repository')
            .contains(repository)
            // Return the whole repo row
            .closest('.repository');
    }

    function getRepositoryConnectionOffBtn(id) {
        return getRepositoryFromList(id).find('.icon-connection-off');
    }

    function getRepositoryConnectionOnBtn(id) {
        return getRepositoryFromList(id).find('.icon-connection-on');
    }

    function editRepository(repositoryId) {
        clickRepositoryIcon(repositoryId, '.repository-actions .edit-repository-btn');
    }

    function restartRepository(repositoryId) {
        clickRepositoryIcon(repositoryId, '.repository-actions .restart-repository-btn');
    }

    function clickRepositoryIcon(repositoryId, selector) {
        getRepositoryFromList(repositoryId)
            .should('be.visible')
            .find(selector)
            // Forcefully clicking it due to https://github.com/cypress-io/cypress/issues/695
            .should('be.visible')
            .and('not.be.disabled')
            .click({force: true});
    }

    function getCreateRepositoryButton() {
        return cy.get('#wb-repositories-addRepositoryLink');
    }

    function createRepository() {
        getCreateRepositoryButton().click();
    }

    function getRepositoryTypeButton(type) {
        if (type) {
            return cy.get('#repository-type-' + type + '-btn');
        } else {
            return cy.get('.create-repo-btn').first();
        }
    }

    function chooseRepositoryType(type) {
        getRepositoryTypeButton(type).click();
    }

    function getRepositoriesDropdown() {
        return cy.get('#repositorySelectDropdown')
            .scrollIntoView()
            .should('be.visible');
    }

    function getRepositoryCreateForm() {
        return cy.get('#newRepoForm');
    }

    function getRepositoryIdField() {
        return getRepositoryCreateForm().find('#id');
    }

    function typeRepositoryId(id) {
        getRepositoryIdField().type(id);
    }

    function getRepositoryTitleField() {
        return getRepositoryCreateForm().find('#title');
    }

    function typeRepositoryTitle(title) {
        getRepositoryTitleField().clear().type(title);
    }

    function getRepositoryRulesetMenu() {
        return getRepositoryCreateForm().find('#ruleset');
    }

    function getRepositoryDisableSameAsCheckbox() {
        return getRepositoryCreateForm().find('#disableSameAs');
    }

    function getRepositoryBaseURLField() {
        return getRepositoryCreateForm().find('#baseURL');
    }

    function typeRepositoryBaseURL(baseURL) {
        return getRepositoryBaseURLField().clear().type(baseURL);
    }

    function getRepositoryContextIndexCheckbox() {
        return getRepositoryCreateForm().find('#enableContextIndex');
    }

    function getSaveRepositoryButton() {
        return cy.get('#addSaveRepository');
    }

    function saveRepository() {
        getSaveRepositoryButton().click();
        waitLoader();
    }

    function waitLoader() {
        cy.get('.ot-loader').should('not.be.visible');
    }

    function selectRepoFromDropdown(repositoryId) {
        getRepositoriesDropdown()
            .click()
            .find('.dropdown-menu-right .dropdown-item')
            .contains(repositoryId)
            .closest('a')
            // Force the click because Cypress sometimes determines that the item has 0x0 dimensions
            .click({force: true});
    }

    function confirmModal() {
        cy.get('.modal')
            .should('be.visible')
            .and('not.have.class', 'ng-animate')
            .find('.modal-footer .btn-primary')
            .click();
    }

    function getToast() {
        return cy.get('#toast-container');
    }

    function getRepositoryTypeDropdown() {
        return cy.get('#type');
    }

    function getOBDAFileField() {
        return cy.get('div').contains("OBDA or R2RML file*");
    }

    function getOntologyFileField() {
        return cy.get('div').contains("Ontology file");
    }

    function getPropertiesFileField() {
        return cy.get('div').contains("JDBC properties file*");
    }

    function getConstraintFileField() {
        return cy.get('div').contains("Constraint file");
    }

    function getOBDAUploadButton() {
        return cy.get('span[for="obdaFile"]').contains("Upload file...");
    }

    function getOntologyUploadButton() {
        return cy.get('span[for="owlFile"]').contains("Upload file...");
    }

    function getPropertiesUploadButton() {
        return cy.get('span[for="propertiesFile"]').contains("Upload file...");
    }

    function getConstraintUploadButton() {
        return cy.get('span[for="constraintFile"]').contains("Upload file...");
    }

    function getOntopFunctionalityDisabledMessage() {
        return cy.get('.repository-errors div.alert')
            .should('be', 'visible')
            .and('contain', 'Some functionalities are not available because')
            .and('contain', ' is read-only Virtual Repository');
    }

    function getOntopContentConfiguration() {
        return cy.get('#ontop-content');
    }

    function getDatabaseDriver(){
        return cy.get('#driverType');
    }

    function selectDatabaseDriver(driverType) {
        getDatabaseDriver()
            .select(driverType);
    }

    function testOntopConfigurationElementsVisibility(param, idValue) {
        getOntopContentConfiguration()
            .find('.row.indented-div label')
            .contains(param)
            .next()
            .within(() => {
                cy.get(idValue)
                    .should('be.visible');
            });
    }

    function compareDriverDownloadUrl(expectedUrl){
        cy.get('.uri')
            .should('be.visible')
            .and('have.attr', 'href')
            .and('contain', expectedUrl);
    }

    function getSHACLRepositoryCheckbox(){
        return cy.get('#isShacl');
    }
});
