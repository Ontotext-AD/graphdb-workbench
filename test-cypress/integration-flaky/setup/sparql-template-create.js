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
});
