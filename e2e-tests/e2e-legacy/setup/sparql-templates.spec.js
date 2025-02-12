import {SparqlTemplatesSteps} from "../../steps/setup/sparql-templates-steps";
import {SparqlCreateUpdateSteps} from "../../steps/setup/sparql-create-update-steps";
import {ModalDialogSteps} from "../../steps/modal-dialog-steps";
import {ToasterSteps} from "../../steps/toaster-steps";

describe('SPARQL Templates', () => {

    let repositoryId;

    beforeEach(() => {
        repositoryId = 'sparql-templates-repo' + Date.now();
        cy.createRepository({id: repositoryId});
        cy.presetRepository(repositoryId);
        SparqlTemplatesSteps.visit();
    });

    afterEach(() => {
        cy.deleteRepository(repositoryId);
    });

    it('should not create a SPARQL template if cancel button is clicked', () => {
        // When I visit 'Sparql templates' view,
        // and click on create template button.
        SparqlTemplatesSteps.clickOnCreateSparqlTemplateButton();

        // Then, I expect to be navigated to "Sparql create template" view.
        SparqlCreateUpdateSteps.verifyUrl();

        // When I click on button cancel.
        SparqlCreateUpdateSteps.clickOnCancelButton();

        // Then, I expect to be navigated to "Sparql templates" view,
        SparqlTemplatesSteps.verifyUrl();
        // and expect that no query has been created.
        SparqlTemplatesSteps.getSparqlTemplates().should('have.length', 0);
        SparqlTemplatesSteps.getNoTemplateDefinedElement().should('contain.text', 'No templates are defined');
    });

    // TODO: Fix me. Broken due to migration (Error: unknown)
    it.skip('should create a query and delete it', () => {
        // When I visit 'Sparql templates' view,
        // and click on create template button.
        SparqlTemplatesSteps.clickOnCreateSparqlTemplateButton();

        // Then, I expect to be navigated to "Sparql create template" view.
        SparqlCreateUpdateSteps.verifyUrl();

        const templateId = `http://test-${Date.now()}`;
        // When I fill template id,
        SparqlCreateUpdateSteps.typeTemplateId(templateId);

        // and click on save button.
        SparqlCreateUpdateSteps.clickOnSaveButton();

        // Then, I expect to be navigated to "Sparql templates" view,
        SparqlTemplatesSteps.verifyUrl();
        // and expect a query has been created.
        SparqlTemplatesSteps.getSparqlTemplates().should('have.length', 1);
        SparqlTemplatesSteps.getNoTemplateDefinedElement().should('not.exist');
        SparqlTemplatesSteps.getSparqlTemplate(templateId).should('exist');

        // When I try to delete the query.
        SparqlTemplatesSteps.deleteTemplate(templateId);

        // Then I expect to see Warning dialog,
        ModalDialogSteps.getDialogHeader().contains('Warning');
        ModalDialogSteps.getDialogBody().contains(`Are you sure you want to delete the SPARQL template '${templateId}'?`);

        // When click on close button
        ModalDialogSteps.clickOnCloseButton();

        //Then I expect query to be not deleted.
        SparqlTemplatesSteps.getSparqlTemplate(templateId).should('exist');

        // When confirm dialog is open,
        SparqlTemplatesSteps.deleteTemplate(templateId);
        // and click on cancel button.
        ModalDialogSteps.clickOnCancelButton();

        //Then I expect query to be not deleted.
        SparqlTemplatesSteps.getSparqlTemplate(templateId).should('exist');

        // When confirm dialog is open,
        SparqlTemplatesSteps.deleteTemplate(templateId);
        // and click on confirm button.
        ModalDialogSteps.clickOnConfirmButton();

        // Then, I expect to be navigated to "Sparql templates" view,
        SparqlTemplatesSteps.verifyUrl();
        // and expect that no query has been created.
        SparqlTemplatesSteps.getSparqlTemplates().should('have.length', 0);
        SparqlTemplatesSteps.getNoTemplateDefinedElement().should('contain.text', 'No templates are defined');

        ToasterSteps.verifyTitle('Deleted successfully SPARQL template');
        ToasterSteps.verifySuccess(templateId);
    });
});
