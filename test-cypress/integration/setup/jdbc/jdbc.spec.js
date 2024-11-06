import {JdbcSteps} from "../../../steps/setup/jdbc-steps";
import {JdbcCreateSteps} from "../../../steps/setup/jdbc-create-steps";
import {ModalDialogSteps} from "../../../steps/modal-dialog-steps";
import {YasqeSteps} from "../../../steps/yasgui/yasqe-steps";
import {JdbcStubs} from "../../../stubs/jdbc/jdbc-stubs";
import {ApplicationSteps} from "../../../steps/application-steps";

const FILE_TO_IMPORT = '200-row-allianz.ttl';

// The closing brace is intentionally omitted because when cypress types in the query, the editor will automatically add it.
const EDIT_QUERY = `
    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
    SELECT ?id ?label {
        ?id rdfs:label ?label
        #!filter
`;

describe('JDBC configuration', () => {

    let repositoryId;

    beforeEach(() => {
        repositoryId = 'jdbc-repo-' + Date.now();
        cy.createRepository({id: repositoryId});
        cy.presetRepository(repositoryId);
        cy.importServerFile(repositoryId, FILE_TO_IMPORT);
        JdbcSteps.visit();
    });

    afterEach(() => {
        cy.deleteRepository(repositoryId);
    });

    it('Should be able to cancel JDBC configuration creation', () => {
        // When I am on JDBC configurations page and click on create a new table configuration button.
        JdbcSteps.clickOnCreateJdbcConfigurationButton();

        // Then I expect to  be redirected to create JDBC configuration page.
        JdbcCreateSteps.verifyUrl();

        // When I fill correct data,
        JdbcCreateSteps.typeTableName('JdbcTest');
        JdbcCreateSteps.openColumnTypesTab();

        // And click on cancel button.
        JdbcCreateSteps.clickOnCancel();

        // Then, I expect to be asked to confirm the cancellation.
        // When I confirm
        ModalDialogSteps.clickOnConfirmButton();

        // Then I expect to be redirected to Jdbc configurations page,
        JdbcSteps.verifyUrl();
        // and the configuration to not be created.
        JdbcSteps.getJDBCConfigurations().should('contain', 'No tables are defined');
    });

    it.only('Should create a new JDBC configuration, edit, preview, then delete', () => {
        // When I am on JDBC configurations page and click on create a new table configuration button.
        JdbcSteps.clickOnCreateJdbcConfigurationButton();

        // Then I expect to  be redirected to create JDBC configuration page.
        JdbcCreateSteps.verifyUrl();

        // When I fill correct data,
        JdbcCreateSteps.typeTableName('JdbcTest');
        // and columns are selected.
        JdbcCreateSteps.openColumnTypesTab();
        JdbcCreateSteps.getColumnSuggestionRows().should('have.length', 2);

        // And click on save button.
        JdbcCreateSteps.clickOnSave();

        // Then I expect to be redirected to Jdbc configurations page,
        JdbcSteps.verifyUrl();
        // and the configuration not be created.
        JdbcSteps.getJDBCConfigurationResults().should('have.length', 1);

        // When I click on edit button,
        JdbcSteps.clickOnEditButton();
        // change the query,
        YasqeSteps.clearEditor();
        YasqeSteps.pasteQuery(EDIT_QUERY);
        // and click on save button.
        JdbcCreateSteps.clickOnSave();

        // Then I expect to be redirected to JDBC configurations page.
        JdbcSteps.verifyUrl();

        // When I click on delete button.
        JdbcSteps.clickOnDeleteButton();

        // Then I expect to be asked to confirm the deletion,
        // and click on close dialog button.
        ModalDialogSteps.clickOnCloseButton();

        // Then I expect configuration to not be deleted.
        JdbcSteps.getJDBCConfigurationResults().should('have.length', 1);

        // When I click on delete button.
        JdbcSteps.clickOnDeleteButton();

        // Then I expect to be asked to confirm the deletion,
        // and click on cancel dialog button.
        ModalDialogSteps.clickOnCancelButton();

        // Then I expect configuration to not be deleted.
        JdbcSteps.getJDBCConfigurationResults().should('have.length', 1);

        // When I click on delete button.
        JdbcSteps.clickOnDeleteButton();

        // Then I expect to be asked to confirm the deletion,
        // and when click on confirm dialog button.
        ModalDialogSteps.clickOnConfirmButton();

        // Then I expect the configuration to be deleted.
        JdbcSteps.getJDBCConfigurations().should('contain', 'No tables are defined');
    });

    it('Should show error notification on server error during jdbc configuration creation', () => {
        // Given that the server will return an error on saving the JDBC configuration
        JdbcStubs.stubJdbcCreateError();
        // And I have configured a new JDBC configuration
        JdbcSteps.clickOnCreateJdbcConfigurationButton();
        JdbcCreateSteps.verifyUrl();
        JdbcCreateSteps.typeTableName('JdbcTest');
        JdbcCreateSteps.openColumnTypesTab();
        JdbcCreateSteps.getColumnSuggestionRows().should('have.length', 2);
        // When I click on save button.
        JdbcCreateSteps.clickOnSave();
        // Then I expect to see a notification with the error message.
        ApplicationSteps.getErrorNotifications().should('contain', 'Could not save SQL table configuration');
        // And the configuration to not be created.
        cy.url().should('include', '/jdbc/configuration/create');
        JdbcCreateSteps.getSaveButton().should('be.visible').and('be.enabled');
    });

    it('Should show error notification on server error during jdbc configuration creation', () => {
        // Given that the server will return an error on saving the JDBC configuration
        JdbcStubs.stubJdbcUpdateError();
        // And I have configured and saved a new JDBC configuration
        JdbcSteps.clickOnCreateJdbcConfigurationButton();
        JdbcCreateSteps.verifyUrl();
        JdbcCreateSteps.typeTableName('JdbcTest2');
        JdbcCreateSteps.openColumnTypesTab();
        JdbcCreateSteps.getColumnSuggestionRows().should('have.length', 2);
        JdbcCreateSteps.clickOnSave();
        JdbcSteps.verifyUrl();
        JdbcSteps.getJDBCConfigurationResults().should('have.length', 1);
        // When I edit the configuration
        JdbcSteps.clickOnEditButton();
        YasqeSteps.clearEditor();
        YasqeSteps.pasteQuery(EDIT_QUERY);
        // And click on save button.
        JdbcCreateSteps.clickOnSave();
        // Then I expect to see a notification with the error message.
        ApplicationSteps.getErrorNotifications().should('contain', 'Could not save SQL table configuration');
    });
});
