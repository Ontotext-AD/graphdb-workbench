import {SparqlCreateUpdateSteps} from "../../steps/setup/sparql-create-update-steps";
import {YasqeSteps} from "../../steps/yasgui/yasqe-steps";
import ImportSteps from "../../steps/import-steps";
import {ModalDialogSteps} from "../../steps/modal-dialog-steps";
import {MainMenuSteps} from "../../steps/main-menu-steps";
import {RepositorySelectorSteps} from "../../steps/repository-selector-steps";
import {SparqlTemplatesSteps} from "../../steps/setup/sparql-templates-steps";

describe('SPARQL create template', () => {

    let repositoryId;
    let secondRepositoryId;

    beforeEach(() => {
        repositoryId = 'sparql-templates-repo' + Date.now();
        cy.createRepository({id: repositoryId});
        cy.presetRepository(repositoryId);
        secondRepositoryId = 'sparql-templates-second-repo' + Date.now();
        cy.createRepository({id: secondRepositoryId});
        SparqlCreateUpdateSteps.visit();
    });

    afterEach(() => {
        cy.deleteRepository(repositoryId);
        cy.deleteRepository(secondRepositoryId);
    });

    it('should has error message described that query is invalid', {
        retries: {
            runMode: 1,
            openMode: 0
        }
    }, () => {
        // When I visit 'Sparql create template' view,
        // and fill  valid template id.
        SparqlCreateUpdateSteps.typeTemplateId('http://test');

        // When I fill invalid query (select for example).
        YasqeSteps.pasteQuery('select * where {?s ?p }');
        // and click on "Save" button.
        SparqlCreateUpdateSteps.clickOnSaveButton();

        // Then I expect to see error message.
        SparqlCreateUpdateSteps.getInvalidQueryElement().contains('Invalid query');
    });

    it('should display confirm dialog I am updating a sparql template and change the repository', {
        retries: {
            runMode: 1,
            openMode: 0
        }
    }, () => {
        // When I visit 'Sparql create template' view,
        // create a SPARQL template
        const templateId = 'http://' + Date.now();
        SparqlCreateUpdateSteps.typeTemplateId(templateId);
        SparqlCreateUpdateSteps.clickOnSaveButton();
        SparqlTemplatesSteps.verifyUrl();
        // and open it for edit.
        SparqlCreateUpdateSteps.visit(templateId);

        // When I change the repository.
        RepositorySelectorSteps.selectRepository(secondRepositoryId);

        // Then I expect to be redirected to sparql templates view.
        SparqlTemplatesSteps.verifyUrl();

        // When I open a sparql template for edit,
        RepositorySelectorSteps.selectRepository(repositoryId);
        SparqlCreateUpdateSteps.visit(templateId);

        // and edit the query,
        YasqeSteps.writeInEditor('query changed');
        // and try to change the selected repository.
        RepositorySelectorSteps.selectRepository(secondRepositoryId);

        // Then I expect to see confirm dialog.
        ModalDialogSteps.getDialogHeader().contains('Confirm');
        ModalDialogSteps.getDialogBody().contains('You have unsaved changes. Are you sure that you want to exit?');

        // When I confirm.
        ModalDialogSteps.clickOnConfirmButton();

        // Then I expect to be navigated to sparql templates view.
        SparqlTemplatesSteps.verifyUrl();

        // When I open a sparql template for edit,
        RepositorySelectorSteps.selectRepository(repositoryId);
        SparqlCreateUpdateSteps.visit(templateId);
        // and edit the query,
        YasqeSteps.writeInEditor('query changed');
        // and try to change the selected repository.
        RepositorySelectorSteps.selectRepository(secondRepositoryId);

        // Then I expect to see confirm dialog.
        ModalDialogSteps.getDialogHeader().contains('Confirm');
        ModalDialogSteps.getDialogBody().contains('You have unsaved changes. Are you sure that you want to exit?');

        // When I cancel.
        ModalDialogSteps.clickOnCancelButton();

        // Then I expect the view and repository not changed,
        SparqlCreateUpdateSteps.verifyUrl();
        RepositorySelectorSteps.getSelectedRepository().contains(repositoryId);

        // When I close the dialog.
        RepositorySelectorSteps.selectRepository(secondRepositoryId);
        ModalDialogSteps.clickOnCloseButton();

        // Then I expect the view and repository not changed,
        SparqlCreateUpdateSteps.verifyUrl();
        RepositorySelectorSteps.getSelectedRepository().contains(repositoryId);
    });

    it('should confirm me before navigate when query is changed', {
        retries: {
            runMode: 1,
            openMode: 0
        }
    }, () => {
        // When I visit 'Sparql create template' view,
        // and change the query in ontotext-yasgui editor.
        // When I fill non update query (select for example).
        YasqeSteps.writeInEditor('change query');

        // When I try to navigate to other view
        MainMenuSteps.clickOnMenu('Import');

        // Then I expect to see confirm dialog inform me that there are unsaved changes.
        ModalDialogSteps.getDialogHeader().contains('Confirm');
        ModalDialogSteps.getDialogBody().contains('You have unsaved changes. Are you sure that you want to exit?');

        // When I click on confirm button.
        ModalDialogSteps.clickOnConfirmButton();

        // Then I expect to be navigated to other view.
        ImportSteps.verifyUserImportUrl();
    });
});
