import {RepositorySteps} from "../../steps/repository-steps";
import {OntopRepositorySteps} from "../../steps/ontop-repository-steps";
import {ToasterSteps} from "../../steps/toaster-steps";
import {RepositoriesStubs as RepositoryStubs} from "../../stubs/repositories/repositories-stubs";
import {ModalDialogSteps} from "../../steps/modal-dialog-steps";

describe('Ontop repositories', () => {
    let repositoryId;
    beforeEach(() => {
        repositoryId = 'repo-' + Date.now();
    });

    afterEach(() => {
        cy.deleteRepository(repositoryId);
    });

    //Check that 'Ontop' type repository is available and that the configuration fields are present and active.
    it('should check if Ontop repository type is available', () => {
        RepositorySteps.visit();
        RepositorySteps.getCreateRepositoryButton().click();
        RepositorySteps.getRepositoryTypeButton('ontop').should('be.visible');
        RepositorySteps.chooseRepositoryType('ontop');
        cy.url().should('include', '/repository/create/ontop');

        OntopRepositorySteps.getOBDAFileField().should('be.visible');
        OntopRepositorySteps.getOntologyFileField().should('be.visible');
        OntopRepositorySteps.getConstraintFileField().should('be.visible');
        OntopRepositorySteps.getLensesFileField().should('be.visible');
        OntopRepositorySteps.getOBDAUploadButton().scrollIntoView().should('be.visible').and('not.be.disabled');
        OntopRepositorySteps.getOntologyUploadButton().scrollIntoView().should('be.visible').and('not.be.disabled');
        OntopRepositorySteps.getConstraintUploadButton().scrollIntoView().should('be.visible').and('not.be.disabled');
        OntopRepositorySteps.getLensesUploadButton().scrollIntoView().should('be.visible').and('not.be.disabled');
    });

    it('should not allow creating of repository if required fields are not filled', () => {
        // When I visit the create ontop page,
        OntopRepositorySteps.visitCreate();
        // and click on create button.
        OntopRepositorySteps.clickOnCreateRepositoryButton();

        // Then I expect to see error message that describes repository id field is empty,
        ToasterSteps.verifyError('Repository ID cannot be empty');
        // and test connection button to be disabled.
        OntopRepositorySteps.getTestConnectionButton().should('be.disabled');

        // When I fill repository id,
        RepositorySteps.getRepositoryIdField().type('ontop-repository-' + Date.now());
        // and click on create button.
        OntopRepositorySteps.clickOnCreateRepositoryButton();

        // Then I expect to see error message that describes driver class field is empty.
        ToasterSteps.verifyError('Missing required field \'Driver class\'');

        // When I fill driver class,
        OntopRepositorySteps.getDriverClassInput().type('org.test.some.DriverClass');
        // and click on create button.
        OntopRepositorySteps.clickOnCreateRepositoryButton();

        // Then I expect to see error message that describes url field is empty.
        ToasterSteps.verifyError('Missing required field \'JDBC URL\'');

        // When I fill url,
        OntopRepositorySteps.getUrlInput().type('url:to://database');
        // and click on create button.
        OntopRepositorySteps.clickOnCreateRepositoryButton();

        // Then I expect to see error message that describes obda file is not uploaded,
        ToasterSteps.verifyError('Missing required ontop repo file \'OBDA or R2RML file\'');
        // and test connection button to be enabled.
        OntopRepositorySteps.getTestConnectionButton().should('not.be.disabled');

        // When I select MySql database driver.
        OntopRepositorySteps.selectMySqlDatabase();

        // Then I expect
        // the driver class to be changed,
        OntopRepositorySteps.getDriverClassInput().should('have.value', 'com.mysql.cj.jdbc.Driver');
        // and url placeholder to contains MySql url template.
        OntopRepositorySteps.getUrlInput().should('have.attr', 'placeholder', 'jdbc:mysql://{hostport}/{database}');
        // and test connection button to be disabled.
        OntopRepositorySteps.getTestConnectionButton().should('be.disabled');

        // When I click on create repository button.
        OntopRepositorySteps.clickOnCreateRepositoryButton();

        // Then I expect to see error message that describes host name field is empty.
        ToasterSteps.verifyError('Missing required field \'Host name\'');

        const hostName = 'localhost';
        // When I fill the host name.
        OntopRepositorySteps.getHostNameInput().type(hostName);

        // Then I expect url to be filed with the host name.
        OntopRepositorySteps.getUrlInput().should('have.value', 'jdbc:mysql://localhost/{database}');

        // When I click on create repository button.
        OntopRepositorySteps.clickOnCreateRepositoryButton();

        // Then I expect to see error message that describes database name field is empty.
        ToasterSteps.verifyError('Missing required field \'Database name\'');

        // When I change the database driver for which the port field is required,
        OntopRepositorySteps.selectOracleDatabase();

        // Then I expect host name to be cleared,
        // and if click on create repository button.
        OntopRepositorySteps.clickOnCreateRepositoryButton();

        // Then I expect to see error message that describes host name field is empty.
        ToasterSteps.verifyError('Missing required field \'Host name\'');

        // When I fill host name,
        OntopRepositorySteps.getHostNameInput().type(hostName);

        // and click on create repository button.
        OntopRepositorySteps.clickOnCreateRepositoryButton();

        // Then I expect to see error message that describes database name field is empty.
        ToasterSteps.verifyError('Missing required field \'Port\'');

        // When I fill the port field.
        OntopRepositorySteps.getPortInput().type(5423);

        // Then I expect url to be filed with the host name and port.
        OntopRepositorySteps.getUrlInput().should('have.value', 'jdbc:oracle:thin:@localhost:5423:{database}');

        // When I click on create repository button.
        OntopRepositorySteps.clickOnCreateRepositoryButton();

        // Then I expect to see error message that describes database name field is empty.
        ToasterSteps.verifyError('Missing required field \'Database name\'');

        // When I fill database name field.
        OntopRepositorySteps.getDatabaseNameInput().type('database-name');

        // Then I expect url to be filed with the host name and port,
        OntopRepositorySteps.getUrlInput().should('have.value', 'jdbc:oracle:thin:@localhost:5423:database-name');
        // and test connection button to be enabled.
        OntopRepositorySteps.getTestConnectionButton().should('not.be.disabled');
    });

    it('should create ontop repository', () => {
        RepositoryStubs.stubRepoCreationEndpoints(repositoryId);
        // When I visit the create ontop page
        OntopRepositorySteps.visitCreate();
        // The test connection button should be disabled
        OntopRepositorySteps.getTestConnectionButton().should('be.disabled');
        // Then I fill the repository ID
        RepositorySteps.typeRepositoryId(repositoryId);
        // And I fill the driver class
        OntopRepositorySteps.typeDriverClass('org.test.some.DriverClass');
        // And I fill the URL
        RepositorySteps.typeURL('url:to://database');
        // The test connection button should be enabled
        OntopRepositorySteps.getTestConnectionButton().should('not.be.disabled');
        // When I select MySql database driver
        OntopRepositorySteps.selectMySqlDatabase();
        // Then I expect the driver class to be changed
        OntopRepositorySteps.getDriverClassInput().should('have.value', 'com.mysql.cj.jdbc.Driver');
        // The test connection button should be disabled
        OntopRepositorySteps.getTestConnectionButton().should('be.disabled');

        const hostName = 'localhost';
        // When I fill the host name
        OntopRepositorySteps.typeHostName(hostName);
        // Then I expect url to be filed with the host name
        OntopRepositorySteps.getUrlInput().should('have.value', 'jdbc:mysql://localhost/{database}');
        // When I change the database driver for which the port field is required
        OntopRepositorySteps.selectOracleDatabase();
        // When I fill the host name
        OntopRepositorySteps.typeHostName(hostName);
        // When I fill the port field
        OntopRepositorySteps.typePort(5423);
        // Then I expect the URL to be filed with the host name and port
        OntopRepositorySteps.getUrlInput().should('have.value', 'jdbc:oracle:thin:@localhost:5423:{database}');
        // When I fill the database name field
        OntopRepositorySteps.typeDatabaseName('database-name');
        // Then I expect the URL to be filed with the host name and port
        OntopRepositorySteps.getUrlInput().should('have.value', 'jdbc:oracle:thin:@localhost:5423:database-name');
        // And the test connection button to be enabled
        OntopRepositorySteps.getTestConnectionButton().should('not.be.disabled');
        // And I add an OBDA file
        OntopRepositorySteps.clickObdaFileUploadButton();
        OntopRepositorySteps.uploadObdaFile('fixtures/ontop/university-complete.obda');
        // When I click on create repository button
        OntopRepositorySteps.clickOnCreateRepositoryButton();
        // The Ontop repository should be created
        RepositorySteps.visit();
        // The repository list should contain the new repository, which can be activated
        RepositorySteps.clickRepositoryConnectionOffBtn(repositoryId);
        // When the repository is restarted
        RepositorySteps.restartRepository(repositoryId);
        ModalDialogSteps.getDialogBody().should('contain', repositoryId);
        RepositorySteps.confirmModal();
        // Then the correct messages are shown
        ToasterSteps.verifySuccess('Restarting repository ' + repositoryId);
        ToasterSteps.getToast().should('not.exist');
        RepositorySteps.assertRepositoryStatus(repositoryId, "ACTIVE");
        // And the repo icon remains Ontop
        RepositorySteps.getRepoIcon('ontop').should('be.visible');
    });

    it('should edit ontop repository', () => {
        RepositoryStubs.stubEditOntopResponse(repositoryId);
        RepositoryStubs.stubSaveOntopResponse(repositoryId);
        RepositoryStubs.stubRepoCreationEndpoints(repositoryId);
        // When I open the repositories view
        RepositorySteps.visit();
        // Then I should see an Ontop repository
        RepositorySteps.getRepositoriesList().should('have.length', 1);
        RepositorySteps.getRepoIcon('ontop').should('be.visible');
        // And I edit the Ontop repository
        RepositorySteps.editRepository(repositoryId);
        // Then I expect the repository to be opened for editing
        RepositorySteps.getRepositoryCreateForm();
        RepositorySteps.getRepositoryIdField().should('have.value', repositoryId);
        // When I add a username
        RepositorySteps.typeUsernameInEditRepo('Example');
        // When I fill the host name
        RepositorySteps.typeURL('jdbc:oracle:thin:@localhost:5423:database-name');
        // And save the changes
        RepositorySteps.clickSaveEditedRepo();
        ModalDialogSteps.clickOnConfirmButton();
        // The icon should still be Ontop
        RepositorySteps.getRepoIcon('ontop').should('be.visible');
    });

    it('should populate url when Snowflake driver is selected', () => {
        // When I open create ontop repository page,
        OntopRepositorySteps.visitCreate();
        // and chose the Snowflake driver
        OntopRepositorySteps.selectSnowflakeDatabase();
        const hostName = 'someHostName';
        const port = 1234;
        const databaseName = 'test_database';
        // When I enter all needed data to calculate the value of url.
        OntopRepositorySteps.getHostNameInput().type(hostName);
        OntopRepositorySteps.getPortInput().type(port);
        OntopRepositorySteps.getDatabaseNameInput().type(databaseName);

        // Then I expect url to be calculated properly
        OntopRepositorySteps.getUrlInput().should('have.value', 'jdbc:snowflake://someHostName.snowflakecomputing.com:1234/?warehouse=test_database');
    });
});
