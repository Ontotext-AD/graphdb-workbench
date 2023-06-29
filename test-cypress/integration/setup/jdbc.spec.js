import {JdbcSteps} from "../../steps/setup/jdbc-steps";
import {JdbcCreateSteps} from "../../steps/setup/jdbc-create-steps";
import {ModalDialogSteps} from "../../steps/modal-dialog-steps";
import {YasqeSteps} from "../../steps/yasgui/yasqe-steps";

const FILE_TO_IMPORT = '200-row-allianz.ttl';
const EDIT_QUERY = "PREFIX ex:<http://example.com/#>\n" +
    "PREFIX base:<http://example/base/>\n" +
    "PREFIX rdfs:<http://www.w3.org/2000/01/rdf-schema#>\n" +
    "PREFIX rdf:<http://www.w3.org/1999/02/22-rdf-syntax-ns#>\n" +
    "PREFIX foaf: <http://xmlns.com/foaf/0.1/>\n" +
    "\n" +
    "select ?id ?fraud_score ?customer_loyalty where { \n" +
    "\t?id rdf:type ex:Customer;\n" +
    "      \tex:fraudScore ?fraud_score;\n" +
    "       \tex:customerLoyalty ?customer_loyalty_id.\n" +
    "    ?customer_loyalty_id rdfs:label ?customer_loyalty.\n" +
    "    # !filter\n" +
    "}  ";

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

it('Should not create a new JDBC configuration click on cancel button', () => {
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

it('Should create a new JDBC configuration, edit, preview, then delete', () => {
        // When I am on JDBC configurations page and click on create a new table configuration button.
        JdbcSteps.clickOnCreateJdbcConfigurationButton();

        // Then I expect to  be redirected to create JDBC configuration page.
    JdbcCreateSteps.verifyUrl();

        // When I fill correct data,
    JdbcCreateSteps.typeTableName('JdbcTest');
        JdbcCreateSteps.openColumnTypesTab();

        // And click on save button.
    JdbcCreateSteps.clickOnSave();

        // Then I expect to be redirected to Jdbc configurations page,
    JdbcSteps.verifyUrl();
        // and the configuration not be created.
        JdbcSteps.getJDBCConfigurationResults().should('have.length', 1);

        // When I click on edit button,
        JdbcSteps.clickOnEditButton();
    // change the query,
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
        // and click on cancel dialog button.
        ModalDialogSteps.clickOnCancelButton();

        // When I click on delete button.
        JdbcSteps.clickOnDeleteButton();

        // Then I expect to be asked to confirm the deletion,
        // and when click on confirm dialog button.
        ModalDialogSteps.clickOnConfirmButton();

        // Then I expect the configuration to be deleted.
        JdbcSteps.getJDBCConfigurations().should('contain', 'No tables are defined');
    });

});
