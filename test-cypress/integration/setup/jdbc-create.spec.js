import {JdbcSteps} from "../../steps/setup/jdbc-steps";
import {JdbcCreateSteps} from "../../steps/setup/jdbc-create-steps";
import {ToasterSteps} from "../../steps/toaster-steps";
import {YasrSteps} from "../../steps/yasgui/yasr-steps";
import {LoaderSteps} from "../../steps/loader-steps";
import {ModalDialogSteps} from "../../steps/modal-dialog-steps";
import {YasqeSteps} from "../../steps/yasgui/yasqe-steps";
import {MainMenuSteps} from "../../steps/main-menu-steps";
import ImportSteps from "../../steps/import-steps";
import {RepositorySelectorSteps} from "../../steps/repository-selector-steps";

const FILE_TO_IMPORT = '200-row-allianz.ttl';
const DEFAULT_QUERY = 'PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>\n' +
    '\n' +
    '# Selects two variables to use as columns\n' +
    'SELECT ?id ?label {\n' +
    '    ?id rdfs:label ?label\n' +
    '    # The following placeholder must be present in the query\n' +
    '    #!filter\n' +
    '}';

describe('JDBC configuration', () => {

    let repositoryId;
    let secondRepositoryId;

    beforeEach(() => {
        repositoryId = 'jdbc-repo-' + Date.now();
        cy.createRepository({id: repositoryId});
        cy.presetRepository(repositoryId);
        secondRepositoryId = 'jdbc-repo-second-repo' + Date.now();
        cy.createRepository({id: secondRepositoryId});
        cy.importServerFile(repositoryId, FILE_TO_IMPORT);
        JdbcCreateSteps.visit();
    });

    afterEach(() => {
        cy.deleteRepository(repositoryId);
        cy.deleteRepository(secondRepositoryId);
    });

    it('should not allow preview if query is invalid or column are not selected', () => {
        // When I open the create JDBC configuration page,
        // and click on "Preview" button.
        JdbcCreateSteps.clickOnPreviewButton();

        // Then I expect to see error notification,
        ToasterSteps.verifyError('Please define at least one column');
        // and "Column type" tab to be opened,
        JdbcCreateSteps.getActiveTab().contains('Column types');
        // and two columns to be suggested.
        JdbcCreateSteps.getColumnSuggestionRows().should('have.length', 2);

        // When I click "Preview" again.
        JdbcCreateSteps.clickOnPreviewButton();

        // Then I expect to see loader,
        LoaderSteps.verifyMessage('Preview of first 100 rows of table');
        // and see the generated preview.
        YasrSteps.getResults().should('be.visible');
    });

    it('should contains exactly columns in preview than selected in Columns type tag', () => {
        // When I open the create JDBC configuration page,
        JdbcCreateSteps.openColumnTypesTab();
        // waite columns to be suggested,
        JdbcCreateSteps.getColumnSuggestionRows().should('have.length', 2);
        // and make preview on default query.
        JdbcCreateSteps.clickOnPreviewButton();

        // Then I expect to see three columns. One for index and others are from the query.
        YasrSteps.getResultRowCells(1).should('have.length', 3);

        // When I try to remove a column.
        JdbcCreateSteps.openColumnTypesTab();
        JdbcCreateSteps.clickOnDeleteColumnButton();

        // Then I expect to be asked to confirm deletion of the column.
        ModalDialogSteps.verifyDialogBody('Are you sure you want to delete the column \'id\'?');

        // When I click on cancel button.
        ModalDialogSteps.clickOnCancelButton();

        // Then I expect the column not be deleted.
        JdbcCreateSteps.getColumnSuggestionRows().should('have.length', 2);

        // When I try to remove a column.
        JdbcCreateSteps.openColumnTypesTab();
        JdbcCreateSteps.clickOnDeleteColumnButton();

        // Then I expect to be asked to confirm deletion of the column.
        ModalDialogSteps.verifyDialogBody('Are you sure you want to delete the column \'id\'?');

        // When I click on close button.
        ModalDialogSteps.clickOnCloseButton();

        // Then I expect the column not be deleted.
        JdbcCreateSteps.getColumnSuggestionRows().should('have.length', 2);

        // When I remove a column.
        JdbcCreateSteps.openColumnTypesTab();
        JdbcCreateSteps.clickOnDeleteColumnButton();

        // Then I expect to be asked to confirm deletion of the column.
        ModalDialogSteps.verifyDialogBody('Are you sure you want to delete the column \'id\'?');

        // When I click on confirm button.
        ModalDialogSteps.clickOnConfirmButton();

        // Then I expect the column be deleted.
        JdbcCreateSteps.getColumnSuggestionRows().should('have.length', 1);

        // When I click on preview button.
        JdbcCreateSteps.clickOnPreviewButton();

        // Then I expect to see two columns. One for index and one from the query.
        YasrSteps.getResultRowCells(1).should('have.length', 2);
    });

    it('should suggests me all columns when I click on suggest button', () => {
        // When I open the create JDBC configuration page,
        JdbcCreateSteps.openColumnTypesTab();
        // waite columns to be suggested,
        JdbcCreateSteps.getColumnSuggestionRows().should('have.length', 2);
        // When I remove all columns.
        JdbcCreateSteps.clickOnDeleteColumnButton(0);
        ModalDialogSteps.clickOnConfirmButton();
        JdbcCreateSteps.clickOnDeleteColumnButton(0);
        ModalDialogSteps.clickOnConfirmButton();
        JdbcCreateSteps.getColumnSuggestionRows().should('have.length', 0);

        // When I click on "Suggest" button.
        JdbcCreateSteps.clickOnSuggestButton();
        // Then I expect all columns to be suggested without confirmation.
        JdbcCreateSteps.getColumnSuggestionRows().should('have.length', 2);

        // When I click on "Suggest" button when there are selected columns.
        JdbcCreateSteps.clickOnDeleteColumnButton(0);
        ModalDialogSteps.clickOnConfirmButton();
        JdbcCreateSteps.getColumnSuggestionRows().should('have.length', 1);
        JdbcCreateSteps.clickOnSuggestButton();

        // Then I expect to be asked to confirm the suggestion.
        ModalDialogSteps.verifyDialogBody('Are you sure you want to get suggestions for all columns? This action will overwrite all column type mappings!');

        // When I click on close button.
        ModalDialogSteps.clickOnCloseButton();

        // Then I expect suggestion to not be applied.
        JdbcCreateSteps.getColumnSuggestionRows().should('have.length', 1);

        // When I click on "Suggestion" button.
        JdbcCreateSteps.clickOnSuggestButton();

        // Then I expect to be asked to confirm the suggestion.
        ModalDialogSteps.verifyDialogBody('Are you sure you want to get suggestions for all columns? This action will overwrite all column type mappings!');

        // When I click on cancel button.
        ModalDialogSteps.clickOnCancelButton();

        // Then I expect suggestion to not be applied.
        JdbcCreateSteps.getColumnSuggestionRows().should('have.length', 1);

        // When I click on "Suggestion" button.
        JdbcCreateSteps.clickOnSuggestButton();

        // Then I expect to be asked to confirm the suggestion.
        ModalDialogSteps.verifyDialogBody('Are you sure you want to get suggestions for all columns? This action will overwrite all column type mappings!');

        // When I click on confirm button.
        ModalDialogSteps.clickOnConfirmButton();

        // Then I expect suggestion to not be applied.
        JdbcCreateSteps.getColumnSuggestionRows().should('have.length', 2);
    });

    it('should not allow configuration to be saved if some of required fields are not filled', () => {
        // When I open the create JDBC configuration page,
        // and try to save the configuration.
        JdbcCreateSteps.clickOnSave();

        // Then I expect to see error message describes that configuration name is required.
        JdbcCreateSteps.getJdbcConfigurationNameIsRequired().should('be.visible');
        JdbcCreateSteps.getJdbcConfigurationNameIsRequired().contains('SQL table name is required');

        // When I type the name of the configuration,
        JdbcCreateSteps.typeTableName('Test table name');
        // and type wrong query,
        YasqeSteps.pasteQuery('Wrong query');
        // and try to save configuration.
        JdbcCreateSteps.clickOnSave();

        // Then I expect to see error message described that the query must be select query.
        JdbcCreateSteps.getInvalidQueryMode().should('be.visible');
        JdbcCreateSteps.getInvalidQueryMode().contains('The data query must be a SELECT query');

        // When I type wrong select query
        YasqeSteps.pasteQuery('Select * where {?s ?p ?o ?g}');
        // and try to save the configuration
        JdbcCreateSteps.clickOnSave();

        // Then I expect to see error message described that the query is not valid.
        JdbcCreateSteps.getInvalidQuery().should('be.visible');
        JdbcCreateSteps.getInvalidQuery().contains('Invalid query');

        // When I type correct select query
        YasqeSteps.pasteQuery(DEFAULT_QUERY);
        // and try to save the configuration
        JdbcCreateSteps.clickOnSave();

        // Then I expect to see error message
        ToasterSteps.verifyError('Please define at least one column');
    });

    it('should not display confirm message when if the fields of configuration are not changed', () => {
        // When I open the create JDBC configuration page,
        // and try to change page
        JdbcSteps.visit();

        // Then I expect the new page is loaded.
        JdbcSteps.verifyUrl();
    });


    it('should display confirm message when configuration name is changed', () => {
        // When I open the create JDBC configuration page,
        // type configuration name,
        JdbcCreateSteps.typeTableName('Configuration name');
        JdbcCreateSteps.getJDBCConfigNameField().should('have.value', 'Configuration name');
        ModalDialogSteps.verifyUrlChangedConfirmation('You have unsaved changes. Are you sure that you want to exit?');
    });

    it('should display confirm message when the configuration query data is changed', () => {
        // When I open the create JDBC configuration page,
        // type and change the query,
        YasqeSteps.writeInEditor("Some changes");
        ModalDialogSteps.verifyUrlChangedConfirmation('You have unsaved changes. Are you sure that you want to exit?');
    });

    it('should display confirm message when the selected columns are changed', () => {
        // When I open the create JDBC configuration page,
        // and change selected columns.
        JdbcCreateSteps.openColumnTypesTab();
        JdbcCreateSteps.clickOnDeleteColumnButton(0);
        ModalDialogSteps.clickOnConfirmButton();
        ModalDialogSteps.verifyUrlChangedConfirmation('You have unsaved changes. Are you sure that you want to exit?');
    });

    it('should display confirm message when try to change the repository', () => {
        // When I open a configuration for edit,
        createConfigurationAndOpenInEdit('Test table');
        // Make some changes
        YasqeSteps.writeInEditor('Make changes');

        // When I try to change the selected repository.
        RepositorySelectorSteps.selectRepository(secondRepositoryId);

        // Then I expect to be asked to confirm changing of repository.
        ModalDialogSteps.verifyDialogBody('You have unsaved changes. Are you sure that you want to exit?');

        // When I click on close button.
        ModalDialogSteps.clickOnCloseButton();

        // Then I expect to stay on same page
        JdbcCreateSteps.verifyUrl();

        // When I try to change the selected repository.
        RepositorySelectorSteps.selectRepository(secondRepositoryId);

        // Then I expect to be asked to confirm changing of repository.
        ModalDialogSteps.verifyDialogBody('You have unsaved changes. Are you sure that you want to exit?');

        // When I click on cancel button.
        ModalDialogSteps.clickOnCancelButton();

        // Then I expect to stay on same page
        JdbcCreateSteps.verifyUrl();

        // When I try to change the selected repository.
        RepositorySelectorSteps.selectRepository(secondRepositoryId);

        // Then I expect to be asked to confirm changing of repository.
        ModalDialogSteps.verifyDialogBody('You have unsaved changes. Are you sure that you want to exit?');

        // When I click on confirm button.
        ModalDialogSteps.clickOnConfirmButton();

        // Then I expect to stay on same page
        JdbcSteps.verifyUrl();
    });

    function createConfigurationAndOpenInEdit(tableName) {
        JdbcSteps.visit();
        // Creates a configuration.
        JdbcSteps.clickOnCreateJdbcConfigurationButton();
        YasqeSteps.waitUntilQueryIsVisible();
        JdbcCreateSteps.typeTableName(tableName);
        JdbcCreateSteps.openColumnTypesTab();
        // waite selected column to be loaded.
        JdbcCreateSteps.getColumnSuggestionRows().should('have.length', 2);
        JdbcCreateSteps.clickOnSave();

        ToasterSteps.verifySuccess('SQL table configuration saved');

        // Opens created configuration for edit.
        JdbcSteps.clickOnEditButton(0);
    }
});
