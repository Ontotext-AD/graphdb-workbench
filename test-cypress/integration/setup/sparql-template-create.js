import {SparqlCreateUpdateSteps} from "../../steps/setup/sparql-create-update-steps";
import {YasqeSteps} from "../../steps/yasgui/yasqe-steps";
import ImportSteps from "../../steps/import/import-steps";
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

    it('should has error message described that template id is required', () => {
        // When I visit 'Sparql create template' view,
        // and click on "Save" button without to fill template id.
        SparqlCreateUpdateSteps.clickOnSaveButton();

        // Then I expect to see error message.
        SparqlCreateUpdateSteps.getRequiredErrorElement().contains('SPARQL template IRI is required');
    });

    it('should has error message described that template id is invalid', () => {
        // When I visit 'Sparql create template' view,
        // and fill an invalid template id,
        const invalidTemplateName = 'invalid-template-id';
        SparqlCreateUpdateSteps.typeTemplateId(invalidTemplateName);
        // and click on "Save" button without to fill template id.
        SparqlCreateUpdateSteps.clickOnSaveButton();

        // Then I expect to see error message.
        SparqlCreateUpdateSteps.getInvalidErrorElement().contains(`'${invalidTemplateName}' is not a valid IRI`);
    });

    it('should has error message described that query mode is invalid', () => {
        // When I visit 'Sparql create template' view,
        // and fill  valid template id.
        SparqlCreateUpdateSteps.typeTemplateId('http://test');

        // When I fill non update query (select for example).
        YasqeSteps.clearEditor();
        YasqeSteps.writeInEditor('select * where {?s ?p ?o}');
        // and click on "Save" button.
        SparqlCreateUpdateSteps.clickOnSaveButton();

        // Then I expect to see error message.
        SparqlCreateUpdateSteps.getInvalidQueryModeElement().contains('The template query must be an UPDATE query');
    });

    it('should navigate to other view if there are no changes', () => {
        // When I visit 'Sparql create template' view,
        // and navigate to other view.
        ImportSteps.visitUserImport(repositoryId);

        // Then I expect to be navigated without confirmation.
        ImportSteps.verifyUserImportUrl();
    });

    it('should confirm me before navigate when template id is changed', () => {
        // When I visit 'Sparql create template' view,
        // and set template id.
        SparqlCreateUpdateSteps.typeTemplateId('http://test');

        // When I try to navigate to other view
        MainMenuSteps.clickOnMenu('Import');

        // Then I expect to see confirm dialog inform me that there are unsaved changes.
        ModalDialogSteps.getDialogHeader().contains('Confirm');
        ModalDialogSteps.getDialogBody().contains('You have unsaved changes. Are you sure that you want to exit?');

        // When I click on close button
        ModalDialogSteps.clickOnCloseButton();

        // Then I expect to stay on current page
        SparqlCreateUpdateSteps.verifyUrl();

        // When I click on cancel button.
        MainMenuSteps.clickOnMenu('Import');
        ModalDialogSteps.clickOnCancelButton();

        // Then I expect to stay on current page
        SparqlCreateUpdateSteps.verifyUrl();

        // When I click on confirm button.
        MainMenuSteps.clickOnMenu('Import');
        ModalDialogSteps.clickOnConfirmButton();

        // Then I expect to be navigated to other view.
        ImportSteps.verifyUserImportUrl();
    });

    it('should not change the view if I am creating a new sparql template and change the repository', () => {
        // When I visit 'Sparql create template' view,
        // make some changes.
        SparqlCreateUpdateSteps.typeTemplateId('http://test');
        // When I change the repository.
        RepositorySelectorSteps.selectRepository(secondRepositoryId);
        // Then I expect the view not changed
        SparqlCreateUpdateSteps.verifyUrl();
        // And I expect to see a confirmation dialog.
        ModalDialogSteps.getDialog().should('be.visible');
    });

    it('Should redirect to templates catalog view when repository is changed', () => {
        // When I visit 'Sparql create template' view
        // When I change the repository.
        RepositorySelectorSteps.selectRepository(secondRepositoryId);
        // Then I expect to be redirected to templates catalog view.
        SparqlTemplatesSteps.verifyUrl();
        SparqlTemplatesSteps.getSparqlTemplatesListContainer().should('be.visible');
    });

    it('should ask for confirmation when try to save sparql template with already existing template id', () => {
        // When I visit 'Sparql create template' view,
        // create a SPARQL template
        const templateName = 'http://' + Date.now();
        SparqlCreateUpdateSteps.typeTemplateId(templateName);
        SparqlCreateUpdateSteps.clickOnSaveButton();
        SparqlTemplatesSteps.verifyUrl();

        // When try to create a template with same template IRI
        SparqlCreateUpdateSteps.visit();
        SparqlCreateUpdateSteps.typeTemplateId(templateName);
        SparqlCreateUpdateSteps.clickOnSaveButton();

        // Then I expect to see confirm dialog.
        ModalDialogSteps.getDialogHeader().contains('Confirm save');
        ModalDialogSteps.getDialogBody().contains('Do you want to override the template query?');

        // When I click on cancel button.
        ModalDialogSteps.clickOnCancelButton();

        // Then I expect template to not be saved and stay on sparql template create view.
        SparqlCreateUpdateSteps.verifyUrl();
    });
});
